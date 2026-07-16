import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'
import Button from '../components/common/Button'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { useApiState } from '../hooks/useApiState'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import { employeeService } from '../api/employeeService'
import { seatService } from '../api/seatService'
import { formatDate } from '../utils/formatDate'
import { MANAGER_ROLES } from '../utils/constants'

const AVATAR_PALETTE = [
  ['#eef2ff', '#4f46e5'],
  ['#ecfdf5', '#059669'],
  ['#fff1f3', '#e11d48'],
  ['#fffbeb', '#b45309'],
  ['#f0f9ff', '#0284c7'],
  ['#faf5ff', '#9333ea'],
]

const STATUS_META = {
  active: { label: 'Active', fg: '#059669', bg: '#ecfdf5' },
  inactive: { label: 'Inactive', fg: '#475569', bg: '#f1f5f9' },
  pending_allocation: { label: 'Pending', fg: '#b45309', bg: '#fffbeb' },
}

function avatarFor(id) {
  const n = Number(id) || 0
  return AVATAR_PALETTE[n % AVATAR_PALETTE.length]
}

function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function seatLocation(employee) {
  if (!employee.seat_number) return 'Not allocated'
  const parts = []
  if (employee.seat_floor) parts.push(`Floor ${employee.seat_floor}`)
  if (employee.seat_zone) parts.push(`Zone ${employee.seat_zone}`)
  if (employee.seat_bay) parts.push(`Bay ${String(employee.seat_bay).replace(/^bay\s*/i, '')}`)
  parts.push(`Seat ${employee.seat_number}`)
  return parts.join(', ')
}

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { role } = useAuth()
  const canManage = MANAGER_ROLES.includes(role)
  const [releasing, setReleasing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: employee, loading, error, refetch } = useApiState(
    () => employeeService.get(id),
    [id]
  )

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await employeeService.deactivate(employee.id)
      toast.success(`${employee.name} deleted.`)
      navigate('/employees')
    } catch (err) {
      toast.error(err.message || 'Could not delete this employee.')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleRelease = async () => {
    setReleasing(true)
    try {
      await seatService.release({ employee_id: employee.id })
      toast.success(`Seat ${employee.seat_number} released — now available.`)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not release this seat.')
    } finally {
      setReleasing(false)
    }
  }

  return (
    <AppLayout title="Employee Details">
      <div className="animate-fadeup mx-auto max-w-[720px]">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/employees')}
          className="mb-4"
        >
          Back to employees
        </Button>

        {loading ? (
          <LoadingSpinner label="Loading employee..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !employee ? (
          <ErrorState title="Employee not found" message="This employee may have been removed." />
        ) : (
          (() => {
            const [avBg, avFg] = avatarFor(employee.id)
            const meta =
              STATUS_META[String(employee.status || '').toLowerCase()] || STATUS_META.inactive
            const hasSeat = !!employee.seat_number
            const rows = [
              { k: 'Email', v: employee.email },
              { k: 'Department', v: employee.department },
              { k: 'Role', v: employee.role },
              { k: 'Project', v: employee.project_name || '—' },
              { k: 'Joining date', v: formatDate(employee.joining_date) },
              { k: 'Seat', v: seatLocation(employee) },
            ]

            return (
              <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-surface-100 px-[22px] pb-[18px] pt-[22px]">
                  <div className="flex items-center gap-[13px]">
                    <div
                      className="flex h-[50px] w-[50px] items-center justify-center rounded-[13px] font-display text-[17px] font-bold"
                      style={{ background: avBg, color: avFg }}
                    >
                      {initialsOf(employee.name)}
                    </div>
                    <div>
                      <h2 className="text-[19px] font-bold text-surface-900">{employee.name}</h2>
                      <p className="text-[12.5px] text-surface-400">{employee.employee_code}</p>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-3 py-[5px] text-[12px] font-semibold"
                    style={{ color: meta.fg, background: meta.bg }}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Rows */}
                <div className="flex flex-col gap-4 px-[22px] py-5">
                  {rows.map((r) => (
                    <div
                      key={r.k}
                      className="flex justify-between gap-4 border-b border-surface-100 pb-[13px]"
                    >
                      <span className="text-[13px] text-surface-400">{r.k}</span>
                      <span className="text-right text-[13.5px] font-medium text-surface-900">
                        {r.v || '—'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                {canManage && (
                  <div className="flex gap-2.5 border-t border-surface-100 px-[22px] py-4">
                    {employee.project_id && (
                      <button
                        onClick={() => navigate(`/projects/${employee.project_id}`)}
                        className="flex h-[38px] flex-1 items-center justify-center rounded-[10px] border border-surface-200 bg-white text-[13px] font-semibold text-surface-700 hover:bg-surface-50"
                      >
                        View project
                      </button>
                    )}
                    {hasSeat && (
                      <button
                        onClick={handleRelease}
                        disabled={releasing}
                        className="flex h-[38px] flex-1 items-center justify-center rounded-[10px] border border-danger-border bg-white text-[13px] font-semibold text-danger hover:bg-danger-bg disabled:opacity-50"
                      >
                        {releasing ? 'Releasing…' : 'Release seat'}
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDelete(true)}
                      disabled={deleting}
                      className="flex h-[38px] flex-1 items-center justify-center rounded-[10px] bg-danger text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {deleting ? 'Deleting…' : 'Delete employee'}
                    </button>
                  </div>
                )}
              </div>
            )
          })()
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this employee?"
        message={
          employee
            ? `${employee.name} will be permanently removed. Any allocated seat is released and becomes available. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete employee"
        variant="danger"
        loading={deleting}
      />
    </AppLayout>
  )
}
