import re
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.models.employee import Employee, EmployeeStatus
from app.models.seat import Seat, SeatStatus
from app.models.seat_allocation import SeatAllocation, AllocationStatus
from app.models.project import Project
from app.repositories import employee_repo, allocation_repo
from app.schemas.ai_query import AIQueryResponse

# Words that never help identify an employee or project.
STOPWORDS = {
    "where", "is", "the", "of", "a", "an", "seat", "seated", "sitting", "sit",
    "desk", "located", "location", "which", "what", "who", "whom", "assigned",
    "project", "projects", "to", "in", "on", "at", "for", "near", "around",
    "next", "my", "me", "i", "am", "are", "does", "do", "how", "many", "much",
    "show", "list", "find", "tell", "give", "and", "with", "employee", "employees",
    "person", "colleague", "colleagues", "occupied", "available", "reserved",
    "floor", "zone", "bay", "team", "member", "members", "allocation", "allocated",
    "utilization", "utilisation", "please", "can", "you", "us", "about", "current",
    "currently", "there", "any", "all", "number", "count", "total", "summary",
    "dashboard", "overview", "has", "have", "his", "her", "their", "they",
}


def answer_query(db: Session, query: str, email: str | None = None) -> AIQueryResponse:
    """
    Rule-based intent parser (fallback assistant — no external API needed).
    Robust entity extraction against the live DB so it works with real seeded data.
    """
    text = (query or "").lower().strip()
    if not text:
        return _unknown()

    project = _extract_project(db, text)

    # --- Available seats: "show available seats on floor 3" ---
    if "available" in text and ("seat" in text or "floor" in text or "zone" in text):
        return _handle_available_seats(db, text)

    # --- Project occupancy / utilization: "how many seats occupied for Indigo" ---
    if project and _matches(text, ["occupied", "how many", "utiliz", "seats", "occupancy", "members", "team", "size"]):
        return _handle_project_occupancy(db, project, text)

    # --- Nearby colleagues: "who is sitting near <name>" ---
    if _matches(text, ["near", "next to", "around", "beside"]):
        return _handle_nearby(db, text, email)

    # --- Project assignment: "which project is <name> assigned to" ---
    if _matches(text, ["assigned", "which project", "what project", "mapped", "belong"]) and "project" in text:
        return _handle_project_lookup(db, text, email)

    # --- Seat lookup: "where is <name> seated" ---
    if _matches(text, ["where", "seat", "seated", "sitting", "located", "desk", "find"]):
        return _handle_seat_lookup(db, text, email)

    # --- Dashboard summary ---
    if _matches(text, ["summary", "total", "dashboard", "overview", "how many seats", "occupancy"]):
        return _handle_summary(db)

    # --- Pending / new joiners ---
    if _matches(text, ["pending", "new joiner", "unallocated", "not allocated", "waiting"]):
        return _handle_pending(db)

    # If an employee is clearly named, default to seat lookup.
    if _extract_employee(db, text, email):
        return _handle_seat_lookup(db, text, email)

    return _unknown()


# ---------------------------------------------------------------- helpers

def _matches(text: str, keywords: list[str]) -> bool:
    return any(k in text for k in keywords)


def _tokens(text: str) -> list[str]:
    return [t for t in re.findall(r"[a-zA-Z]+", text.lower()) if t not in STOPWORDS and len(t) >= 2]


def _extract_employee(db: Session, text: str, email: str | None) -> Employee | None:
    # Explicit email wins (e.g. "where is my seat" + logged-in email).
    if email:
        emp = employee_repo.get_by_email(db, email)
        if emp:
            return emp

    # Also detect an email embedded in the query text.
    m = re.search(r"[\w.\-]+@[\w.\-]+", text)
    if m:
        emp = employee_repo.get_by_email(db, m.group(0))
        if emp:
            return emp

    tokens = _tokens(text)
    if not tokens:
        return None

    conds = [Employee.name.ilike(f"%{t}%") for t in tokens]
    candidates = db.query(Employee).filter(or_(*conds)).limit(80).all()
    if not candidates:
        return None

    def score(emp: Employee) -> int:
        name = emp.name.lower()
        return sum(1 for t in tokens if t in name)

    best = max(candidates, key=score)
    return best if score(best) >= 1 else None


