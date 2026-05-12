import request from '@/utils/request'

export function getUsers(params) {
  return request({
    url: '/v1/admin/users',
    method: 'get',
    params
  })
}

export function getUser(id) {
  return request({
    url: `/v1/admin/users/${id}`,
    method: 'get'
  })
}

export function updateUser(id, data) {
  return request({
    url: `/v1/admin/users/${id}`,
    method: 'put',
    data
  })
}

export function getSetting(key) {
  return request({
    url: `/v1/admin/settings/${key}`,
    method: 'get'
  })
}

export function updateSetting(key, value) {
  return request({
    url: `/v1/admin/settings/${key}`,
    method: 'put',
    data: { setting_value: value }
  })
}

export function toggleSystemAccess(enable) {
  return request({
    url: '/v1/admin/settings/system/toggle',
    method: 'post',
    params: { enable }
  })
}
