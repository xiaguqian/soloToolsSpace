import axios from 'axios'

const service = axios.create({
  baseURL: '/api/v1',
  timeout: 5000
})

service.interceptors.request.use(
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

service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('tenant')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: data => service.post('/auth/login', data),
  logout: () => service.post('/auth/logout'),
  getProfile: () => service.get('/auth/profile')
}

export const productApi = {
  list: params => service.get('/products', { params }),
  get: id => service.get(`/products/${id}`),
  create: data => service.post('/products', data),
  update: (id, data) => service.put(`/products/${id}`, data),
  delete: id => service.delete(`/products/${id}`),
  updateStatus: (id, status) => service.put(`/products/${id}/status`, { status }),
  getCategories: () => service.get('/products/categories/list')
}

export const orderApi = {
  list: params => service.get('/orders', { params }),
  get: id => service.get(`/orders/${id}`),
  update: (id, data) => service.put(`/orders/${id}`, data),
  export: params => service.get('/orders/export', { params, responseType: 'blob' })
}

export const userApi = {
  list: params => service.get('/users', { params }),
  get: id => service.get(`/users/${id}`),
  update: (id, data) => service.put(`/users/${id}`, data),
  addPoints: (id, points) => service.post(`/users/${id}/points`, { points })
}

export const statisticsApi = {
  dashboard: () => service.get('/statistics/dashboard'),
  orderTrend: params => service.get('/statistics/order-trend', { params }),
  productRanking: params => service.get('/statistics/product-ranking', { params })
}

export const systemApi = {
  getTenant: () => service.get('/system/tenant'),
  updateTenant: data => service.put('/system/tenant', data),
  getStaff: () => service.get('/system/staff'),
  createStaff: data => service.post('/system/staff', data),
  updateStaff: (id, data) => service.put(`/system/staff/${id}`, data),
  deleteStaff: id => service.delete(`/system/staff/${id}`)
}

export const uploadApi = {
  upload: formData => service.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}