def _extract_project(db: Session, text: str) -> Project | None:
    projects = db.query(Project).all()  # small set (~11)
    tl = text.lower()
    # Direct name match first.
    for p in projects:
        if p.name.lower() in tl:
            return p
    # Token overlap fallback.
    best, best_score = None, 0
    for p in projects:
        score = sum(1 for w in re.findall(r"[a-z]+", p.name.lower()) if len(w) >= 3 and w in tl)
        if score > best_score:
            best, best_score = p, score
    return best if best_score > 0 else None


def _current_seat(db: Session, employee: Employee) -> Seat | None:
    allocation = allocation_repo.get_active_by_employee(db, employee.id)
    return allocation.seat if allocation else None


def _bay(bay) -> str:
    return re.sub(r"^bay\s*", "", str(bay or ""), flags=re.I)


def _unknown() -> AIQueryResponse:
    return AIQueryResponse(
        answer=(
            "I couldn't quite understand that. Try:\n"
            "• \"Where is [employee name] seated?\"\n"
            "• \"Which project is [name] assigned to?\"\n"
            "• \"Show available seats on Floor 3\"\n"
            "• \"How many seats are occupied for [project]?\"\n"
            "• \"Who is sitting near [name]?\""
        ),
        intent_detected="unknown",
    )


# ---------------------------------------------------------------- intents

def _handle_seat_lookup(db: Session, text: str, email: str | None) -> AIQueryResponse:
    employee = _extract_employee(db, text, email)
    if not employee:
        return AIQueryResponse(
            answer="I couldn't find that employee. Please check the name (or include their email).",
            intent_detected="find_seat",
        )
    seat = _current_seat(db, employee)
    if not seat:
        return AIQueryResponse(
            answer=f"{employee.name} does not currently have a seat allocated (status: {employee.status.value.lower()}).",
            intent_detected="find_seat",
        )
    project_text = f" They are assigned to Project {employee.project.name}." if employee.project else ""
    return AIQueryResponse(
        answer=(
            f"{employee.name} is seated on Floor {seat.floor}, Zone {seat.zone}, "
            f"Bay {_bay(seat.bay)}, Seat {seat.seat_number}.{project_text}"
        ),
        intent_detected="find_seat",
    )


def _handle_project_lookup(db: Session, text: str, email: str | None) -> AIQueryResponse:
    employee = _extract_employee(db, text, email)
    if not employee:
        return AIQueryResponse(
            answer="I couldn't find that employee. Please check the name or include their email.",
            intent_detected="project_lookup",
        )
    if not employee.project:
        return AIQueryResponse(
            answer=f"{employee.name} is not currently mapped to any project.",
            intent_detected="project_lookup",
        )
    return AIQueryResponse(
        answer=f"{employee.name} is assigned to Project {employee.project.name} ({employee.department or 'team'}, {employee.role or 'member'}).",
        intent_detected="project_lookup",
    )


def _handle_available_seats(db: Session, text: str) -> AIQueryResponse:
    floor_match = re.search(r"floor\s*(\d+)", text)
    zone_match = re.search(r"zone\s*([a-z0-9]+)", text)

    q = db.query(Seat).filter(Seat.status == SeatStatus.AVAILABLE)
    where = ""
    if floor_match:
        q = q.filter(Seat.floor == int(floor_match.group(1)))
        where += f" on Floor {floor_match.group(1)}"
    if zone_match:
        q = q.filter(Seat.zone == zone_match.group(1).upper())
        where += f", Zone {zone_match.group(1).upper()}"

    count = q.count()
    if count == 0:
        return AIQueryResponse(
            answer=f"There are no available seats{where or ''} right now.",
            intent_detected="available_seats",
        )
    sample = q.limit(5).all()
    seat_list = ", ".join(f"{s.seat_number} (Floor {s.floor}/{s.zone})" for s in sample)
    return AIQueryResponse(
        answer=f"There are {count} available seats{where}. For example: {seat_list}.",
        intent_detected="available_seats",
    )


