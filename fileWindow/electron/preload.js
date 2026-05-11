const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  getStats: () => ipcRenderer.invoke('get-stats'),
  saveStats: (stats) => ipcRenderer.invoke('save-stats', stats),
  openDirectory: (dirPath) => ipcRenderer.invoke('open-directory', dirPath),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  openFileExplorer: (filePath) => ipcRenderer.invoke('open-file-explorer', filePath),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectFile: () => ipcRenderer.invoke('select-file'),
  pathExists: (filePath) => ipcRenderer.invoke('path-exists', filePath),
  statPath: (filePath) => ipcRenderer.invoke('stat-path', filePath),
  getPathInfo: (filePath) => ipcRenderer.invoke('get-path-info', filePath),
  createFiles: (directory, files, type) => ipcRenderer.invoke('create-files', directory, files, type)
})
