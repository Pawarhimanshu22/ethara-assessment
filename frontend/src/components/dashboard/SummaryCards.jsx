import { Users, Armchair, Lock, Check, Shield, UserPlus } from 'lucide-react'
import clsx from 'clsx'

// 6 stat cards mapped to the real dashboard summary shape:
// { total_employees, total_seats, occupied_seats, available_seats, reserved_seats, pending_joiners }
const CARDS = [
  {
    key: 'total_employees',
    label: 'Total Employees',
    icon: Users,
    chip: 'bg-brand-50 text-brand-600',
    trend: '+120 mo',
    trendChip: 'text-success bg-success-bg',
  },
  {
    key: 'total_seats',
    label: 'Total Seats',
    icon: Armchair,
    chip: 'bg-neutral-bg text-neutral',
    trend: '5 floors',
    trendChip: 'text-neutral bg-neutral-bg',
  },
  {
    key: 'occupied_seats',
    label: 'Occupied',
    icon: Lock,
    chip: 'bg-danger-bg text-danger',
    trend: 'occupied',
    trendChip: 'text-danger bg-danger-bg',
  },
  {
    key: 'available_seats',
    label: 'Available',
    icon: Check,
    chip: 'bg-success-bg text-success',
    trend: 'ready',
    trendChip: 'text-success bg-success-bg',
  },
  {
    key: 'reserved_seats',
    label: 'Reserved',
    icon: Shield,
    chip: 'bg-warning-bg text-warning',
    trend: 'held',
    trendChip: 'text-warning bg-warning-bg',
  },
  {
    key: 'pending_new_joiners',
    label: 'Pending Joiners',
    icon: UserPlus,
    chip: 'bg-accent-purple-bg text-accent-purple',
    trend: 'action',
    trendChip: 'text-accent-purple bg-accent-purple-bg',
  },
]

export default function SummaryCards({ summary, loading }) {
  const totalSeats = summary?.total_seats ?? 0

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5">
      {CARDS.map((card) => {
        const value = summary?.[card.key] ?? 0
        // Occupied card shows live occupancy % as its trend pill when possible.
        const trend =
          card.key === 'occupied_seats' && totalSeats
            ? `${Math.round((value / totalSeats) * 100)}%`
            : card.trend

        return (
          <div
            key={card.key}
            className="rounded-2xl border border-surface-200 bg-white p-[18px] shadow-card"
          >
            <div className="mb-3.5 flex items-center justify-between">
              <div
                className={clsx(
                  'flex h-[38px] w-[38px] items-center justify-center rounded-[11px]',
                  card.chip
                )}
              >
                <card.icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>
              <span
                className={clsx(
                  'rounded-full px-2 py-[3px] text-[11px] font-semibold',
                  card.trendChip
                )}
              >
                {trend}
              </span>
            </div>

            {loading ? (
              <div className="h-7 w-16 animate-pulse rounded bg-surface-100" />
            ) : (
              <p className="font-display tabular text-[28px] font-bold leading-none text-surface-900">
                {Number(value).toLocaleString()}
              </p>
            )}
            <p className="mt-[5px] text-[12.5px] text-surface-400">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
