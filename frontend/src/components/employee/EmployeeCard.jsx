import { formatDate } from '../../utils/formatDate'

const AVATAR_PALETTE = [
  ['#eef2ff', '#4f46e5'],
  ['#ecfdf5', '#059669'],
  ['#fff1f3', '#e11d48'],
  ['#fffbeb', '#b45309'],
  ['#f0f9ff', '#0284c7'],
  ['#faf5ff', '#9333ea'],
]

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

export default function EmployeeCard({
  employee,
  onEdit,
  onDeactivate,
  onView,
  canManage = false,
}) {
  if (!employee) return null

  const [avBg, avFg] = avatarFor(employee.id)
  const meta = STATUS_META[String(employee.status || '').toLowerCase()] || STATUS_META.inactive

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-[18px] shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-[11px]">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[11px] font-display text-[13px] font-bold"
            style={{ background: avBg, color: avFg }}
          >
            {initialsOf(employee.name)}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-surface-900">{employee.name}</p>
            <p className="text-[12px] text-surface-400">{employee.employee_code}</p>
          </div>
        </div>
        <span
          className="rounded-full px-[9px] py-[3px] text-[11px] font-semibold"
          style={{ color: meta.fg, background: meta.bg }}
        >
          {meta.label}
        </span>
      </div>

      {/* Body */}
      <div className="mt-4 space-y-2 text-[13px]">
        <p className="text-surface-600">{employee.email}</p>
        <p className="text-surface-600">
          {employee.department}
          {employee.role ? ` · ${employee.role}` : ''}
        </p>
        <p className="text-surface-500">
          {employee.seat_number ? (
            <span className="tabular">{employee.seat_number}</span>
          ) : (
            <span className="text-surface-400">Seat not allocated</span>
          )}
        </p>
        <p className="text-surface-400">Joined {formatDate(employee.joining_date)}</p>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between gap-2">
        <button
          onClick={() => onView?.(employee)}
          className="flex h-[34px] items-center justify-center rounded-[9px] border border-surface-200 bg-white px-3.5 text-[13px] font-semibold text-surface-700 hover:bg-surface-50"
        >
          View details
        </button>

        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(employee)}
              className="flex h-[34px] items-center justify-center rounded-[9px] border border-surface-200 bg-white px-3.5 text-[13px] font-semibold text-surface-700 hover:bg-surface-50"
            >
              Edit
            </button>
            <button
              onClick={() => onDeactivate?.(employee)}
              className="flex h-[34px] items-center justify-center rounded-[9px] border border-danger-border bg-white px-3.5 text-[13px] font-semibold text-danger hover:bg-danger-bg"
            >
              Deactivate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
