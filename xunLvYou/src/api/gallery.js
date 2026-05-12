import { isLocalEnv } from '@/config/env'
import { get, post } from '@/utils/request'
import { getLocalData, simulatePost } from '@/utils/localDataLoader'

export function getGalleryList(params) {
  if (isLocalEnv()) {
    return getLocalData('gallery-list')
  }
  return get('/api/gallery/list', params)
}

export function addToGallery(data) {
  if (isLocalEnv()) {
    return simulatePost('gallery-list', data)
  }
  return post('/api/gallery/add', data)
}

export function deleteFromGallery(id) {
  if (isLocalEnv()) {
    return simulatePost('gallery-list', { id })
  }
  return post('/api/gallery/delete', { id })
}

export default {
  getGalleryList,
  addToGallery,
  deleteFromGallery
}
