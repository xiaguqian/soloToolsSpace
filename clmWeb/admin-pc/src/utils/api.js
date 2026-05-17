import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    if (response.data.code === 401 || response.data.code === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

export const auth = {
  login: data => api.post('/auth/login', data),
  changePassword: data => api.post('/auth/change-password', data)
}

export const product = {
  list: params => api.get('/product/list', { params }),
  get: id => api.get(`/product/${id}`),
  add: data => api.post('/product', data),
  update: (id, data) => api.put(`/product/${id}`, data),
  delete: id => api.delete(`/product/${id}`),
  batchStatus: data => api.put('/product/batch-status', data)
}

export const category = {
  list: () => api.get('/category/list'),
  get: id => api.get(`/category/${id}`),
  add: data => api.post('/category', data),
  update: (id, data) => api.put(`/category/${id}`, data),
  delete: id => api.delete(`/category/${id}`),
  sort: data => api.put('/category/sort', data)
}

export const table = {
  list: () => api.get('/table/list'),
  get: id => api.get(`/table/${id}`),
  add: data => api.post('/table', data),
  update: (id, data) => api.put(`/table/${id}`, data),
  delete: id => api.delete(`/table/${id}`),
  generateQrcode: data => api.post('/table/generate-qrcode', data),
  batchGenerateQrcode: data => api.post('/table/batch-generate-qrcode', data),
  batchStatus: data => api.put('/table/batch-status', data)
}

export const order = {
  list: params => api.get('/order/list', { params }),
  get: id => api.get(`/order/${id}`),
  accept: id => api.put(`/order/${id}/accept`),
  progress: id => api.put(`/order/${id}/progress`),
  complete: id => api.put(`/order/${id}/complete`),
  deliver: id => api.put(`/order/${id}/deliver`),
  cancel: id => api.put(`/order/${id}/cancel`)
}

export const statistics = {
  today: () => api.get('/statistics/today'),
  hotProducts: () => api.get('/statistics/hot-products'),
  trend: () => api.get('/statistics/trend'),
  summary: () => api.get('/statistics/summary')
}

export const tenant = {
  info: () => api.get('/tenant/info'),
  updateInfo: data => api.put('/tenant/info', data),
  updateTakeout: data => api.put('/tenant/takeout', data),
  updatePayment: data => api.put('/tenant/payment', data),
  updatePrinter: data => api.put('/tenant/printer', data)
}

export default api
