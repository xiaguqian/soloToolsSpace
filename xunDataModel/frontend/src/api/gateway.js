import request from '@/utils/request'

export function getGateways(params) {
  return request({
    url: '/v1/gateway',
    method: 'get',
    params
  })
}

export function createGateway(data) {
  return request({
    url: '/v1/gateway',
    method: 'post',
    data
  })
}

export function updateGateway(id, data) {
  return request({
    url: `/v1/gateway/${id}`,
    method: 'put',
    data
  })
}

export function toggleGateway(id, enable) {
  return request({
    url: `/v1/gateway/${id}/toggle`,
    method: 'post',
    params: { enable }
  })
}

export function proxyRequest(data) {
  return request({
    url: '/v1/gateway/proxy',
    method: 'post',
    data
  })
}
