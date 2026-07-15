# Database Schema — Ethara Seat Allocation & Project Mapping System

PostgreSQL, modelled with SQLAlchemy 2.0 (`backend/app/models/`). Five tables:
`projects`, `employees`, `seats`, `seat_allocations`, `users`.

---

## Entity-relationship overview

```
projects 1 ───< employees        (an employee is mapped to one project)
projects 1 ───< seat_allocations  (an allocation records the project at allocation time)
employees 1 ──< seat_allocations  (history of a person's allocations; one ACTIVE at a time)
seats     1 ──< seat_allocations  (history for a seat; one ACTIVE at a time)
users        ──  optional link to an employee (login accounts)
```

`seat_allocations` is a **history/junction table** — every allocate or release writes a row.
"Current" state is the row with `allocation_status = ACTIVE`.

---

## `projects`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| name | varchar(100) | unique |
| description | varchar(500) | nullable |
| manager_name | varchar(100) | nullable |
| status | enum `ProjectStatus` | `ACTIVE` \| `CLOSED` |
| preferred_floor | int | nullable — used by new-joiner allocation |
| preferred_zone | varchar(20) | nullable — used by new-joiner allocation |
| created_at | timestamptz | |

## `employees`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| employee_code | varchar(20) | unique, indexed (e.g. `EMP00001`) |
| name | varchar(100) | indexed |
| email | varchar | **unique** (business rule 6) |
| department | varchar(100) | nullable |
| role | varchar(100) | nullable |
| joining_date | date | |
| status | enum `EmployeeStatus` | `ACTIVE` \| `INACTIVE` \| `PENDING_ALLOCATION` |
| project_id | int FK → projects.id | nullable |
| created_at / updated_at | timestamptz | |

## `seats`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| floor | int | |
| zone | varchar | e.g. `A`…`J` |
| bay | varchar | e.g. `Bay1` |
| seat_number | varchar | e.g. `B2-014` |
| status | enum `SeatStatus` | `AVAILABLE` \| `OCCUPIED` \| `RESERVED` \| `MAINTENANCE` |
| created_at | timestamptz | |
| | | **Unique:** (`floor`, `zone`, `seat_number`) — business rule 7 |

## `seat_allocations`  (history)
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| employee_id | int FK → employees.id | |
| seat_id | int FK → seats.id | |
| project_id | int FK → projects.id | project at time of allocation |
| allocation_status | enum `AllocationStatus` | `ACTIVE` \| `RELEASED` |
| allocation_date | timestamptz | server default now() |
| released_date | timestamptz | set on release |
| | | **Indexes:** (`employee_id`, `allocation_status`), (`seat_id`, `allocation_status`) |

## `users`  (login accounts)
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | |
| email | varchar | unique |
| hashed_password | varchar | bcrypt |
| role | enum `UserRole` | `ADMIN` \| `HR` \| `EMPLOYEE` |
| employee_id | int FK → employees.id | nullable |

---

## How the business rules are enforced

1. **One active seat per employee** & **2. one active employee per seat** —
   application checks + `SELECT ... FOR UPDATE` row locks + a re-check under lock, backed by the
   `(employee_id, allocation_status)` / `(seat_id, allocation_status)` indexes and an
   `IntegrityError` rollback for races.
3. **Released seats become available** — release sets the allocation to `RELEASED` (+ `released_date`)
   and the seat back to `AVAILABLE`.
4. **Reserved/Maintenance can't be allocated** — allocation only proceeds when `status = AVAILABLE`.
5. **New joiners seated near their team** — preferred floor+zone → same floor → any floor fallback.
6. **Unique employee email** — DB unique + service pre-check.
7. **Unique seat per floor/zone** — DB unique constraint.
8. **Dashboard updates immediately** — reads are live aggregate queries, no cached counters.

---

## Applying the schema

- **Locally / deploy:** `python -m scripts.bootstrap` (creates tables via `Base.metadata.create_all`
  and seeds if empty), or `alembic upgrade head` once the migration is regenerated.
- **Inspect:** `psql -d ethara_db -c "\d+ seat_allocations"`.

Enum values are stored **UPPERCASE** (the SQLAlchemy enums use `value == name`), which the frontend
normalizes at the service boundary.
