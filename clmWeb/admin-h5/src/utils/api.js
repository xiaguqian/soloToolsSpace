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
  login: data => api.post('/auth/login', data)
}

export const product = {
  list: params => api.get('/product/list', { params }),
  update: (id, data) => api.put(`/product/${id}`, data)
}

export const table = {
  list: () => api.get('/table/list')
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
  trend: () => api.get('/statistics/trend')
}

export default api
