import request from '@/utils/request'

export function getAccessList(params) {
  return request({
    url: '/v1/access',
    method: 'get',
    params
  })
}

export function createAccess(data) {
  return request({
    url: '/v1/access',
    method: 'post',
    data
  })
}

export function updateAccess(id, data) {
  return request({
    url: `/v1/access/${id}`,
    method: 'put',
    data
  })
}

export function deleteAccess(id) {
  return request({
    url: `/v1/access/${id}`,
    method: 'delete'
  })
}
