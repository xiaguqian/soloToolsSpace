import request from '../utils/request'

export function getTaskList() {
  return request({
    url: '/tasks',
    method: 'get'
  })
}

export function getTaskById(id) {
  return request({
    url: `/tasks/${id}`,
    method: 'get'
  })
}

export function createTask(data) {
  return request({
    url: '/tasks',
    method: 'post',
    data
  })
}

export function updateTask(id, data) {
  return request({
    url: `/tasks/${id}`,
    method: 'put',
    data
  })
}

export function deleteTask(id) {
  return request({
    url: `/tasks/${id}`,
    method: 'delete'
  })
}

export function startTask(id) {
  return request({
    url: `/tasks/${id}/start`,
    method: 'post'
  })
}

export function stopTask(id) {
  return request({
    url: `/tasks/${id}/stop`,
    method: 'post'
  })
}

export function updateTaskCron(id, cronExpression) {
  return request({
    url: `/tasks/${id}/cron`,
    method: 'put',
    data: { cronExpression }
  })
}
