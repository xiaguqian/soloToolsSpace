import { isLocalEnv } from '@/config/env'
import { post } from '@/utils/request'
import { simulatePost } from '@/utils/localDataLoader'

export function generateSmartTravel(data) {
  if (isLocalEnv()) {
    return simulatePost('smart-travel-result', data)
  }
  return post('/api/smart-travel/generate', data)
}

export default {
  generateSmartTravel
}
