import axios from 'axios'
import { isLocalEnv, getEnvConfig } from '@/config/env'

const instance = axios.create({
  timeout: 10000,
  baseURL: isLocalEnv() ? '' : getEnvConfig().baseURL
})

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 0) {
      return res
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    return Promise.reject(error)
  }
)

export function request(config) {
  return instance(config)
}

export function get(url, params) {
  return request({
    url,
    method: 'get',
    params
  })
}

export function post(url, data) {
  return request({
    url,
    method: 'post',
    data
  })
}

export function upload(url, file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentComplete)
      }
    }
  })
}

export default {
  request,
  get,
  post,
  upload
}
