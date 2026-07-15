import { SEAT_STATUS } from '../../utils/constants'

// Status palette mirrors SeatStatusLegend's SEAT_STATUS_META (fg/bg/border).
const SEAT_STATUS_META = {
  available: { fg: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  occupied: { fg: '#e11d48', bg: '#fff1f3', border: '#fecdd3' },
  reserved: { fg: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  maintenance: { fg: '#475569', bg: '#f1f5f9', border: '#e2e8f0' },
}

export default function SeatCard({ seat, onClick, selectable = true }) {
  const status = String(seat.status || '').toLowerCase()
  const meta = SEAT_STATUS_META[status] || SEAT_STATUS_META.maintenance
  // Every seat is clickable when selectable — available opens allocate,
  // others surface an info/warn toast. Wiring stays in the parent handler.
  const interactive = selectable && !!onClick

  return (
    <button
      type="button"
      onClick={() => interactive && onClick(seat)}
      title={`${seat.seat_number} · ${status}${seat.employee_name ? ' · ' + seat.employee_name : ''}`}
      style={{ backgroundColor: meta.bg, borderColor: meta.border, color: meta.fg }}
      className={[
        'flex h-10 min-w-[52px] items-center justify-center rounded-[9px] border',
        'font-display text-[11.5px] font-bold tabular-nums transition-transform',
        interactive ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default',
      ].join(' ')}
    >
      {seat.seat_number}
    </button>
  )
}

export { SEAT_STATUS }
