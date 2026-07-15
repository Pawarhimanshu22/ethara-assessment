import api from './axios'

export const projectService = {
  list: async (params = {}) => {
    // Backend ProjectStatus enum values are UPPERCASE (e.g. "ACTIVE", "CLOSED").
    const query = params.status
      ? { ...params, status: String(params.status).toUpperCase() }
      : params
    const { data } = await api.get('/projects', { params: query })
    return data
  },

  get: async (id) => {
    const { data } = await api.get(`/projects/${id}`)
    return data
  },

  create: async (payload) => {
    // payload: { name, description, manager_name, status }
    const { data } = await api.post('/projects', payload)
    return data
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/projects/${id}`, payload)
    return data
  },

  remove: async (id) => {
    const { data } = await api.delete(`/projects/${id}`)
    return data
  },

  getEmployees: async (id) => {
    const { data } = await api.get(`/projects/${id}/employees`)
    return data
  },
}