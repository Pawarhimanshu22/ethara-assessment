import { UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../common/EmptyState'
import { formatDate } from '../../utils/formatDate'

// Avatar palette indexed by employee id % 6 → [bg, fg]
const AVATARS = [
  ['#eef2ff', '#4f46e5'],
  ['#ecfdf5', '#059669'],
  ['#fff1f3', '#e11d48'],
  ['#fffbeb', '#b45309'],
  ['#f0f9ff', '#0284c7'],
  ['#faf5ff', '#9333ea'],
]

function initials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function PendingJoinersWidget({ employees = [] }) {
  const navigate = useNavigate()

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[15px] text-surface-900">New joiners pending allocation</h3>
          <span className="tabular rounded-full bg-warning-bg px-[9px] py-[3px] text-[11px] font-bold text-warning">
            {employees.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/new-joiner')}
          className="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] border border-surface-200 bg-white px-[15px] text-[13px] font-semibold text-surface-700 hover:bg-surface-50"
        >
          Allocate seats →
        </button>
      </div>

      {employees.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No pending allocations"
          description="Every active employee currently has a seat."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {employees.slice(0, 6).map((emp, i) => {
            const idx =
              (typeof emp.id === 'number' ? emp.id : i) % AVATARS.length
            const [avatarBg, avatarFg] = AVATARS[(idx + AVATARS.length) % AVATARS.length]
            const sub = [emp.department, emp.project_name].filter(Boolean).join(' · ')

            return (
              <div
                key={emp.id ?? i}
                className="flex items-center gap-[13px] rounded-xl border border-surface-200 bg-surface-50 px-[13px] py-[11px]"
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold"
                  style={{ background: avatarBg, color: avatarFg }}
                >
                  {initials(emp.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-surface-900">
                    {emp.name}
                  </p>
                  <p className="truncate text-xs text-surface-400">{sub}</p>
                </div>
                <span className="hidden text-xs text-surface-400 sm:block">
                  Joined {formatDate(emp.joining_date)}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/new-joiner')}
                  className="h-[34px] flex-shrink-0 rounded-[9px] bg-brand-600 px-[13px] text-[12.5px] font-semibold text-white hover:bg-brand-700"
                >
                  Allocate
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
