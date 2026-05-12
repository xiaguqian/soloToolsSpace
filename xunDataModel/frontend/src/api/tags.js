import request from '@/utils/request'

export function getTags(params) {
  return request({
    url: '/v1/tags',
    method: 'get',
    params
  })
}

export function createTag(data) {
  return request({
    url: '/v1/tags',
    method: 'post',
    data
  })
}

export function updateTag(id, data) {
  return request({
    url: `/v1/tags/${id}`,
    method: 'put',
    data
  })
}

export function deleteTag(id) {
  return request({
    url: `/v1/tags/${id}`,
    method: 'delete'
  })
}

export function toggleTag(id, enable) {
  return request({
    url: `/v1/tags/${id}/toggle`,
    method: 'post',
    params: { enable }
  })
}
