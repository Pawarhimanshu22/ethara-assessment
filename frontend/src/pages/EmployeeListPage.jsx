import { useState, useMemo } from 'react'
import { UserPlus, Search } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'
import Pagination from '../components/common/Pagination'
import EmployeeFilters from '../components/employee/EmployeeFilters'
import EmployeeTable from '../components/employee/EmployeeTable'
import EmployeeForm from '../components/employee/EmployeeForm'
import EmployeeDetailPanel from '../components/employee/EmployeeDetailPanel'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { useApiState } from '../hooks/useApiState'
import { usePagination } from '../hooks/usePagination'
import { useDebounce } from '../hooks/useDebounce'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import { employeeService } from '../api/employeeService'
import { projectService } from '../api/projectService'
import { seatService } from '../api/seatService'
import { MANAGER_ROLES } from '../utils/constants'

export default function EmployeeListPage() {
  const { role } = useAuth()
  const toast = useToast()
  const canManage = MANAGER_ROLES.includes(role)

  const [filters, setFilters] = useState({ search: '', project_id: '', status: '' })
  const debouncedSearch = useDebounce(filters.search, 350)
  const { page, pageSize, setPage, reset } = usePagination(20)

  const [formOpen, setFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [detailEmployee, setDetailEmployee] = useState(null)
  const [releasing, setReleasing] = useState(false)
  const [confirmDeleteEmployee, setConfirmDeleteEmployee] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      project_id: filters.project_id || undefined,
      status: filters.status || undefined,
      page,
      page_size: pageSize,
    }),
    [debouncedSearch, filters.project_id, filters.status, page, pageSize]
  )

  const {
    data: employeeResp,
    loading,
    error,
    refetch,
  } = useApiState(() => employeeService.list(queryParams), [JSON.stringify(queryParams)])

  const { data: projectsResp } = useApiState(() => projectService.list({ page_size: 100 }), [])

  const employees = employeeResp?.items || employeeResp?.results || employeeResp || []
  const total = employeeResp?.total ?? (Array.isArray(employees) ? employees.length : 0)
  const projects = projectsResp?.items || projectsResp?.results || projectsResp || []

  const handleFilterChange = (next) => {
    setFilters(next)
    reset()
  }

  const openCreate = () => {
    setEditingEmployee(null)
    setFormOpen(true)
  }

  const openEdit = (employee) => {
    setDetailEmployee(null)
    setEditingEmployee(employee)
    setFormOpen(true)
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, values)
        toast.success('Employee details updated.')
      } else {
        await employeeService.create(values)
        toast.success('Employee added successfully.')
      }
      setFormOpen(false)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not save employee. Please check the details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const employee = confirmDeleteEmployee
    if (!employee) return
    setDeleting(true)
    try {
      await employeeService.deactivate(employee.id)
      toast.success(`${employee.name} deleted.`)
      setConfirmDeleteEmployee(null)
      setDetailEmployee(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not delete this employee.')
    } finally {
      setDeleting(false)
    }
  }

  const handleRelease = async (employee) => {
    setReleasing(true)
    try {
      await seatService.release({ employee_id: employee.id })
      toast.success(`Seat ${employee.seat_number} released — now available.`)
      setDetailEmployee(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not release this seat.')
    } finally {
      setReleasing(false)
    }
  }

  return (
    <AppLayout title="Employees">
      <div className="animate-fadeup mx-auto max-w-[1180px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <EmployeeFilters filters={filters} onChange={handleFilterChange} projects={projects} />
          {canManage && (
            <Button icon={UserPlus} onClick={openCreate} className="shrink-0">
              Add employee
            </Button>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-surface-200 bg-white shadow-card">
            <LoadingSpinner label="Loading employees..." />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-surface-200 bg-white shadow-card">
            <ErrorState message={error} onRetry={refetch} />
          </div>
        ) : employees.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
            <div className="px-5 py-14 text-center">
              <div className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-surface-100 text-surface-300">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-[14px] font-semibold text-surface-700">
                No employees match your filters
              </p>
              <p className="mt-1 text-[12.5px] text-surface-400">
                Try clearing the search or changing filters.
              </p>
            </div>
          </div>
        ) : (
          <>
            <EmployeeTable
              employees={employees}
              canManage={canManage}
              onEdit={openEdit}
              onRowClick={setDetailEmployee}
            />
            <p className="mt-3 text-[12px] text-surface-400">
              Showing {employees.length} of {total} records
            </p>
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </>
        )}
      </div>

      <EmployeeDetailPanel
        open={!!detailEmployee}
        employee={detailEmployee}
        canManage={canManage}
        releasing={releasing}
        deleting={deleting}
        onClose={() => setDetailEmployee(null)}
        onEdit={openEdit}
        onRelease={handleRelease}
        onDelete={setConfirmDeleteEmployee}
      />

      <ConfirmDialog
        open={!!confirmDeleteEmployee}
        onClose={() => setConfirmDeleteEmployee(null)}
        onConfirm={handleDelete}
        title="Delete this employee?"
        message={
          confirmDeleteEmployee
            ? `${confirmDeleteEmployee.name} will be permanently removed. Any allocated seat is released and becomes available. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete employee"
        variant="danger"
        loading={deleting}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingEmployee ? 'Edit employee' : 'Add employee'}
        size="lg"
      >
        <EmployeeForm
          initialValues={editingEmployee}
          existingEmployees={Array.isArray(employees) ? employees : []}
          projects={projects}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </AppLayout>
  )
}
