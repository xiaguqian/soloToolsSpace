import request from '@/utils/request'

export const login = (data) => {
  return request.post('/auth/login', data)
}

export const register = (data) => {
  return request.post('/auth/register', data)
}

export const createSystemUser = (data) => {
  return request.post('/auth/system-users', data)
}

export const getCurrentUser = () => {
  return request.get('/auth/me')
}

export const changePassword = (data) => {
  return request.put('/auth/password', data)
}

export const resetPassword = (data) => {
  return request.put('/auth/password/reset', data)
}
