# API Documentation — Ethara Seat Allocation & Project Mapping System

- **Base URL (local):** `http://localhost:8000`
- **Base URL (live):** `https://ethara-backend-9kbg.onrender.com`
- **All routes are under** `/api/v1`
- **Interactive docs (Swagger UI):** [`/docs`](https://ethara-backend-9kbg.onrender.com/docs) ·
  OpenAPI JSON at `/openapi.json`

## Authentication
JWT Bearer. Log in to get a token, then send `Authorization: Bearer <token>`.
Write operations on employees/projects/seats require an **Admin** or **HR** token. Reads are public.

```bash
curl -X POST https://ethara-backend-9kbg.onrender.com/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@ethara.ai","password":"Admin@123"}'
# → { "access_token": "...", "token_type": "bearer", "user": {...} }
```

Error envelope for all failures: `{ "success": false, "error_code": "...", "message": "..." }`.

---

## Auth
| Method | Path | Body / Notes |
|--------|------|--------------|
| POST | `/auth/login` | `{ email, password }` → `{ access_token, token_type, user }` |
| GET | `/auth/me` | Bearer token → current user |

## Employees
| Method | Path | Notes |
|--------|------|-------|
| POST | `/employees` | *(HR/Admin)* create — `{ employee_code, name, email, department, role, joining_date, project_id, status? }` |
| GET | `/employees` | list. Query: `search`, `project_id`, `status`, `page`, `page_size`. Returns `{ total, page, page_size, items }` |
| GET | `/employees/{id}` | detail |
| PUT | `/employees/{id}` | *(HR/Admin)* update |
| DELETE | `/employees/{id}` | *(HR/Admin)* deactivate (soft delete; releases seat) |

`EmployeeResponse` is enriched with `project_name`, `seat_number`, `seat_floor`, `seat_zone`, `seat_bay`.

## Projects
| Method | Path | Notes |
|--------|------|-------|
| POST | `/projects` | *(HR/Admin)* create — `{ name, description?, manager_name?, preferred_floor?, preferred_zone? }` |
| GET | `/projects` | list. Query: `status`, `page`, `page_size` |
| GET | `/projects/{id}` | detail |
| GET | `/projects/{id}/employees` | members (array) |
| PUT | `/projects/{id}` | *(HR/Admin)* update |
| DELETE | `/projects/{id}` | *(HR/Admin)* close (status → CLOSED) |

`ProjectResponse` is enriched with `employee_count`, `allocated_seats`, `floor_count`.

## Seats
| Method | Path | Notes |
|--------|------|-------|
| POST | `/seats` | *(HR/Admin)* create — `{ floor, zone, bay, seat_number, status? }` |
| GET | `/seats` | list. Query: `floor`, `zone`, `status`, `page`, `page_size` |
| GET | `/seats/available` | available seats. Query: `floor`, `zone`, `limit` |
| POST | `/seats/allocate` | `{ employee_id, seat_id?, project_id? }` — omit `seat_id` to auto-suggest near the team |
| POST | `/seats/release` | `{ employee_id }` — frees that employee's active seat |

## Dashboard
| Method | Path | Returns |
|--------|------|---------|
| GET | `/dashboard/summary` | `total_employees, total_seats, occupied_seats, available_seats, reserved_seats, maintenance_seats, pending_new_joiners` |
| GET | `/dashboard/project-utilization` | per-project seat allocation |
| GET | `/dashboard/floor-utilization` | per-floor occupancy (`occupancy_percentage`) |

## AI Assistant
| Method | Path | Notes |
|--------|------|-------|
| POST | `/ai/query` | `{ query, email? }` → `{ answer, intent_detected }` |
| GET | `/ai/examples` | suggested prompts built from real seeded data |

Supported intents: seat lookup ("Where is *X* seated?"), project lookup, available seats by floor,
project occupancy, nearby colleagues, workspace summary, pending new-joiner count.

---

## Enum values (stored UPPERCASE)
- `EmployeeStatus`: `ACTIVE`, `INACTIVE`, `PENDING_ALLOCATION`
- `SeatStatus`: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`
- `ProjectStatus`: `ACTIVE`, `CLOSED`
- `AllocationStatus`: `ACTIVE`, `RELEASED`
- `UserRole`: `ADMIN`, `HR`, `EMPLOYEE`

## Example requests
```bash
BASE=https://ethara-backend-9kbg.onrender.com/api/v1

# Dashboard summary
curl $BASE/dashboard/summary

# Search employees on a project
curl "$BASE/employees?search=amit&status=ACTIVE&page_size=10"

# Allocate a seat (auto-suggest near team)
curl -X POST $BASE/seats/allocate -H 'Content-Type: application/json' \
  -d '{"employee_id": 42}'

# Ask the assistant
curl -X POST $BASE/ai/query -H 'Content-Type: application/json' \
  -d '{"query":"Show available seats on Floor 3"}'
```
