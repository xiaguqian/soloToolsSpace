import request from '../utils/request'

export function getShortcuts(params) {
  return request({
    url: '/api/v1/shortcuts',
    method: 'get',
    params
  })
}

export function getShortcutsByModel(modelId) {
  return request({
    url: `/api/v1/shortcuts/model/${modelId}`,
    method: 'get'
  })
}

export function getShortcut(id) {
  return request({
    url: `/api/v1/shortcuts/${id}`,
    method: 'get'
  })
}

export function createShortcut(data) {
  return request({
    url: '/api/v1/shortcuts',
    method: 'post',
    data
  })
}

export function updateShortcut(id, data) {
  return request({
    url: `/api/v1/shortcuts/${id}`,
    method: 'put',
    data
  })
}

export function deleteShortcut(id) {
  return request({
    url: `/api/v1/shortcuts/${id}`,
    method: 'delete'
  })
}
