import { isLocalEnv } from '@/config/env'
import { get } from '@/utils/request'
import { getLocalData } from '@/utils/localDataLoader'

export function getUserInfo() {
  if (isLocalEnv()) {
    return getLocalData('user-info')
  }
  return get('/api/user/info')
}

export default {
  getUserInfo
}
