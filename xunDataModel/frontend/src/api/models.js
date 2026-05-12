import request from '@/utils/request'

export function getModels(params) {
  return request({
    url: '/v1/models',
    method: 'get',
    params
  })
}

export function getModel(id) {
  return request({
    url: `/v1/models/${id}`,
    method: 'get'
  })
}

export function createModel(data) {
  return request({
    url: '/v1/models',
    method: 'post',
    data
  })
}

export function updateModel(id, data) {
  return request({
    url: `/v1/models/${id}`,
    method: 'put',
    data
  })
}

export function deleteModel(id) {
  return request({
    url: `/v1/models/${id}`,
    method: 'delete'
  })
}

export function testModel(id, message) {
  return request({
    url: `/v1/models/${id}/test`,
    method: 'post',
    data: { message }
  })
}

export function toggleModel(id, enable) {
  return request({
    url: `/v1/models/${id}/toggle`,
    method: 'post',
    params: { enable }
  })
}

export function getProviders() {
  return request({
    url: '/v1/models/providers',
    method: 'get'
  })
}

export function getApiTypes() {
  return request({
    url: '/v1/models/api-types',
    method: 'get'
  })
}
