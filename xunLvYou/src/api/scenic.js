import { isLocalEnv } from '@/config/env'
import { get, post } from '@/utils/request'
import { getLocalData, simulatePost } from '@/utils/localDataLoader'

export function getScenicList(params) {
  if (isLocalEnv()) {
    return getLocalData('scenic-list')
  }
  return get('/api/scenic/list', params)
}

export function getScenicDetail(id) {
  if (isLocalEnv()) {
    return getLocalData('scenic-detail')
  }
  return get(`/api/scenic/${id}`)
}

export function favoriteScenic(id) {
  if (isLocalEnv()) {
    return simulatePost('scenic-detail', { scenicId: id })
  }
  return post('/api/scenic/favorite', { scenicId: id })
}

export function unfavoriteScenic(id) {
  if (isLocalEnv()) {
    return simulatePost('scenic-detail', { scenicId: id })
  }
  return post('/api/scenic/unfavorite', { scenicId: id })
}

export default {
  getScenicList,
  getScenicDetail,
  favoriteScenic,
  unfavoriteScenic
}
