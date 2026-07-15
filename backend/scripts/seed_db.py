"""
Seed script — generates realistic demo data matching assessment volumes:
  - 5,000 employees
  - 5 floors x 10 zones = 5,600 seats
  - 11 projects
  - >= 500 available seats, >= 100 reserved seats, >= 50 pending-allocation employees

Run with:  python -m scripts.seed_db
"""
import sys
import os
import random
from datetime import date, timedelta

sys.path.append(os.getcwd())

from faker import Faker
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.project import Project, ProjectStatus
from app.models.seat import Seat, SeatStatus
from app.models.employee import Employee, EmployeeStatus
from app.models.seat_allocation import SeatAllocation, AllocationStatus
from app.models.user import User, UserRole

fake = Faker()
Faker.seed(42)
random.seed(42)

# ---- Configurable volumes (matches assessment spec minimums) ----
TOTAL_EMPLOYEES = 5000
FLOORS = [1, 2, 3, 4, 5]
ZONES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
SEATS_PER_ZONE = 112          # 5 floors x 10 zones x 112 = 5,600 total seats
TARGET_AVAILABLE = 550
TARGET_RESERVED = 120
TARGET_PENDING_EMPLOYEES = 60  # employees left without a seat

PROJECT_NAMES = [
    "Indigo", "Indreed", "Mydreed", "Preed", "Serfy",
    "Oreed", "bedegreed", "Opreed", "Serry", "Kaary", "Mered",
]

DEPARTMENTS = ["Engineering", "QA", "DevOps", "Product", "Design", "HR", "Finance", "Support"]
ROLES = ["Software Engineer", "Senior Engineer", "QA Engineer", "Team Lead", "Analyst", "Manager"]


def seed():
    print("Creating tables (if not already present)...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ---------- 1. Wipe existing data (idempotent re-seed) ----------
        print("Clearing existing data...")
        db.query(SeatAllocation).delete()
        db.query(Employee).delete()
        db.query(Seat).delete()
        db.query(User).delete()
        db.query(Project).delete()
        db.commit()

        # ---------- 2. Projects ----------
        print(f"Creating {len(PROJECT_NAMES)} projects...")
        projects = []
        for name in PROJECT_NAMES:
            project = Project(
                name=name,
                description=f"{name} initiative",
                manager_name=fake.name(),
                status=ProjectStatus.ACTIVE,
                preferred_floor=random.choice(FLOORS),
                preferred_zone=random.choice(ZONES),
            )
            projects.append(project)
        db.add_all(projects)
        db.commit()
        for p in projects:
            db.refresh(p)

        # ---------- 3. Seats — assign statuses up front to hit exact targets ----------
        print(f"Creating {len(FLOORS) * len(ZONES) * SEATS_PER_ZONE} seats...")
        all_seats = []
        for floor in FLOORS:
            for zone in ZONES:
                for i in range(1, SEATS_PER_ZONE + 1):
                    seat = Seat(
                        floor=floor,
                        zone=zone,
                        bay=f"Bay{((i - 1) // 10) + 1}",
                        seat_number=f"{zone}{floor}-{i:03d}",
                        status=SeatStatus.AVAILABLE,  # placeholder, reassigned below
                    )
                    all_seats.append(seat)

        random.shuffle(all_seats)
        total_seats = len(all_seats)

        # Employees who WILL be allocated (rest are AVAILABLE/RESERVED/MAINTENANCE)
        employees_to_allocate = TOTAL_EMPLOYEES - TARGET_PENDING_EMPLOYEES
        occupied_target = employees_to_allocate

        idx = 0
        occupied_seats = all_seats[idx: idx + occupied_target]
        idx += occupied_target

        reserved_seats = all_seats[idx: idx + TARGET_RESERVED]
        idx += TARGET_RESERVED

        available_seats = all_seats[idx: idx + TARGET_AVAILABLE]
        idx += TARGET_AVAILABLE

        maintenance_seats = all_seats[idx:]  # remainder

        for s in occupied_seats:
            s.status = SeatStatus.OCCUPIED
        for s in reserved_seats:
            s.status = SeatStatus.RESERVED
        for s in available_seats:
            s.status = SeatStatus.AVAILABLE
        for s in maintenance_seats:
            s.status = SeatStatus.MAINTENANCE

        db.bulk_save_objects(all_seats, return_defaults=True)
        db.commit()
        print(
            f"  -> occupied={len(occupied_seats)}, reserved={len(reserved_seats)}, "
            f"available={len(available_seats)}, maintenance={len(maintenance_seats)}, total={total_seats}"
        )

        # Re-fetch seats marked OCCUPIED (need their real IDs post-insert)
        occupied_seat_rows = db.query(Seat).filter(Seat.status == SeatStatus.OCCUPIED).all()

        # ---------- 4. Employees ----------
        print(f"Creating {TOTAL_EMPLOYEES} employees...")
        used_emails = set()
        employees = []

        for i in range(1, TOTAL_EMPLOYEES + 1):
            first, last = fake.first_name(), fake.last_name()
            email = f"{first.lower()}.{last.lower()}{i}@ethara.ai"
            used_emails.add(email)

            is_pending = i <= TARGET_PENDING_EMPLOYEES  # first N employees are new joiners, unallocated
            employee = Employee(
                employee_code=f"EMP{i:05d}",
                name=f"{first} {last}",
                email=email,
                department=random.choice(DEPARTMENTS),
                role=random.choice(ROLES),
                joining_date=fake.date_between(start_date="-3y", end_date="today" if not is_pending else "+0d"),
                project_id=random.choice(projects).id,
                status=EmployeeStatus.PENDING_ALLOCATION if is_pending else EmployeeStatus.ACTIVE,
            )
            employees.append(employee)

        db.bulk_save_objects(employees, return_defaults=True)
        db.commit()
        print(f"  -> pending_allocation={TARGET_PENDING_EMPLOYEES}, active={TOTAL_EMPLOYEES - TARGET_PENDING_EMPLOYEES}")

        # Re-fetch employees that need seat allocations (ACTIVE ones)
        active_employees = db.query(Employee).filter(Employee.status == EmployeeStatus.ACTIVE).all()

        # ---------- 5. Seat Allocations — link ACTIVE employees to OCCUPIED seats ----------
        print("Creating seat allocations...")
        allocations = []
        for employee, seat in zip(active_employees, occupied_seat_rows):
            allocations.append(SeatAllocation(
                employee_id=employee.id,
                seat_id=seat.id,
                project_id=employee.project_id,
                allocation_status=AllocationStatus.ACTIVE,
            ))
        db.bulk_save_objects(allocations)
        db.commit()
        print(f"  -> {len(allocations)} active allocations created")

        # ---------- 6. Demo login users (one per role) ----------
        print("Creating demo login users...")
        demo_users = [
            User(email="admin@ethara.ai", hashed_password=hash_password("Admin@123"), role=UserRole.ADMIN),
            User(email="hr@ethara.ai", hashed_password=hash_password("Hr@12345"), role=UserRole.HR),
            User(
                email=employees[100].email, hashed_password=hash_password("Employee@123"),
                role=UserRole.EMPLOYEE, employee_id=employees[100].id,
            ),
        ]
        db.add_all(demo_users)
        db.commit()

        print("\n✅ Seed complete.")
        print("Demo credentials:")
        print("  ADMIN    -> admin@ethara.ai / Admin@123")
        print("  HR       -> hr@ethara.ai / Hr@12345")
        print(f"  EMPLOYEE -> {employees[100].email} / Employee@123")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()