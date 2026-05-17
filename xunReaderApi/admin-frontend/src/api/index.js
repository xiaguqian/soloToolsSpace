import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const bookApi = {
  list: (params) => api.get('/books', { params }),
  detail: (id) => api.get(`/books/${id}`),
  updateStatus: (id, status) => api.put(`/admin/books/${id}/status`, { status }),
  delete: (id) => api.delete(`/admin/books/${id}`),
  chapters: (id) => api.get(`/admin/books/${id}/chapters`),
  batchUpdateChapters: (bookId, chapterIds, status) => 
    api.put(`/admin/books/${bookId}/chapters/batch`, { chapterIds, status })
}

export const userApi = {
  list: () => api.get('/admin/users'),
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role })
}

export const roleApi = {
  list: () => api.get('/admin/roles'),
  create: (data) => api.post('/admin/roles', data),
  update: (id, data) => api.put(`/admin/roles/${id}`, data),
  delete: (id) => api.delete(`/admin/roles/${id}`)
}