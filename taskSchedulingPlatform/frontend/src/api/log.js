import request from '../utils/request'

export function getAllLogs() {
  return request({
    url: '/logs',
    method: 'get'
  })
}

export function getLogById(id) {
  return request({
    url: `/logs/${id}`,
    method: 'get'
  })
}

export function getLogsByJobName(jobName) {
  return request({
    url: `/logs/name/${jobName}`,
    method: 'get'
  })
}

export function getLogsByDate(date) {
  return request({
    url: `/logs/date/${date}`,
    method: 'get'
  })
}
