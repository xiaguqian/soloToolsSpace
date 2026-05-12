import { isLocalEnv } from '@/config/env'
import { get } from '@/utils/request'
import { getLocalData } from '@/utils/localDataLoader'

export function getFavoritesList(params) {
  if (isLocalEnv()) {
    return getLocalData('favorites-list')
  }
  return get('/api/favorites/list', params)
}

export default {
  getFavoritesList
}
