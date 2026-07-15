export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  EMPLOYEE: 'employee',
}

// Roles allowed to perform write actions (create/edit/delete/allocate/release)
export const MANAGER_ROLES = [ROLES.ADMIN, ROLES.HR]

export const SEAT_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
}

export const SEAT_STATUS_LABELS = {
  [SEAT_STATUS.AVAILABLE]: 'Available',
  [SEAT_STATUS.OCCUPIED]: 'Occupied',
  [SEAT_STATUS.RESERVED]: 'Reserved',
  [SEAT_STATUS.MAINTENANCE]: 'Maintenance',
}

export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending_allocation',
}

export const EMPLOYEE_STATUS_LABELS = {
  [EMPLOYEE_STATUS.ACTIVE]: 'Active',
  [EMPLOYEE_STATUS.INACTIVE]: 'Inactive',
  [EMPLOYEE_STATUS.PENDING]: 'Pending Allocation',
}

// Matches backend ProjectStatus enum (ACTIVE / CLOSED)
export const PROJECT_STATUS = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
}

// Seed reference values only — actual data always comes from the backend
export const FLOORS = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5']
export const ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export const TOKEN_KEY = 'ethara_token'
export const USER_KEY = 'ethara_user'