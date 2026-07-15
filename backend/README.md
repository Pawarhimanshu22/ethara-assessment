# Ethara Backend — FastAPI

REST API for the Ethara Seat Allocation & Project Mapping System.

Stack: FastAPI · SQLAlchemy 2.0 · PostgreSQL · Alembic · Pydantic v2 · JWT (python-jose + passlib/bcrypt) · pytest.

## Architecture (layered)

```
app/
├── api/v1/        HTTP routers (employees, projects, seats, dashboard, auth, ai)
├── api/deps.py    DI: get_db, get_current_user, require_roles / require_hr_or_admin
├── services/      business logic (allocation rules, AI parser, dashboard aggregation)
├── repositories/  DB access (CRUD, search, locking helpers)
├── models/        SQLAlchemy models (employee, project, seat, seat_allocation, user)
├── schemas/       Pydantic request/response models
├── core/          config, database, security, exceptions
└── main.py        app factory + router registration + CORS
```

## Run

```bash
uv venv --python 3.12 .venv && source .venv/bin/activate
uv pip install -r requirements.txt
cp .env.example .env                 # edit if needed

alembic upgrade head                 # schema
python -m scripts.seed_db            # demo data + demo users

uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Environment

See `.env.example`. Key vars: `DATABASE_URL`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, `AI_PROVIDER`
(`fallback` = built-in rule-based assistant, no external key needed).

## Seed data

`python -m scripts.seed_db` (idempotent) creates 11 projects, 5,600 seats
(≈4,940 occupied / 120 reserved / 540 available), 5,000 employees (60 pending allocation), the
matching active seat allocations, and 3 demo login users (Admin/HR/Employee — credentials printed on
completion).

## Tests

```bash
pytest        # runs against ethara_test_db (create it first, same owner as ethara_db)
```

## Docker

`docker compose up` brings up Postgres + the API. `docker compose up -d db` starts only the database.
