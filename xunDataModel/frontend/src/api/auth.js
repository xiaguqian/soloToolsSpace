import request from '@/utils/request'

export function login(data) {
  const formData = new FormData()
  formData.append('username', data.username)
  formData.append('password', data.password)
  return request({
    url: '/v1/auth/login',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function register(data) {
  return request({
    url: '/v1/auth/register',
    method: 'post',
    data
  })
}

export function getCurrentUser() {
  return request({
    url: '/v1/auth/me',
    method: 'get'
  })
}

export function updateCurrentUser(data) {
  return request({
    url: '/v1/auth/me',
    method: 'put',
    data
  })
}

export function changePassword(data) {
  return request({
    url: '/v1/auth/change-password',
    method: 'post',
    data
  })
}
