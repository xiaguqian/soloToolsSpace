import request from '@/utils/request'

export const createTag = (data) => {
  return request.post('/tags', data)
}

export const getTagList = (params) => {
  return request.get('/tags', { params })
}

export const updateTag = (tagId, data) => {
  return request.put(`/tags/${tagId}`, data)
}

export const deleteTag = (tagId) => {
  return request.delete(`/tags/${tagId}`)
}

export const batchTagResources = (data) => {
  return request.post('/tags/batch', data)
}

export const removeTagFromResource = (resourceId, tagId) => {
  return request.delete(`/tags/resources/${resourceId}/tags/${tagId}`)
}

export const getTagsByResource = (resourceId) => {
  return request.get(`/tags/resources/${resourceId}`)
}
