# AI_PROMPTS.md — Ethara Seat Allocation System

This project was built with AI assistance. Below are the prompts used at each stage, what the
AI produced correctly, what it got wrong, what was fixed manually, and how each was verified.

---

## Prompt 1 – Architecture / Planning
**Prompt used:**
"Design the architecture for a FastAPI + React seat allocation system for ~5,000 employees, covering
employees, projects, seats, seat allocations, a dashboard, and an AI assistant. Use a layered backend
(models → repositories → services → API) and a component-based React front end."

- **Correct:** Clean layered backend (models/schemas/repositories/services/api), sensible entity split
  (employee, project, seat, seat_allocation, user).
- **Incorrect:** Initially leaned toward extra abstraction (interface/impl splits) not needed at this scope.
- **Fixed:** Collapsed to single-file services/repositories per resource.
- **Verified by:** Cross-checked against the assessment PDF's required features and endpoints list.

## Prompt 2 – Database Design
**Prompt used:**
"Model the tables (employees, projects, seats, seat_allocations, users) with SQLAlchemy 2.0 and enforce
'one active seat per employee' and 'one active employee per seat' at the DB level."

- **Correct:** Table structure, relationships, and partial-unique-index approach for the one-active-seat rule.
- **Incorrect:** Bay stored as `"Bay1"` string, which later produced a "Bay Bay1" double-label in the UI.
- **Fixed:** Normalised the bay label at display time (strip the redundant prefix) across UI + AI output.
- **Verified by:** `alembic upgrade head`, then inspected tables with `psql \d`; seeded and queried counts.

## Prompt 3 – Backend APIs
**Prompt used:**
"Implement the required REST endpoints for employees, projects, seats (incl. allocate/release/available),
dashboard summaries, and auth, with role-based access for write operations."

- **Correct:** All endpoints, pagination, filtering, JWT auth, `require_roles` guards, typed exceptions.
- **Incorrect:** (a) The `ai` router was defined but never registered in `main.py`; (b) `ai.py`/`ai_service.py`
  imported `app.schemas.ai` while the file is `ai_query.py`; (c) list `page_size` caps (200/500) were below
  what the UI needed to render a full floor / dropdowns.
- **Fixed:** Registered the AI router, corrected the schema import, raised page-size caps to fit the data.
- **Verified by:** Hit every endpoint via curl + Swagger `/docs`; confirmed 200s and correct payloads.

## Prompt 4 – Seat Allocation Logic
**Prompt used:**
"Implement seat allocation that prevents double-booking under concurrency and auto-suggests seats near a
new joiner's project team (preferred floor/zone → same floor → any floor)."

- **Correct:** Zone → floor → any-floor fallback; `SELECT ... FOR UPDATE` row locking; re-check under lock;
  partial unique indexes as a final guard with `IntegrityError` rollback.
- **Incorrect:** Release endpoint originally expected `{seat_id}` while the schema required `employee_id`.
- **Fixed:** Aligned the release request body to `{employee_id}`.
- **Verified by:** `pytest tests/test_allocation.py` (occupied/reserved/duplicate/race) + manual allocate/release.

## Prompt 5 – AI Assistant
**Prompt used:**
"Build a rule-based natural-language assistant (no external API key) that answers: where an employee sits,
which project they're on, available seats by floor, project occupancy, who sits nearby, and summaries."

- **Correct:** Intent-based fallback parser that works with zero external dependency.
- **Incorrect:** First version matched names too loosely ("Donna Davis" resolved to "Donna Peck"), required the
  literal word "project" for occupancy, and the UI's suggested chips referenced names (Amit/Sara) not present
  in the seeded data.
- **Fixed:** Rewrote the parser with stopword-filtered, token-scored name matching and project-name detection
  that doesn't depend on the word "project"; added a `GET /ai/examples` endpoint that builds suggested chips
  from real seeded employees/projects so they always resolve.
- **Verified by:** curl tests across all intents against live data + clicking the suggested chips in the UI.

## Prompt 6 – Frontend
**Prompt used:**
"Implement the provided design handoff (Ethara Seat Allocation) in the existing React 19 + Vite +
Tailwind v4 + Zustand stack — same components/services, no new core libraries — wired to the real backend."

- **Correct:** Dark console sidebar, dashboard stat cards + charts, employee table + detail slide-over,
  project cards, seat grid with allocate modal, new-joiner flow, search, and AI chat — all wired to the real
  API services (no mock data).
- **Incorrect:** (a) `ToastProvider` was never mounted in `App.jsx`, so every page using `useToast` white-screened;
  (b) base CSS element rules (`a`, `h1–h6`) were written unlayered, so in Tailwind v4 they overrode utility text
  colors — the active sidebar link rendered indigo-on-indigo (invisible) and the login heading rendered dark-on-dark.
- **Fixed:** Mounted `ToastProvider` + `ToastContainer`; wrapped base styles in `@layer base` so utilities win;
  added explicit `text-white` where headings sit on dark/colored panels.
- **Verified by:** Drove the app in a real browser (login, dashboard, employees, seats, projects, AI), read the
  console for exceptions, and confirmed each screen renders and functions.

## Prompt 7 – Frontend ↔ Backend contract
**Prompt used:**
"Adversarially verify every field the frontend reads against the actual FastAPI response schemas and fix
mismatches."

- **Correct:** Base paths and list-wrapper handling.
- **Incorrect:** Enum casing (backend UPPERCASE vs FE lowercase for role/status), dashboard key names
  (`pending_joiners` vs `pending_new_joiners`, `occupancy_rate` vs `occupancy_percentage`), and a double-nested
  `/ai/query` body.
- **Fixed:** Normalised casing at the service boundary, corrected dashboard field names, flattened the AI body,
  and enriched `EmployeeResponse`/`ProjectResponse` so the UI's project/seat/stat cells populate.
- **Verified by:** curl each endpoint; compared JSON keys to the components reading them; live UI check.

## Prompt 8 – Debugging
**Prompt used:** "The app isn't functioning and the UI looks different from the design — diagnose and fix."

Real bugs found and fixed (root causes, not symptoms):
1. Missing `ToastProvider` → blank pages (crash on `useToast`).
2. `page_size` above backend caps → 422 on seats grid and dropdowns.
3. AI router unregistered + wrong schema import → `/ai/query` 404 → assistant dead.
4. Unlayered base CSS overriding Tailwind text-color utilities → invisible nav/heading text.
5. Weak AI parser + fake suggested-query names → assistant "couldn't understand".

- **Verified by:** Reproduced each in the browser/console/network, applied the fix, re-tested live.

## Prompt 9 – Deployment
Pending — to be completed at deployment time (Railway/Render/Vercel/Docker). Will record the exact
build/start commands and environment variables used.

## Prompt 10 – Refactoring / Polish
**Prompt used:** "Clean up duplication and tighten fidelity to the design."

- **Correct:** Shared Tailwind theme tokens (indigo brand, status palette, fonts, shadows) drive the whole UI.
- **Incorrect / noted:** Avatar/status palette is duplicated across several components; a couple of orphaned
  components remain (`ProjectTable`, `SeatTable`, `EmployeeCard`).
- **Fixed:** Consolidated status/bay handling; remaining dedup is tracked as a low-risk cleanup.
- **Verified by:** `npm run build` (clean) + `eslint` (no new errors).

---

## Summary of validation
- Backend: `pytest`, Swagger `/docs`, and curl smoke tests on every endpoint.
- Frontend: real-browser walkthrough of every screen + console/network inspection.
- Data: confirmed the API totals match the Postgres row counts (nothing hardcoded).
