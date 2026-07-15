import clsx from 'clsx'
import { SEAT_STATUS, SEAT_STATUS_LABELS, EMPLOYEE_STATUS, EMPLOYEE_STATUS_LABELS } from '../../utils/constants'

// Maps status keyword -> tailwind-safe inline style using the design status palette
const STYLE_MAP = {
  [SEAT_STATUS.AVAILABLE]: { color: '#059669', bg: '#ecfdf5', dot: '#10b981' },
  [SEAT_STATUS.OCCUPIED]: { color: '#e11d48', bg: '#fff1f3', dot: '#fb7185' },
  [SEAT_STATUS.RESERVED]: { color: '#b45309', bg: '#fffbeb', dot: '#f59e0b' },
  [SEAT_STATUS.MAINTENANCE]: { color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
  [EMPLOYEE_STATUS.ACTIVE]: { color: '#059669', bg: '#ecfdf5', dot: '#10b981' },
  [EMPLOYEE_STATUS.INACTIVE]: { color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
  [EMPLOYEE_STATUS.PENDING]: { color: '#9333ea', bg: '#faf5ff', dot: '#9333ea' },
  // project statuses (backend ProjectStatus: ACTIVE / CLOSED)
  active: { color: '#059669', bg: '#ecfdf5', dot: '#10b981' },
  closed: { color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
  // extra aliases from the design status palette
  pending: { color: '#b45309', bg: '#fffbeb', dot: '#f59e0b' },
  on_hold: { color: '#b45309', bg: '#fffbeb', dot: '#f59e0b' },
}

const LABEL_MAP = { ...SEAT_STATUS_LABELS, ...EMPLOYEE_STATUS_LABELS, active: 'Active', closed: 'Closed' }

export default function StatusBadge({ status, className }) {
  const key = String(status || '').toLowerCase()
  const style = STYLE_MAP[key] || { color: '#475569', bg: '#f8fafc', dot: '#94a3b8' }
  const label = LABEL_MAP[key] || status || 'Unknown'

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold',
        className
      )}
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
      {label}
    </span>
  )
}