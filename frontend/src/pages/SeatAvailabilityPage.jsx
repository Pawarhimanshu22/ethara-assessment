import { useMemo, useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Select from '../components/common/Select'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'
import SeatGrid from '../components/seat/SeatGrid'
import SeatStatusLegend from '../components/seat/SeatStatusLegend'
import { useApiState } from '../hooks/useApiState'
import { seatService } from '../api/seatService'
import { FLOORS, ZONES } from '../utils/constants'

export default function SeatAvailabilityPage() {
  const [floor, setFloor] = useState('')
  const [zone, setZone] = useState('')

  const params = useMemo(() => ({ floor: floor || undefined, zone: zone || undefined }), [floor, zone])

  const { data: seatsResp, loading, error, refetch } = useApiState(
    () => seatService.available(params),
    [JSON.stringify(params)]
  )
  const seats = seatsResp?.items || seatsResp?.results || seatsResp || []

  return (
    <AppLayout title="Seat Availability" subtitle="Read-only view of open and held seats">
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            placeholder="All floors"
            options={FLOORS.map((f) => ({ value: f, label: f }))}
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          />
          <Select
            placeholder="All zones"
            options={ZONES.map((z) => ({ value: z, label: `Zone ${z}` }))}
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          />
        </div>

        <SeatStatusLegend seats={seats} />

        <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[15px] font-semibold text-surface-900">
              {floor || 'All floors'} · Availability
            </h3>
            <span className="text-[12px] text-surface-400">Read-only view</span>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading available seats..." />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
            <SeatGrid seats={seats} selectable={false} />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
