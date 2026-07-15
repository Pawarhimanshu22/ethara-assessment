# Debugging Notes — Ethara Seat Allocation & Project Mapping System

Real bugs encountered while building, wiring, and deploying — with root cause, fix, and how each
was verified. Diagnosed by reproducing in the browser/console/network and via curl, then fixing the
root cause (not the symptom).

---

## 1. Every page white-screened (missing ToastProvider)
- **Symptom:** Dashboard loaded, but Employees / Seats / Projects / New Joiner / AI rendered blank.
- **Root cause:** pages call `useToast()`, but `App.jsx` mounted react-hot-toast's `<Toaster>` instead
  of the app's own `ToastProvider`. `useToast` throws `must be used within ToastProvider` → the whole
  route crashes.
- **Fix:** Wrap the app in `ToastProvider` and render the custom `ToastContainer`; drop the unused
  react-hot-toast Toaster.
- **Verified:** reloaded each route in the browser; console exception gone; screens render.

## 2. Seat grid + dropdowns failed (page_size over cap)
- **Symptom:** Seat Management showed *"query.page_size: Input should be less than or equal to 500"*;
  legend counts all 0.
- **Root cause:** the seat page requested `page_size: 1000` and employee dropdowns `1000`, but the
  backend capped `/seats` at 500 and `/employees` at 200.
- **Fix:** raised the backend caps (a floor holds ~1,120 seats) and set the seat fetch to cover a full
  floor.
- **Verified:** seat grid renders zones/bays with live legend counts (116 avail / 983 occ / 21 res).

## 3. AI Assistant was completely dead (404)
- **Symptom:** the assistant always replied "Sorry, I could not understand"; `POST /ai/query`
  returned 404.
- **Root cause (two bugs):** the `ai` router was **never registered** in `main.py`, and both `ai.py`
  and `ai_service.py` imported `app.schemas.ai` while the file is `ai_query.py` — an import error that
  crashed the app once the router was added.
- **Fix:** register the AI router and correct the import to `app.schemas.ai_query`.
- **Verified:** `POST /ai/query` returns real answers; suggested chips resolve.

## 4. Invisible nav/heading text (unlayered base CSS)
- **Symptom:** the active sidebar item was an empty indigo bar; "Welcome back" was near-invisible on
  the login page.
- **Root cause:** base element styles (`a`, `h1–h6`) were written **unlayered** in `main.css`. In
  Tailwind v4, unlayered CSS overrides `@layer utilities`, so `a { color: indigo }` beat `text-white`
  — indigo text on an indigo active background = invisible; dark heading color on a dark panel = invisible.
- **Fix:** wrap base element styles in `@layer base` so utility classes win; add explicit `text-white`
  where headings sit on dark/colored panels.
- **Verified:** sidebar labels, active item, and login headings render correctly.

## 5. Frontend ↔ backend contract mismatches
- **Symptom:** blank dashboard cells, all role-gated actions dead, 422s on filters, AI 422.
- **Root causes & fixes:**
  - Enum casing — backend serializes UPPERCASE (`ADMIN`, `ACTIVE`), frontend used lowercase → role
    never matched and status filters 422'd. Normalized at the service boundary and on auth read.
  - Dashboard keys — FE read `pending_joiners` / `occupancy_rate`; backend returns
    `pending_new_joiners` / `occupancy_percentage`. Corrected.
  - `POST /ai/query` body was double-nested (`{query:{query,email}}`) → 422. Flattened.
  - Seat release sent `{seat_id}`; backend expects `{employee_id}`. Fixed.
  - Enriched `EmployeeResponse` / `ProjectResponse` so project/seat/stat cells populate.
- **Verified:** curl'd each endpoint and compared JSON keys to the components reading them.

## 6. Weak AI parser + fake suggested prompts
- **Symptom:** "Where is Donna Davis seated?" returned a *different* person; occupancy needed the literal
  word "project"; the suggested chips referenced names (Amit/Sara) not present in seeded data.
- **Fix:** rewrote the parser with stopword-filtered, token-scored name matching and project-name
  detection independent of the word "project"; added `GET /ai/examples` that builds chips from real
  seeded employees/projects.
- **Verified:** all intents answer correctly against live data; chips resolve.

## 7. Login failed on the deployed/local app despite correct password
- **Symptom:** "Incorrect email or password" even with the right credentials.
- **Root cause:** the login hint said *"any password"* (leftover design mock text) and Chrome autofill
  could desync from React's controlled input state.
- **Fix:** corrected the hint to the real credential; the submit handler now reads live DOM input
  values (autofill-proof) and sets proper `autoComplete` attributes.
- **Verified:** login succeeds with `admin@ethara.ai` / `Admin@123`.

## 8. Deployed backend 500'd on every DB query (empty migration)
- **Symptom:** on Render, `/health` returned 200 but every DB endpoint 500'd; login failed.
- **Root cause:** the initial Alembic migration's `upgrade()` was a `pass` stub — it created **no
  tables**. Locally this was masked because `seed_db.py` calls `Base.metadata.create_all()`. On the
  fresh Render DB nothing existed, and the free tier has no Shell to seed manually.
- **Fix:** `scripts/bootstrap.py` runs at container start — `create_all()` to guarantee tables, then
  seed **only if the database is empty**. Wired into the Render start command.
- **Verified:** after redeploy the login went 500 → 401 → 200 as tables were created and seeding
  completed; `GET /employees` total = 5000.

## 9. Managed Postgres URL scheme
- **Symptom:** potential connection failure with Render's `postgres://` URL.
- **Fix:** a Pydantic validator in `config.py` rewrites `postgres://` → `postgresql://` for SQLAlchemy.
- **Verified:** backend connects to Render Postgres; migrations and queries succeed.

---

## How issues were validated overall
- **Frontend:** real-browser walkthrough of every screen + console/network inspection.
- **Backend:** curl smoke tests on every endpoint (local and live) + Swagger `/docs`.
- **Data integrity:** confirmed API totals equal the Postgres row counts (nothing hardcoded).
