// Reusable status color palette for seats.
// fg = text/number color, bg = fill, dot = legend swatch, border = card border.
// Kept in-file (duplicated in SeatCard) so each module only exports its component.
const SEAT_STATUS_META = {
  available: { label: 'Available', fg: '#059669', bg: '#ecfdf5', dot: '#10b981', border: '#a7f3d0' },
  occupied: { label: 'Occupied', fg: '#e11d48', bg: '#fff1f3', dot: '#fb7185', border: '#fecdd3' },
  reserved: { label: 'Reserved', fg: '#b45309', bg: '#fffbeb', dot: '#f59e0b', border: '#fde68a' },
  maintenance: { label: 'Maintenance', fg: '#475569', bg: '#f1f5f9', dot: '#94a3b8', border: '#e2e8f0' },
}

const ORDER = ['available', 'occupied', 'reserved', 'maintenance']

export default function SeatStatusLegend({ seats = [] }) {
  const counts = seats.reduce((acc, s) => {
    const key = String(s.status || '').toLowerCase()
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[14px] border border-surface-200 bg-white px-4 py-3">
      {ORDER.map((status) => {
        const meta = SEAT_STATUS_META[status]
        return (
          <div key={status} className="flex items-center gap-[7px]">
            <span
              className="h-[11px] w-[11px] rounded-[4px]"
              style={{ backgroundColor: meta.dot }}
            />
            <span className="text-[12.5px] text-surface-600">{meta.label}</span>
            <span className="font-display text-[12px] font-bold tabular-nums text-surface-900">
              {counts[status] || 0}
            </span>
          </div>
        )
      })}
    </div>
  )
}
