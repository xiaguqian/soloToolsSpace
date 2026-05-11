import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const componentApi = {
  getAll: () => api.get('/components/'),
  getById: (id) => api.get(`/components/${id}`),
  update: (id, data) => api.put(`/components/${id}`, data),
  delete: (id) => api.delete(`/components/${id}`)
}

export const taskApi = {
  getAll: () => api.get('/tasks/'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  start: (id) => api.post(`/tasks/${id}/start`),
  stop: (id) => api.post(`/tasks/${id}/stop`),
  runNow: (id) => api.post(`/tasks/${id}/run-now`),
  test: (data) => api.post('/tasks/test', data),
  execute: (taskId) => api.post(`/tasks/execute/${taskId}`)
}

export default api
