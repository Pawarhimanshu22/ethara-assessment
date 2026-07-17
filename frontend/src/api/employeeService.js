import api from './axios'

// Backend EmployeeStatus enum values are UPPERCASE (ACTIVE / INACTIVE / PENDING_ALLOCATION).
// project_id comes from a <select> as a string; empty ("Unassigned") must be null, not "".
const normalizeBody = (payload = {}) => {
  const body = { ...payload }
  if (body.status) body.status = String(body.status).toUpperCase()
  if ('project_id' in body) {
    body.project_id =
      body.project_id === '' || body.project_id == null ? null : Number(body.project_id)
  }
  return body
}

export const employeeService = {
  list: async (params = {}) => {
    // params: { search, department, project_id, status, page, page_size }
    // Backend EmployeeStatus enum values are UPPERCASE (e.g. "PENDING_ALLOCATION").
    const query = params.status
      ? { ...params, status: String(params.status).toUpperCase() }
      : params
    const { data } = await api.get('/employees', { params: query })
    return data
  },

  get: async (id) => {
    const { data } = await api.get(`/employees/${id}`)
    return data
  },

  create: async (payload) => {
    // payload: { employee_code, name, email, department, role, joining_date, status, project_id }
    const { data } = await api.post('/employees', normalizeBody(payload))
    return data
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/employees/${id}`, normalizeBody(payload))
    return data
  },

  deactivate: async (id) => {
    const { data } = await api.delete(`/employees/${id}`)
    return data
  },
}