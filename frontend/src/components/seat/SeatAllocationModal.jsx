import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Modal from '../common/Modal'
import Select from '../common/Select'
import Button from '../common/Button'
import { SEAT_STATUS } from '../../utils/constants'

export default function SeatAllocationModal({
  open,
  onClose,
  onConfirm,
  seat,
  employee = null,
  employees = [],
  projects = [],
  submitting = false,
}) {
  const [employeeId, setEmployeeId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState('')
  // Reset selection/error each time the modal opens for a new seat, without an
  // effect: track the open+seat identity and clear during render on change.
  const openKey = open ? `${seat?.id ?? ''}:${employee?.id ?? ''}` : ''
  const [lastKey, setLastKey] = useState(openKey)
  if (open && openKey !== lastKey) {
    setLastKey(openKey)
    setEmployeeId(employee ? String(employee.id) : '')
    setProjectId('')
    setError('')
  }

  // Employees who don't already have an active seat
  const unallocatedEmployees = employees.filter((e) => !e.seat_number)
  const employeeOptions = unallocatedEmployees.map((e) => ({
    value: e.id,
    label: `${e.name} (${e.employee_code})`,
  }))
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }))

  const status = String(seat?.status || '').toLowerCase()
  const loc = seat ? `Floor ${seat.floor}, Zone ${seat.zone}, Bay ${String(seat.bay).replace(/^bay\s*/i, '')}` : ''

  const handleConfirm = () => {
    if (status && status !== SEAT_STATUS.AVAILABLE) {
      setError('This seat is no longer available.')
      return
    }
    if (!employeeId) {
      setError('Please select an employee.')
      return
    }
    setError('')
    onConfirm({
      seat_id: seat.id,
      employee_id: employeeId,
      project_id: projectId || undefined,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Allocate seat" size="sm">
      <div className="space-y-4">
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-3.5 py-3">
          <p className="text-[13px] text-brand-800">
            <span className="font-bold">Seat {seat?.seat_number}</span>
            {loc && <span> · {loc}</span>}
          </p>
        </div>

        {employee ? (
          <div className="rounded-md bg-surface-50 px-3 py-2 text-[13px] text-surface-700">
            Assigning to <span className="font-semibold text-surface-900">{employee.name}</span>
            {employee.employee_code ? ` (${employee.employee_code})` : ''}
          </div>
        ) : (
          <Select
            label="Assign to employee"
            required
            options={employeeOptions}
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value)
              setError('')
            }}
            placeholder={
              unallocatedEmployees.length === 0
                ? 'No unassigned employees'
                : 'Select employee…'
            }
            disabled={unallocatedEmployees.length === 0}
          />
        )}

        {projectOptions.length > 0 && (
          <Select
            label="Project"
            options={projectOptions}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Use employee's assigned project"
          />
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-[11px] border border-[#f7c9d3] bg-[#fff1f3] px-3 py-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#e11d48]" />
            <span className="text-[12.5px] font-medium text-[#be123c]">{error}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} loading={submitting}>
          Allocate
        </Button>
      </div>
    </Modal>
  )
}
