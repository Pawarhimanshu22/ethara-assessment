import SeatCard from './SeatCard'
import EmptyState from '../common/EmptyState'
import { Armchair } from 'lucide-react'

// Groups a flat seat list by zone -> bay for a spatial layout.
function groupByZone(seats) {
  const zones = {}
  for (const seat of seats) {
    const z = seat.zone ?? '—'
    const b = seat.bay ?? '—'
    zones[z] ??= {}
    zones[z][b] ??= []
    zones[z][b].push(seat)
  }
  return zones
}

export default function SeatGrid({ seats, onSeatClick, selectable = true, floorMap = false }) {
  if (!seats || seats.length === 0) {
    return (
      <EmptyState
        icon={Armchair}
        title="No seats match these filters"
        description="Try adjusting the floor, zone, or status filters above."
      />
    )
  }

  const zones = groupByZone(seats)

  return (
    <div className="flex flex-col gap-5">
      {Object.entries(zones).map(([zone, bays]) => (
        <div key={zone}>
          <div className="mb-[11px] flex items-center gap-2">
            <span className="rounded-[7px] bg-brand-50 px-[9px] py-0.5 font-display text-[12px] font-bold text-brand-600">
              Zone {zone}
            </span>
            <div className="h-px flex-1 bg-surface-100" />
          </div>
          <div className={floorMap ? 'flex flex-wrap gap-[22px]' : 'flex flex-wrap gap-[14px]'}>
            {Object.entries(bays).map(([bay, baySeats]) => (
              <div
                key={bay}
                className={floorMap ? 'rounded-xl border border-dashed border-surface-200 bg-surface-50 p-3' : ''}
              >
                <p className="mb-[7px] text-[10.5px] font-semibold tracking-[0.04em] text-surface-300">
                  BAY {String(bay).replace(/^bay\s*/i, '')}
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {baySeats.map((seat) => (
                    <SeatCard
                      key={seat.id}
                      seat={seat}
                      onClick={onSeatClick}
                      selectable={selectable}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
