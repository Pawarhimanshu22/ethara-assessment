# Ethara Frontend — React + Vite

Single-page app for the Ethara Seat Allocation & Project Mapping System.

Stack: React 19 · Vite · Tailwind CSS v4 · Zustand · React Router 7 · Axios · Recharts · lucide-react.

## Run

```bash
npm install
echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env
npm run dev -- --port 5173
```

App runs at **http://localhost:5173** and talks to the backend at `VITE_API_BASE_URL`
(default `http://localhost:8000/api/v1`). Start the backend first (see `../backend/README.md`).

Scripts: `npm run dev` (dev server) · `npm run build` (production build to `dist/`) ·
`npm run preview` (serve the build) · `npm run lint` (ESLint).

## Demo login

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| Admin | `admin@ethara.ai`   | `Admin@123` |
| HR    | `hr@ethara.ai`      | `Hr@12345`  |

Admin/HR have full write access; the seeded Employee login is printed by the backend seed script.

## Project structure

```
src/
├── api/           axios client + one service module per resource (employee, project, seat, dashboard, ai, auth)
├── store/         Zustand stores
├── hooks/         useApiState, useFilters, useDebounce, usePagination, useToast
├── context/       AuthContext (JWT/session), ToastContext
├── components/
│   ├── common/    Button, Input, Select, Modal, Table, StatusBadge, ConfirmDialog, Pagination, …
│   ├── layout/    Sidebar (dark console), Header, AppLayout, Footer
│   └── <feature>/ dashboard, employee, project, seat, search, ai-assistant
├── pages/         one component per route
├── routes/        AppRoutes + ProtectedRoute (role-aware guard)
├── assets/styles/ main.css — Tailwind v4 @theme design tokens (brand, surface, status, fonts)
└── App.jsx        AuthProvider → ToastProvider → routes
```

## Design system

Theme tokens live in `src/assets/styles/main.css` (`@theme`): indigo brand ramp, neutral/surface
ramp, seat/employee status palette, shadows, and the display/body fonts (Space Grotesk + Public Sans).
Base element styles are inside `@layer base` so Tailwind utility classes always take precedence.

## Data

All screens are wired to the real backend via the `src/api` services — there is no mock data.
Auth stores a JWT in `localStorage` (`ethara_token`) and axios attaches it as a Bearer header;
a `401` clears the session and redirects to `/login`.

## Build

```bash
npm run build      # outputs static assets to dist/
```
