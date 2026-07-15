import Select from '../common/Select'
import { FLOORS, ZONES, SEAT_STATUS_LABELS } from '../../utils/constants'

export default function SeatFilters({ filters, onChange }) {
  const statusOptions = Object.entries(SEAT_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }))
  const floorOptions = FLOORS.map((f) => ({ value: f, label: f }))
  const zoneOptions = ZONES.map((z) => ({ value: z, label: `Zone ${z}` }))

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select
        placeholder="All floors"
        options={floorOptions}
        value={filters.floor}
        onChange={(e) => onChange({ ...filters, floor: e.target.value })}
      />
      <Select
        placeholder="All zones"
        options={zoneOptions}
        value={filters.zone}
        onChange={(e) => onChange({ ...filters, zone: e.target.value })}
      />
      <Select
        placeholder="All statuses"
        options={statusOptions}
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      />
    </div>
  )
}
