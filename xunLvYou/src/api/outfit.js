import { isLocalEnv } from '@/config/env'
import { post } from '@/utils/request'
import { simulatePost } from '@/utils/localDataLoader'

export function generateOutfit(data) {
  if (isLocalEnv()) {
    return simulatePost('outfit-result', data)
  }
  return post('/api/outfit/generate', data)
}

export default {
  generateOutfit
}
