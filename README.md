# Ethara — Seat Allocation & Project Mapping System

A full-stack application that manages seat allocation and project mapping for ~5,000 employees at
Ethara. Employees, HR, Admin and Project teams can quickly find where an employee sits, which project
they belong to, which seats are free, and can allocate seats to new joiners near their teams — plus a
natural-language AI assistant for ad-hoc questions.

- **Backend:** Python · FastAPI · SQLAlchemy 2.0 · PostgreSQL · Alembic · JWT auth
- **Frontend:** React 19 · Vite · Tailwind CSS v4 · Zustand · React Router 7 · Axios · Recharts
- **AI Assistant:** rule-based intent parser over the live database (no external API key required)

---

## Repository layout

```
ethara/
├── backend/     FastAPI service (app/, alembic/, scripts/, tests/)
└── frontend/    React + Vite SPA (src/)
```

Backend architecture is layered: `api/v1` routers → `services` (business logic) → `repositories`
(DB access) → `models` (SQLAlchemy). Request/response shapes are Pydantic schemas.

---

## Prerequisites

- Python 3.12+ and [uv](https://github.com/astral-sh/uv) (or plain `venv`/`pip`)
- Node.js 18+ and npm
- PostgreSQL 14+ running locally (or via Docker)

---

## 1. Database

Create the app role and databases (matches the default `DATABASE_URL`):

```sql
CREATE ROLE ethara_user LOGIN PASSWORD 'ethara_pass' CREATEDB;
CREATE DATABASE ethara_db      OWNER ethara_user;
CREATE DATABASE ethara_test_db OWNER ethara_user;   -- used by the test suite
```

> Or use Docker: `cd backend && docker compose up -d db` (Postgres on `localhost:5432`).

---

## 2. Backend

```bash
cd backend
cp .env.example .env            # then review values (see below)
uv venv --python 3.12 .venv     # or: python3.12 -m venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt   # or: pip install -r requirements.txt

alembic upgrade head            # create the schema
python -m scripts.seed_db       # seed demo data (5k employees, 5.6k seats, 11 projects)

uvicorn app.main:app --reload --port 8000
```

Backend runs at **http://localhost:8000** · interactive API docs (Swagger) at **http://localhost:8000/docs**.

### Backend environment (`backend/.env`)

```
DATABASE_URL=postgresql://ethara_user:ethara_pass@localhost:5432/ethara_db
JWT_SECRET_KEY=dev-secret-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
AI_PROVIDER=fallback            # "fallback" (rule-based) — no external key needed
OPENAI_API_KEY=
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 3. Frontend

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env
npm run dev -- --port 5173
```

Frontend runs at **http://localhost:5173**.

---

## Demo credentials

| Role     | Email                          | Password       | Access               |
|----------|--------------------------------|----------------|----------------------|
| Admin    | `admin@ethara.ai`              | `Admin@123`    | Full write           |
| HR       | `hr@ethara.ai`                 | `Hr@12345`     | Full write           |
| Employee | `daniel.brennan101@ethara.ai`  | `Employee@123` | Read-only            |

> The exact seeded Employee email is printed by `scripts/seed_db.py` on each run.

---

## API endpoints (base `/api/v1`)

**Auth** — `POST /auth/login`, `GET /auth/me`
**Employees** — `POST /employees`, `GET /employees`, `GET /employees/{id}`, `PUT /employees/{id}`, `DELETE /employees/{id}`
**Projects** — `POST /projects`, `GET /projects`, `GET /projects/{id}`, `GET /projects/{id}/employees`, `PUT /projects/{id}`, `DELETE /projects/{id}`
**Seats** — `POST /seats`, `GET /seats`, `GET /seats/available`, `POST /seats/allocate`, `POST /seats/release`
**Dashboard** — `GET /dashboard/summary`, `GET /dashboard/project-utilization`, `GET /dashboard/floor-utilization`
**AI** — `POST /ai/query` (`{query, email?}` → `{answer, intent_detected}`), `GET /ai/examples`

Write operations on employees/projects/seats require an Admin/HR JWT. Full schemas at `/docs`.

---

## Core business rules (enforced)

1. One employee can hold only one active seat.
2. One seat can be allocated to only one active employee.
3. Released seats become Available again.
4. Reserved/Maintenance seats can't be allocated until their status changes.
5. New joiners are prioritised for available seats near their project team (preferred floor/zone →
   same floor → any floor).
6. Duplicate employee email is rejected.
7. Duplicate seat number on the same floor/zone is rejected.
8. The dashboard reflects allocations/releases immediately.

Rules 1 & 2 are enforced belt-and-braces: application checks + `SELECT ... FOR UPDATE` row locks +
partial unique indexes on active allocations, with `IntegrityError` rollback for races.

---

## AI Assistant

`POST /api/v1/ai/query` runs a rule-based intent parser directly over the database — no external API
key required (set `AI_PROVIDER=fallback`). Supported intents:

- Seat lookup — "Where is *[name]* seated?"
- Project lookup — "Which project is *[name]* assigned to?"
- Available seats — "Show available seats on Floor 3"
- Project occupancy — "How many seats are occupied for *[project]*?"
- Nearby colleagues — "Who is sitting near *[name]*?"
- Workspace summary & pending new-joiner counts

`GET /api/v1/ai/examples` returns suggested prompts built from real seeded data so the UI chips always
resolve.

---

## Database schema

Managed by SQLAlchemy models (`backend/app/models/`) and Alembic
(`backend/alembic/versions/`). Tables: `employees`, `projects`, `seats`, `seat_allocations`, `users`.
Regenerate/apply with `alembic upgrade head`; inspect with `psql -d ethara_db -c "\d+ <table>"`.

---

## Tests

```bash
cd backend && source .venv/bin/activate
pytest            # uses ethara_test_db
```

---

## Documentation

- `AI_PROMPTS.md` — prompts used, what the AI got right/wrong, manual fixes, verification.
- `backend/README.md` — backend quickstart.
- Swagger UI — `http://localhost:8000/docs`.
