import { useNavigate } from 'react-router-dom'

// Avatar palette indexed by employee id % 6 → [bg, fg]
const AVATARS = [
  ['#eef2ff', '#4f46e5'],
  ['#ecfdf5', '#059669'],
  ['#fff1f3', '#e11d48'],
  ['#fffbeb', '#b45309'],
  ['#f0f9ff', '#0284c7'],
  ['#faf5ff', '#9333ea'],
]

function initials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function avatar(id) {
  const n = Number(id)
  const idx = Number.isFinite(n) ? ((n % 6) + 6) % 6 : 0
  return AVATARS[idx]
}

export default function SearchResultsList({ query, results = [], loading }) {
  const navigate = useNavigate()

  if (!loading && results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-200 px-5 py-14 text-center">
        <p className="text-sm font-semibold text-surface-700">
          No matches for “{query}”
        </p>
        <p className="mt-[5px] text-[12.5px] text-surface-400">
          Check the spelling or try an employee ID like ETH-1004.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[9px]">
      {results.map((emp) => {
        const [bg, fg] = avatar(emp.id)
        const sub = [emp.employee_code, emp.department, emp.email]
          .filter(Boolean)
          .join(' · ')
        const seatLabel = emp.seat_number
          ? emp.zone
            ? `${emp.seat_number} · Zone ${emp.zone}`
            : emp.seat_number
          : 'No seat'

        return (
          <button
            key={emp.id}
            type="button"
            onClick={() => navigate(`/employees/${emp.id}`)}
            className="flex cursor-pointer items-center gap-[13px] rounded-[13px] border border-surface-200 bg-white px-4 py-[14px] text-left transition-colors hover:border-brand-200 hover:shadow-[0_4px_14px_rgba(79,70,229,0.08)]"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] text-[13px] font-bold"
              style={{ background: bg, color: fg }}
            >
              {initials(emp.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-surface-900">
                {emp.name}
              </p>
              <p className="truncate text-[12.5px] text-surface-400">{sub}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="tabular text-[13px] font-semibold text-brand-600">
                {seatLabel}
              </p>
              <p className="text-[11.5px] text-surface-400">
                {emp.project_name || 'Unassigned'}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
