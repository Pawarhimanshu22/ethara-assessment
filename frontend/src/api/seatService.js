import api from './axios'

// Backend expects floor as an int and SeatStatus enum values as UPPERCASE.
// The UI passes labels like "Floor 1" and lowercase status keys, so normalize here.
function normalizeSeatParams(params = {}) {
  const out = { ...params }
  if (out.floor != null && out.floor !== '') {
    const m = String(out.floor).match(/\d+/)
    if (m) out.floor = Number(m[0])
  } else {
    delete out.floor
  }
  if (out.status) out.status = String(out.status).toUpperCase()
  return out
}

export const seatService = {
  list: async (params = {}) => {
    // params: { floor, zone, status, project_id, page, page_size }
    const { data } = await api.get('/seats', { params: normalizeSeatParams(params) })
    return data
  },

  create: async (payload) => {
    // payload: { floor, zone, bay, seat_number, status }
    const { data } = await api.post('/seats', payload)
    return data
  },

  available: async (params = {}) => {
    // params: { floor, zone, project_id }
    const { data } = await api.get('/seats/available', { params: normalizeSeatParams(params) })
    return data
  },

  allocate: async (payload) => {
    // payload: { employee_id, seat_id, project_id }
    const { data } = await api.post('/seats/allocate', payload)
    return data
  },

  release: async (payload) => {
    // payload: { seat_id } or { employee_id }
    const { data } = await api.post('/seats/release', payload)
    return data
  },
}