import { Pencil } from 'lucide-react'

// Avatar palette indexed by id % 6 — [bg, fg]
const AVATAR_PALETTE = [
  ['#eef2ff', '#4f46e5'],
  ['#ecfdf5', '#059669'],
  ['#fff1f3', '#e11d48'],
  ['#fffbeb', '#b45309'],
  ['#f0f9ff', '#0284c7'],
  ['#faf5ff', '#9333ea'],
]

// Status pill palette
const STATUS_META = {
  active: { label: 'Active', fg: '#059669', bg: '#ecfdf5' },
  inactive: { label: 'Inactive', fg: '#475569', bg: '#f1f5f9' },
  pending_allocation: { label: 'Pending', fg: '#b45309', bg: '#fffbeb' },
}

function avatarFor(id) {
  const n = Number(id) || 0
  return AVATAR_PALETTE[n % AVATAR_PALETTE.length]
}

function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const GRID = 'grid grid-cols-[2.2fr_1.3fr_1.3fr_1fr_1fr_40px] gap-3 items-center'

export default function EmployeeTable({ employees, canManage, onEdit, onRowClick }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
      {/* Header row */}
      <div className={`${GRID} border-b border-surface-100 bg-surface-50 px-[18px] py-[13px]`}>
        <span className="text-[11px] font-bold uppercase tracking-wide text-surface-400">Employee</span>
        <span className="text-[11px] font-bold uppercase tracking-wide text-surface-400">Department</span>
        <span className="text-[11px] font-bold uppercase tracking-wide text-surface-400">Project</span>
        <span className="text-[11px] font-bold uppercase tracking-wide text-surface-400">Seat</span>
        <span className="text-[11px] font-bold uppercase tracking-wide text-surface-400">Status</span>
        <span />
      </div>

      {/* Body rows */}
      {employees.map((e) => {
        const [avBg, avFg] = avatarFor(e.id)
        const meta = STATUS_META[String(e.status || '').toLowerCase()] || STATUS_META.inactive
        return (
          <div
            key={e.id}
            onClick={() => onRowClick?.(e)}
            className={`${GRID} cursor-pointer border-b border-surface-100 px-[18px] py-3 last:border-b-0 hover:bg-surface-50`}
          >
            {/* Employee */}
            <div className="flex min-w-0 items-center gap-[11px]">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[12.5px] font-bold"
                style={{ background: avBg, color: avFg }}
              >
                {initialsOf(e.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-surface-900">{e.name}</p>
                <p className="truncate text-[11.5px] text-surface-400">
                  {e.employee_code} · {e.email}
                </p>
              </div>
            </div>

            {/* Department + role */}
            <div className="min-w-0">
              <p className="truncate text-[13px] text-surface-700">{e.department}</p>
              <p className="truncate text-[11.5px] text-surface-400">{e.role}</p>
            </div>

            {/* Project */}
            <span className="truncate text-[13px] text-surface-700">
              {e.project_name || <span className="text-surface-400">Unassigned</span>}
            </span>

            {/* Seat */}
            <span className="tabular text-[12.5px] text-surface-600">
              {e.seat_number || <span className="text-surface-400">—</span>}
            </span>

            {/* Status */}
            <span>
              <span
                className="whitespace-nowrap rounded-full px-[9px] py-[3px] text-[11.5px] font-semibold"
                style={{ color: meta.fg, background: meta.bg }}
              >
                {meta.label}
              </span>
            </span>

            {/* Edit */}
            {canManage ? (
              <button
                onClick={(ev) => {
                  ev.stopPropagation()
                  onEdit?.(e)
                }}
                aria-label={`Edit ${e.name}`}
                className="flex items-center justify-center rounded-lg p-1.5 text-surface-400 hover:bg-brand-50 hover:text-brand-600"
              >
                <Pencil className="h-[15px] w-[15px]" />
              </button>
            ) : (
              <span />
            )}
          </div>
        )
      })}
    </div>
  )
}
