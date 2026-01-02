import api from './api'

const authService = {
  login: (username, password) => {
    return api.post('/token/', { username, password })
  },

  refreshToken: (refreshToken) => {
    return api.post('/token/refresh/', { refresh: refreshToken })
  },

  resetPassword: (email) => {
    return api.post('/password-reset/', { email })
  },

  confirmPasswordReset: (token, newPassword) => {
    return api.post('/password-reset-confirm/', {
      token,
      new_password: newPassword,
    })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },
}
export default authService