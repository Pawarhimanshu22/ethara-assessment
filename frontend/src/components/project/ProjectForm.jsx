import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'
import { validateProjectForm, hasErrors } from '../../utils/validators'

const EMPTY = { name: '', description: '', manager_name: '', status: 'ACTIVE' }

// Must match backend ProjectStatus enum exactly (ACTIVE / CLOSED)
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' },
]

export default function ProjectForm({ initialValues, onSubmit, onCancel, submitting = false }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues(initialValues ? { ...EMPTY, ...initialValues } : EMPTY)
    setErrors({})
  }, [initialValues])

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateProjectForm(values)
    setErrors(validationErrors)
    if (!hasErrors(validationErrors)) onSubmit(values)
  }

  const firstError = Object.values(errors).find(Boolean)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project name"
        required
        value={values.name}
        onChange={set('name')}
        error={errors.name}
        placeholder="Talos"
      />
      <Input
        label="Manager name"
        required
        value={values.manager_name}
        onChange={set('manager_name')}
        error={errors.manager_name}
        placeholder="Priya Nair"
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-surface-700">Description</label>
        <textarea
          rows={3}
          value={values.description}
          onChange={set('description')}
          className="w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Brief description of the project scope..."
        />
      </div>
      <Select label="Status" options={STATUS_OPTIONS} value={values.status} onChange={set('status')} />

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
          {initialValues ? 'Save changes' : 'Add project'}
        </Button>
      </div>
    </form>
  )
}