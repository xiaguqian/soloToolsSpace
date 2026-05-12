import { isLocalEnv } from '@/config/env'
import { get, post } from '@/utils/request'
import { getLocalData, simulatePost } from '@/utils/localDataLoader'

export function getPlanList(params) {
  if (isLocalEnv()) {
    return getLocalData('plan-list')
  }
  return get('/api/plan/list', params)
}

export function getPlanDetail(id) {
  if (isLocalEnv()) {
    return getLocalData('plan-detail')
  }
  return get(`/api/plan/${id}`)
}

export function createPlan(data) {
  if (isLocalEnv()) {
    return simulatePost('plan-detail', data)
  }
  return post('/api/plan/create', data)
}

export function generateGuide(data) {
  if (isLocalEnv()) {
    return simulatePost('guide-result', data)
  }
  return post('/api/plan/generate-guide', data)
}

export function updatePlanStatus(id, status) {
  if (isLocalEnv()) {
    return simulatePost('plan-detail', { planId: id, status })
  }
  return post('/api/plan/update-status', { planId: id, status })
}

export default {
  getPlanList,
  getPlanDetail,
  createPlan,
  generateGuide,
  updatePlanStatus
}
