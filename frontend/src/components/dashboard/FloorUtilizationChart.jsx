import EmptyState from '../common/EmptyState'
import { Building2 } from 'lucide-react'

// Short floor label, e.g. "Floor 3" -> "F3"
function shortLabel(name) {
  const s = String(name)
  const m = s.match(/(\d+)/)
  if (m) return `F${m[1]}`
  return s.length > 3 ? s.slice(0, 3) : s
}

export default function FloorUtilizationChart({ data }) {
  // Normalize API response — backend returns { items: [{ floor, total_seats, occupied, available, reserved, maintenance, occupancy_percentage }] }
  const source = Array.isArray(data) ? data : data?.items || data?.results || []

  const bars = source.map((d) => {
    const total = d.total_seats ?? 0
    const occupied = d.occupied ?? d.occupied_seats ?? 0
    const rate =
      d.occupancy_percentage != null
        ? Math.round(d.occupancy_percentage)
        : total
          ? Math.round((occupied / total) * 100)
          : 0
    return {
      id: d.floor ?? d.floor_name ?? shortLabel(d.floor),
      short: shortLabel(d.floor || d.floor_name || 'Unknown'),
      pct: rate,
    }
  })

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
      <h3 className="mb-0.5 text-[15px] text-surface-900">Floor-wise occupancy</h3>
      <p className="mb-[18px] text-xs text-surface-400">Occupied vs. capacity</p>

      {bars.length === 0 ? (
        <EmptyState icon={Building2} title="No floor utilization data yet" />
      ) : (
        <div className="flex h-[170px] items-end gap-3.5 pt-2.5">
          {bars.map((b) => (
            <div
              key={b.id}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="tabular text-xs font-bold text-surface-700">{b.pct}%</span>
              <div className="flex h-full w-full max-w-[44px] items-end overflow-hidden rounded-[9px_9px_4px_4px] bg-surface-100">
                <div
                  className="w-full rounded-[8px_8px_3px_3px] bg-gradient-to-b from-brand-500 to-brand-600"
                  style={{ height: `${b.pct}%`, minHeight: '8px' }}
                />
              </div>
              <span className="text-[11px] text-surface-400">{b.short}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
