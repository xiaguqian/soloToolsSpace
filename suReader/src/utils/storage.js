const { ipcRenderer } = window.require('electron')
const path = window.require('path')
const fs = window.require('fs')

export const getMachineId = async () => {
  return await ipcRenderer.invoke('get-machine-id')
}

export const openFileDialog = async () => {
  return await ipcRenderer.invoke('open-file-dialog')
}

export const readFile = async (filePath) => {
  return await ipcRenderer.invoke('read-file', filePath)
}

export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase()
}

export const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

export const saveToFile = (filePath, content) => {
  fs.writeFileSync(filePath, content, 'utf-8')
}

export const readJsonFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    }
    return null
  } catch (error) {
    console.error('读取JSON文件失败:', error)
    return null
  }
}

export const writeJsonFile = (filePath, data) => {
  try {
    ensureDirectory(path.dirname(filePath))
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('写入JSON文件失败:', error)
    return false
  }
}
