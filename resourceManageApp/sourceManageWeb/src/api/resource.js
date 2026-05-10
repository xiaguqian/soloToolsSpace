import request from '@/utils/request'

export const uploadFile = (file, params) => {
  const formData = new FormData()
  formData.append('file', file)
  if (params.sourceSystem) formData.append('sourceSystem', params.sourceSystem)
  if (params.accessPermission) formData.append('accessPermission', params.accessPermission)
  
  return request.post('/resources/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const uploadBatchFiles = (files, params) => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  if (params.sourceSystem) formData.append('sourceSystem', params.sourceSystem)
  if (params.accessPermission) formData.append('accessPermission', params.accessPermission)
  
  return request.post('/resources/upload/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const getResourceInfo = (fileId) => {
  return request.get(`/resources/${fileId}`)
}

export const getResourceListByTags = (params) => {
  return request.get('/resources/tags', { params })
}

export const downloadFile = (fileId) => {
  return `${import.meta.env.VITE_API_BASE_URL || '/api'}/resources/${fileId}/download`
}

export const previewFile = (fileId) => {
  return `${import.meta.env.VITE_API_BASE_URL || '/api'}/resources/${fileId}/preview`
}

export const deleteResource = (fileId) => {
  return request.delete(`/resources/${fileId}`)
}
