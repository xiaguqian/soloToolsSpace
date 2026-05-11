import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 30000
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api

export const dimensionApi = {
  list: (params) => api.get('/api/dimensions', { params }),
  get: (id) => api.get(`/api/dimensions/${id}`),
  create: (data) => api.post('/api/dimensions', data),
  update: (id, data) => api.put(`/api/dimensions/${id}`, data),
  delete: (id) => api.delete(`/api/dimensions/${id}`)
}

export const categoryApi = {
  list: (params) => api.get('/api/categories', { params }),
  get: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`)
}

export const formulaApi = {
  list: (params) => api.get('/api/formulas', { params }),
  get: (id) => api.get(`/api/formulas/${id}`),
  create: (data) => api.post('/api/formulas', data),
  update: (id, data) => api.put(`/api/formulas/${id}`, data),
  delete: (id) => api.delete(`/api/formulas/${id}`)
}

export const dataDefinitionApi = {
  list: (params) => api.get('/api/data-definitions', { params }),
  get: (id) => api.get(`/api/data-definitions/${id}`),
  create: (data) => api.post('/api/data-definitions', data),
  update: (id, data) => api.put(`/api/data-definitions/${id}`, data),
  delete: (id) => api.delete(`/api/data-definitions/${id}`),
  define: (id) => api.post(`/api/data-definitions/${id}/define`),
  getColumns: (id) => api.get(`/api/data-definitions/${id}/columns`),
  getData: (id, params) => api.get(`/api/data-definitions/${id}/data`, { params }),
  createData: (id, data) => api.post(`/api/data-definitions/${id}/data`, data),
  updateData: (id, dataId, data) => api.put(`/api/data-definitions/${id}/data/${dataId}`, data),
  deleteData: (id, dataId) => api.delete(`/api/data-definitions/${id}/data/${dataId}`)
}

export const queryStatementApi = {
  list: (params) => api.get('/api/query-statements', { params }),
  get: (id) => api.get(`/api/query-statements/${id}`),
  create: (data) => api.post('/api/query-statements', data),
  update: (id, data) => api.put(`/api/query-statements/${id}`, data),
  delete: (id) => api.delete(`/api/query-statements/${id}`),
  execute: (id) => api.post(`/api/query-statements/${id}/execute`)
}

export const chartApi = {
  list: (params) => api.get('/api/charts', { params }),
  get: (id) => api.get(`/api/charts/${id}`),
  create: (data) => api.post('/api/charts', data),
  update: (id, data) => api.put(`/api/charts/${id}`, data),
  delete: (id) => api.delete(`/api/charts/${id}`),
  getData: (data) => api.post('/api/charts/get-data', data),
  getDefault: () => api.get('/api/charts/default/data')
}
