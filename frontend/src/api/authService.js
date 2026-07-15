import api from './axios'

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data // expected: { access_token, token_type, user: { id, name, email, role } }
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },
}