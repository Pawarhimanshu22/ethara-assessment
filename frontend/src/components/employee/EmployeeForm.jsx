import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'
import { validateEmployeeForm, hasErrors } from '../../utils/validators'
import { EMPLOYEE_STATUS_LABELS } from '../../utils/constants'
import { toInputDate } from '../../utils/formatDate'

const EMPTY = {
  employee_code: '',
  name: '',
  email: '',
  department: '',
  role: '',
  joining_date: '',
  status: 'pending_allocation',
  project_id: '',
}

export default function EmployeeForm({
  initialValues,
  existingEmployees = [],
  projects = [],
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialValues) {
      setValues({ ...EMPTY, ...initialValues, joining_date: toInputDate(initialValues.joining_date) })
    } else {
      setValues(EMPTY)
    }
    setErrors({})
  }, [initialValues])

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateEmployeeForm(values, existingEmployees, initialValues?.id)
    setErrors(validationErrors)
    if (!hasErrors(validationErrors)) {
      onSubmit(values)
    }
  }

  const statusOptions = Object.entries(EMPLOYEE_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }))
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }))

  const firstError = Object.values(errors).find(Boolean)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Full name"
          required
          value={values.name}
          onChange={set('name')}
          error={errors.name}
          placeholder="Amit Sharma"
        />
        <Input
          label="Employee ID"
          required
          value={values.employee_code}
          onChange={set('employee_code')}
          error={errors.employee_code}
          placeholder="ETH-10234"
        />
        <Input
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={set('email')}
          error={errors.email}
          placeholder="amit@ethara.ai"
          className="sm:col-span-2"
        />
        <Input
          label="Department"
          required
          value={values.department}
          onChange={set('department')}
          error={errors.department}
          placeholder="Engineering"
        />
        <Input
          label="Role"
          required
          value={values.role}
          onChange={set('role')}
          error={errors.role}
          placeholder="Software Engineer"
        />
        <Input
          label="Joining date"
          type="date"
          required
          value={values.joining_date}
          onChange={set('joining_date')}
          error={errors.joining_date}
        />
        <Select
          label="Project"
          options={projectOptions}
          value={values.project_id}
          onChange={set('project_id')}
          placeholder="Unassigned"
        />
        <Select
          label="Status"
          options={statusOptions}
          value={values.status}
          onChange={set('status')}
          className="sm:col-span-2"
        />
      </div>

      {firstError && (
        <div className="flex items-center gap-2 rounded-[11px] border border-danger-border bg-danger-bg px-3.5 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
          <span className="text-[12.5px] font-medium text-danger">{firstError}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialValues ? 'Save changes' : 'Add employee'}
        </Button>
      </div>
    </form>
  )
}
