import { Search } from 'lucide-react'
import { EMPLOYEE_STATUS_LABELS } from '../../utils/constants'

export default function EmployeeFilters({ filters, onChange, projects = [] }) {
  const statusOptions = Object.entries(EMPLOYEE_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }))
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }))

  const selectClass =
    'h-10 rounded-[11px] border border-surface-200 bg-white pl-3 pr-8 text-[13px] text-surface-700 cursor-pointer focus:outline-none focus:border-brand-600 focus:ring-[3px] focus:ring-brand-600/15'

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Search pill */}
      <div className="flex h-10 w-[260px] items-center gap-2 rounded-[11px] border border-surface-200 bg-white px-3.5 focus-within:border-brand-600 focus-within:ring-[3px] focus-within:ring-brand-600/15">
        <Search className="h-[15px] w-[15px] shrink-0 text-surface-400" />
        <input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Name, ID or email…"
          className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-surface-900 placeholder:text-surface-400 focus:outline-none"
        />
      </div>

      <select
        value={filters.project_id}
        onChange={(e) => onChange({ ...filters, project_id: e.target.value })}
        className={selectClass}
      >
        <option value="">All projects</option>
        {projectOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className={selectClass}
      >
        <option value="">All statuses</option>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