def _handle_project_occupancy(db: Session, project: Project, text: str) -> AIQueryResponse:
    occupied = (
        db.query(func.count(SeatAllocation.id))
        .filter(SeatAllocation.project_id == project.id, SeatAllocation.allocation_status == AllocationStatus.ACTIVE)
        .scalar()
    )
    members = (
        db.query(func.count(Employee.id))
        .filter(Employee.project_id == project.id, Employee.status != EmployeeStatus.INACTIVE)
        .scalar()
    )
    mgr = f" Manager: {project.manager_name}." if project.manager_name else ""
    return AIQueryResponse(
        answer=(
            f"Project {project.name} has {occupied} seats occupied and {members} mapped team members.{mgr}"
        ),
        intent_detected="project_occupancy",
    )


def _handle_nearby(db: Session, text: str, email: str | None) -> AIQueryResponse:
    employee = _extract_employee(db, text, email)
    if not employee:
        return AIQueryResponse(
            answer="I couldn't find that employee. Tell me a name (or your email) and I'll find who sits nearby.",
            intent_detected="nearby",
        )
    seat = _current_seat(db, employee)
    if not seat:
        return AIQueryResponse(
            answer=f"{employee.name} doesn't have a seat allocated yet, so there are no neighbours to show.",
            intent_detected="nearby",
        )
    neighbours = (
        db.query(SeatAllocation)
        .join(Seat, SeatAllocation.seat_id == Seat.id)
        .filter(
            Seat.floor == seat.floor,
            Seat.zone == seat.zone,
            SeatAllocation.allocation_status == AllocationStatus.ACTIVE,
            SeatAllocation.employee_id != employee.id,
        )
        .limit(6)
        .all()
    )
    if not neighbours:
        return AIQueryResponse(
            answer=f"No one else is seated near {employee.name} (Floor {seat.floor}, Zone {seat.zone}) right now.",
            intent_detected="nearby",
        )
    names = ", ".join(a.employee.name for a in neighbours if a.employee)
    return AIQueryResponse(
        answer=f"Seated near {employee.name} (Floor {seat.floor}, Zone {seat.zone}): {names}.",
        intent_detected="nearby",
    )


def _handle_summary(db: Session) -> AIQueryResponse:
    total_emp = db.query(func.count(Employee.id)).scalar()
    total_seats = db.query(func.count(Seat.id)).scalar()
    occupied = db.query(func.count(Seat.id)).filter(Seat.status == SeatStatus.OCCUPIED).scalar()
    available = db.query(func.count(Seat.id)).filter(Seat.status == SeatStatus.AVAILABLE).scalar()
    reserved = db.query(func.count(Seat.id)).filter(Seat.status == SeatStatus.RESERVED).scalar()
    return AIQueryResponse(
        answer=(
            f"Ethara has {total_emp:,} employees and {total_seats:,} seats — "
            f"{occupied:,} occupied, {available:,} available, {reserved:,} reserved."
        ),
        intent_detected="summary",
    )


def _handle_pending(db: Session) -> AIQueryResponse:
    pending = (
        db.query(func.count(Employee.id))
        .filter(Employee.status == EmployeeStatus.PENDING_ALLOCATION)
        .scalar()
    )
    return AIQueryResponse(
        answer=(
            f"There are {pending} new joiners pending seat allocation. "
            "Open New Joiner Allocation to seat them near their teams."
        ),
        intent_detected="pending",
    )


# ---------------------------------------------------------------- examples

def example_queries(db: Session) -> list[str]:
    """Build suggested prompts from REAL seeded data so the chips actually work."""
    examples: list[str] = []

    emp = (
        db.query(Employee)
        .join(SeatAllocation, SeatAllocation.employee_id == Employee.id)
        .filter(SeatAllocation.allocation_status == AllocationStatus.ACTIVE)
        .first()
    )
    if emp:
        examples.append(f"Where is {emp.name} seated?")
        examples.append(f"Who is sitting near {emp.name.split()[0]}?")

    project = db.query(Project).filter(Project.status == "ACTIVE").first()
    if project:
        examples.append(f"How many seats are occupied for {project.name}?")

    examples.append("Show available seats on Floor 3")

    if not examples:
        examples = [
            "Show available seats on Floor 3",
            "How many seats are occupied?",
            "How many new joiners are pending?",
        ]
    return examples[:4]
