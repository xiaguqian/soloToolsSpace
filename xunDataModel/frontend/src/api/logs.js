import request from '@/utils/request'

export function getLogs(params) {
  return request({
    url: '/v1/logs',
    method: 'get',
    params
  })
}

export function getLogStats() {
  return request({
    url: '/v1/logs/stats',
    method: 'get'
  })
}
