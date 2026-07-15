const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || '').trim())
}

export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0
}

export function isDuplicateEmail(email, existingEmployees = [], excludeId = null) {
  const normalized = String(email || '').trim().toLowerCase()
  return existingEmployees.some(
    (emp) => emp.email?.trim().toLowerCase() === normalized && emp.id !== excludeId
  )
}

export function validateEmployeeForm(values, existingEmployees = [], editingId = null) {
  const errors = {}

  if (!isRequired(values.name)) errors.name = 'Name is required.'
  if (!isRequired(values.email)) {
    errors.email = 'Email is required.'
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.'
  } else if (isDuplicateEmail(values.email, existingEmployees, editingId)) {
    errors.email = 'An employee with this email already exists.'
  }
  if (!isRequired(values.employee_code)) errors.employee_code = 'Employee ID is required.'
  if (!isRequired(values.department)) errors.department = 'Department is required.'
  if (!isRequired(values.role)) errors.role = 'Role is required.'
  if (!isRequired(values.joining_date)) errors.joining_date = 'Joining date is required.'

  return errors
}

export function validateProjectForm(values) {
  const errors = {}
  if (!isRequired(values.name)) errors.name = 'Project name is required.'
  if (!isRequired(values.manager_name)) errors.manager_name = 'Manager name is required.'
  return errors
}

export function validateSeatForm(values) {
  const errors = {}
  if (!isRequired(values.floor)) errors.floor = 'Floor is required.'
  if (!isRequired(values.zone)) errors.zone = 'Zone is required.'
  if (!isRequired(values.bay)) errors.bay = 'Bay is required.'
  if (!isRequired(values.seat_number)) errors.seat_number = 'Seat number is required.'
  return errors
}

export function hasErrors(errorsObj) {
  return Object.keys(errorsObj).length > 0
}