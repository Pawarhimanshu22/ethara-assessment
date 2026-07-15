const CHIP_PALETTE = [
  ['#eef2ff', '#4f46e5'],
  ['#ecfdf5', '#059669'],
  ['#fff1f3', '#e11d48'],
  ['#fffbeb', '#b45309'],
  ['#f0f9ff', '#0284c7'],
  ['#faf5ff', '#9333ea'],
]

const STATUS_META = {
  active: { label: 'Active', fg: '#059669', bg: '#ecfdf5' },
  on_hold: { label: 'On hold', fg: '#b45309', bg: '#fffbeb' },
  inactive: { label: 'Inactive', fg: '#475569', bg: '#f1f5f9' },
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="tabular font-display text-[20px] font-bold text-surface-900">{value}</p>
      <p className="text-[11.5px] text-surface-400">{label}</p>
    </div>
  )
}

export default function ProjectCard({
  project,
  index = 0,
  canManage = false,
  onEdit,
  onDelete,
  onViewEmployees,
}) {
  if (!project) return null

  const [chipBg, chipFg] = CHIP_PALETTE[index % CHIP_PALETTE.length]
  const meta = STATUS_META[String(project.status || '').toLowerCase()] || STATUS_META.inactive
  const mono = String(project.name || '?')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative rounded-2xl border border-surface-200 bg-white p-[18px] shadow-card">
      {/* Header */}
      <div className="mb-3.5 flex items-start justify-between">
        <div className="flex items-center gap-[11px]">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[11px] font-display text-[15px] font-bold"
            style={{ background: chipBg, color: chipFg }}
          >
            {mono}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-surface-900">{project.name}</p>
            <p className="text-[12px] text-surface-400">{project.manager_name}</p>
          </div>
        </div>
        <span
          className="rounded-full px-[9px] py-[3px] text-[11px] font-semibold"
          style={{ color: meta.fg, background: meta.bg }}
        >
          {meta.label}
        </span>
      </div>

      {/* Stat row */}
      <div className="flex gap-5 border-t border-surface-100 py-3">
        <Stat value={project.employee_count ?? 0} label="Members" />
        <Stat value={project.allocated_seats ?? 0} label="Seats" />
        <Stat value={project.floor_count ?? project.floors ?? '—'} label="Floors" />
      </div>

      {/* Footer */}
      <div className="mt-1.5 flex gap-2">
        {onViewEmployees ? (
          <button
            onClick={() => onViewEmployees(project)}
            className="flex h-[34px] flex-1 items-center justify-center rounded-[9px] border border-surface-200 bg-white text-[13px] font-semibold text-surface-700 hover:bg-surface-50"
          >
            Employees
          </button>
        ) : null}
        {canManage && (
          <>
            <button
              onClick={() => onEdit?.(project)}
              className="flex h-[34px] flex-1 items-center justify-center rounded-[9px] border border-surface-200 bg-white text-[13px] font-semibold text-surface-700 hover:bg-surface-50"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(project)}
              className="flex h-[34px] flex-1 items-center justify-center rounded-[9px] border border-danger-border bg-white text-[13px] font-semibold text-danger hover:bg-danger-bg"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}
