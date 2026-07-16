import { useState, useMemo } from 'react'
import { LayoutGrid, Map } from 'lucide-react'
import clsx from 'clsx'
import AppLayout from '../components/layout/AppLayout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'
import SeatFilters from '../components/seat/SeatFilters'
import SeatGrid from '../components/seat/SeatGrid'
import SeatStatusLegend from '../components/seat/SeatStatusLegend'
import SeatAllocationModal from '../components/seat/SeatAllocationModal'
import SeatReleaseModal from '../components/seat/SeatReleaseModal'
import { useApiState } from '../hooks/useApiState'
import { useDebounce } from '../hooks/useDebounce'
import { useToast } from '../hooks/useToast'
import { seatService } from '../api/seatService'
import { employeeService } from '../api/employeeService'
import { projectService } from '../api/projectService'
import { SEAT_STATUS } from '../utils/constants'

export default function SeatManagementPage() {
  const toast = useToast()
  const [view, setView] = useState('grid') // grid | map
  const [filters, setFilters] = useState({ search: '', floor: 'Floor 1', zone: '', status: '' })
  const debouncedSearch = useDebounce(filters.search, 350)

  const queryParams = useMemo(
    () => ({
      floor: filters.floor || undefined,
      zone: filters.zone || undefined,
      status: filters.status || undefined,
      search: debouncedSearch || undefined,
      page_size: 2000,
    }),
    [filters.floor, filters.zone, filters.status, debouncedSearch]
  )

  const { data: seatsResp, loading, error, refetch } = useApiState(
    () => seatService.list(queryParams),
    [JSON.stringify(queryParams)]
  )
  const seats = seatsResp?.items || seatsResp?.results || seatsResp || []

  const { data: employeesResp } = useApiState(
    () => employeeService.list({ page_size: 1000 }),
    []
  )
  const employees = employeesResp?.items || employeesResp?.results || employeesResp || []

  const { data: projectsResp } = useApiState(() => projectService.list({ page_size: 100 }), [])
  const projects = projectsResp?.items || projectsResp?.results || projectsResp || []

  const [allocateTarget, setAllocateTarget] = useState(null)
  const [releaseTarget, setReleaseTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSeatClick = (seat) => {
    const status = String(seat.status || '').toLowerCase()
    if (status === SEAT_STATUS.AVAILABLE) {
      setAllocateTarget(seat)
    } else if (status === SEAT_STATUS.OCCUPIED) {
      // Open the release modal so an occupied seat can be freed
      setReleaseTarget(seat)
    } else if (status === SEAT_STATUS.RESERVED) {
      toast.info(`Seat ${seat.seat_number} is reserved — change status to allocate`)
    } else {
      toast.info(`Seat ${seat.seat_number} is under maintenance`)
    }
  }

  const handleAllocate = async (payload) => {
    setSubmitting(true)
    try {
      await seatService.allocate(payload)
      toast.success('Seat allocated successfully.')
      setAllocateTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not allocate this seat. It may already be taken.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRelease = async (payload) => {
    setSubmitting(true)
    try {
      await seatService.release(payload)
      toast.success('Seat released and is now available.')
      setReleaseTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not release this seat.')
    } finally {
      setSubmitting(false)
    }
  }

  const viewLabel = view === 'map' ? 'Floor map' : 'Grid view'

  return (
    <AppLayout title="Seat Management" subtitle="Allocate, release and inspect seats">
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <SeatFilters filters={filters} onChange={setFilters} />
          <div className="flex gap-0.5 rounded-[10px] bg-[#eeeef4] p-[3px]">
            <ViewToggle
              active={view === 'grid'}
              onClick={() => setView('grid')}
              icon={LayoutGrid}
              label="Grid"
            />
            <ViewToggle
              active={view === 'map'}
              onClick={() => setView('map')}
              icon={Map}
              label="Floor map"
            />
          </div>
        </div>

        <SeatStatusLegend seats={seats} />

        <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[15px] font-semibold text-surface-900">
              {filters.floor || 'All floors'} · {viewLabel}
            </h3>
            <span className="text-[12px] text-surface-400">Click an available seat to allocate</span>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading seats..." />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
            <SeatGrid seats={seats} onSeatClick={handleSeatClick} floorMap={view === 'map'} />
          )}
        </div>
      </div>

      <SeatAllocationModal
        open={!!allocateTarget}
        onClose={() => setAllocateTarget(null)}
        onConfirm={handleAllocate}
        seat={allocateTarget}
        employees={employees}
        projects={projects}
        submitting={submitting}
      />

      <SeatReleaseModal
        open={!!releaseTarget}
        onClose={() => setReleaseTarget(null)}
        onConfirm={handleRelease}
        seat={releaseTarget}
        submitting={submitting}
      />
    </AppLayout>
  )
}

function ViewToggle({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex h-[34px] items-center gap-1.5 rounded-lg px-3.5 text-[12.5px] font-semibold transition-colors',
        active ? 'bg-white text-brand-600 shadow-sm' : 'text-surface-400 hover:text-surface-600'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
