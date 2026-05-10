import { v4 as uuidv4 } from 'uuid'

export const generateId = () => uuidv4()

export const exportAsJSON = (nodes, edges, viewport) => {
  return {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    viewport: { ...viewport }
  }
}

export const importFromJSON = (json) => {
  if (!json.nodes || !Array.isArray(json.nodes)) {
    throw new Error('无效的流程图文件：缺少节点数据')
  }
  return {
    nodes: json.nodes || [],
    edges: json.edges || [],
    viewport: json.viewport || { x: 0, y: 0, zoom: 1 }
  }
}

export const downloadFile = (content, filename, type = 'application/json') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const formatDate = (date) => {
  const d = new Date(date)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
