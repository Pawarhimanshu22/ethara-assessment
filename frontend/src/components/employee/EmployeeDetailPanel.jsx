import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
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

function seatLocation(employee) {
  if (!employee.seat_number) return 'Not allocated'
  const parts = []
  if (employee.seat_floor) parts.push(`Floor ${employee.seat_floor}`)
  if (employee.seat_zone) parts.push(`Zone ${employee.seat_zone}`)
  if (employee.seat_bay) parts.push(`Bay ${String(employee.seat_bay).replace(/^bay\s*/i, '')}`)
  parts.push(`Seat ${employee.seat_number}`)
  return parts.join(', ')
}

export default function EmployeeDetailPanel({
  open,
  employee,
  onClose,
  onEdit,
  onRelease,
  canManage = false,
  releasing = false,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !employee) return null

  const [avBg, avFg] = avatarFor(employee.id)
  const meta = STATUS_META[String(employee.status || '').toLowerCase()] || STATUS_META.inactive
  const hasSeat = !!employee.seat_number

  const rows = [
    { k: 'Email', v: employee.email },
    { k: 'Department', v: employee.department },
    { k: 'Role', v: employee.role },
    { k: 'Project', v: employee.project_name || '—' },
    { k: 'Joining date', v: formatDate(employee.joining_date) },
    { k: 'Seat', v: seatLocation(employee) },
  ]

  return createPortal(
    <div
      onClick={onClose}
      className="animate-overlay-in fixed inset-0 z-40 bg-[rgba(14,15,34,0.4)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-pop absolute right-0 top-0 bottom-0 flex w-[400px] max-w-[92vw] flex-col bg-white shadow-[-12px_0_40px_rgba(14,15,34,0.2)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-surface-100 px-[22px] pb-[18px] pt-[22px]">
          <div className="flex items-center gap-[13px]">
            <div
              className="flex h-[50px] w-[50px] items-center justify-center rounded-[13px] font-display text-[17px] font-bold"
              style={{ background: avBg, color: avFg }}
            >
              {initialsOf(employee.name)}
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-surface-900">{employee.name}</h3>
              <p className="text-[12.5px] text-surface-400">{employee.employee_code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex rounded-lg p-[7px] text-surface-400 hover:bg-surface-100"
          >
            <X className="h-[17px] w-[17px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-[22px] py-5">
          <span
            className="self-start rounded-full px-3 py-[5px] text-[12px] font-semibold"
            style={{ color: meta.fg, background: meta.bg }}
          >
            {meta.label}
          </span>
          {rows.map((r) => (
            <div
              key={r.k}
              className="flex justify-between gap-4 border-b border-surface-100 pb-[13px]"
            >
              <span className="text-[13px] text-surface-400">{r.k}</span>
              <span className="text-right text-[13.5px] font-medium text-surface-900">
                {r.v || '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        {canManage && (
          <div className="flex gap-2.5 border-t border-surface-100 px-[22px] py-4">
            <button
              onClick={() => onEdit?.(employee)}
              className="flex h-[38px] flex-1 items-center justify-center rounded-[10px] border border-surface-200 bg-white text-[13px] font-semibold text-surface-700 hover:bg-surface-50"
            >
              Edit details
            </button>
            {hasSeat && (
              <button
                onClick={() => onRelease?.(employee)}
                disabled={releasing}
                className="flex h-[38px] flex-1 items-center justify-center rounded-[10px] border border-danger-border bg-white text-[13px] font-semibold text-danger hover:bg-danger-bg disabled:opacity-50"
              >
                {releasing ? 'Releasing…' : 'Release seat'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
