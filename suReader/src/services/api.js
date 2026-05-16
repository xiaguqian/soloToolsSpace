import axios from 'axios'
import { getMachineId } from '../utils/storage'
import { getBooksMock, getBookDetailMock, parseUrlMock, checkPaymentMock } from '../mock/data'

const isLocal = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENV === 'local'

const createApiClient = () => {
  const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://api.sureader.com',
    timeout: 30000,
  })

  client.interceptors.request.use(async (config) => {
    const machineId = await getMachineId()
    config.headers['X-Machine-Id'] = machineId
    return config
  })

  return client
}

const api = createApiClient()

export const getBooks = async (params = {}) => {
  if (isLocal) {
    return getBooksMock()
  }
  const response = await api.get('/books', { params })
  return response.data
}

export const getBookDetail = async (bookId) => {
  if (isLocal) {
    return getBookDetailMock(bookId)
  }
  const response = await api.get(`/books/${bookId}`)
  return response.data
}

export const parseUrl = async (url) => {
  if (isLocal) {
    return parseUrlMock(url)
  }
  const response = await api.post('/parser/url', { url })
  return response.data
}

export const checkPayment = async () => {
  if (isLocal) {
    return checkPaymentMock()
  }
  const response = await api.get('/payment/status')
  return response.data
}

export const getReadingHistory = async () => {
  if (isLocal) {
    return { success: true, data: [] }
  }
  const response = await api.get('/history')
  return response.data
}

export const saveReadingHistory = async (bookId, progress) => {
  if (isLocal) {
    return { success: true }
  }
  const response = await api.post('/history', { bookId, progress })
  return response.data
}

export const getShelf = async () => {
  if (isLocal) {
    return { success: true, data: [] }
  }
  const response = await api.get('/shelf')
  return response.data
}

export const updateShelf = async (data) => {
  if (isLocal) {
    return { success: true }
  }
  const response = await api.put('/shelf', data)
  return response.data
}
