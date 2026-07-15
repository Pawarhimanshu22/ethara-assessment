import EmptyState from '../common/EmptyState'
import { FolderKanban } from 'lucide-react'

export default function ProjectUtilizationChart({ data }) {
  // Normalize API response — backend returns { items: [{ project_id, project_name, total_employees, seats_occupied }] }
  const source = Array.isArray(data) ? data : data?.items || data?.results || []

  const rows = source.map((d) => ({
    id: d.project_id ?? d.id ?? d.project_name ?? d.name,
    name: d.project_name || d.name || 'Unknown',
    value: d.seats_occupied ?? d.allocated_seats ?? d.allocated ?? 0,
  }))

  const max = rows.reduce((m, r) => Math.max(m, r.value), 0) || 1

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
      <div className="mb-[18px] flex items-center justify-between">
        <div>
          <h3 className="text-[15px] text-surface-900">Project-wise allocation</h3>
          <p className="mt-0.5 text-xs text-surface-400">Seats occupied per active project</p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600">
          {rows.length} projects
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No project utilization data yet" />
      ) : (
        <div className="flex flex-col gap-[13px]">
          {rows.map((r) => (
            <div key={r.id}>
              <div className="mb-[5px] flex items-center justify-between">
                <span className="text-[13px] font-semibold text-surface-700">{r.name}</span>
                <span className="tabular text-xs text-surface-400">{r.value} seats</span>
              </div>
              <div className="h-[9px] overflow-hidden rounded-full bg-surface-100">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${Math.max((r.value / max) * 100, r.value > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
