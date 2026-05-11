const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow = null
const isDev = process.env.NODE_ENV === 'development'

const userDataPath = app.getPath('userData')
const dataPath = path.join(userDataPath, 'data')
const configFile = path.join(dataPath, 'config.json')
const statsFile = path.join(dataPath, 'stats.json')

function ensureDataDir() {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
  }
  if (!fs.existsSync(configFile)) {
    const defaultConfig = {
      directorySets: [
        {
          id: 'default-dirs',
          name: '默认常用目录',
          isDefault: true,
          items: []
        }
      ],
      fileSets: [
        {
          id: 'default-files',
          name: '默认常用文件',
          isDefault: true,
          items: []
        }
      ],
      defaultDirectorySetId: 'default-dirs',
      defaultFileSetId: 'default-files',
      useAppForTextFiles: false
    }
    fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2), 'utf-8')
  }
  if (!fs.existsSync(statsFile)) {
    const defaultStats = {
      directorySets: {},
      directoryItems: {},
      fileSets: {},
      fileItems: {}
    }
    fs.writeFileSync(statsFile, JSON.stringify(defaultStats, null, 2), 'utf-8')
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '文档管理应用',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:8015')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  ensureDataDir()
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('get-config', () => {
  try {
    const content = fs.readFileSync(configFile, 'utf-8')
    return JSON.parse(content)
  } catch (err) {
    return null
  }
})

ipcMain.handle('save-config', (event, config) => {
  try {
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf-8')
    return true
  } catch (err) {
    return false
  }
})

ipcMain.handle('get-stats', () => {
  try {
    const content = fs.readFileSync(statsFile, 'utf-8')
    return JSON.parse(content)
  } catch (err) {
    return null
  }
})

ipcMain.handle('save-stats', (event, stats) => {
  try {
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf-8')
    return true
  } catch (err) {
    return false
  }
})

ipcMain.handle('open-directory', (event, dirPath) => {
  try {
    shell.openPath(dirPath)
    return true
  } catch (err) {
    return false
  }
})

ipcMain.handle('open-file', (event, filePath) => {
  try {
    shell.openPath(filePath)
    return true
  } catch (err) {
    return false
  }
})

ipcMain.handle('open-file-explorer', (event, filePath) => {
  try {
    shell.showItemInFolder(filePath)
    return true
  } catch (err) {
    return false
  }
})

ipcMain.handle('read-file', (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { success: true, content }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('save-file', (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('path-exists', (event, filePath) => {
  return fs.existsSync(filePath)
})

ipcMain.handle('stat-path', (event, filePath) => {
  try {
    const stat = fs.statSync(filePath)
    return {
      success: true,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
      size: stat.size,
      mtime: stat.mtime
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('get-path-info', (event, filePath) => {
  try {
    const name = path.basename(filePath)
    const ext = path.extname(filePath)
    const dir = path.dirname(filePath)
    return {
      success: true,
      name,
      ext,
      dir,
      absolute: path.resolve(filePath),
      relative: path.relative(process.cwd(), filePath)
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('create-files', (event, directory, files, type = 'file') => {
  try {
    const results = []
    for (const name of files) {
      const fullPath = path.join(directory, name)
      if (type === 'directory') {
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true })
        }
      } else {
        if (!fs.existsSync(fullPath)) {
          fs.writeFileSync(fullPath, '', 'utf-8')
        }
      }
      results.push({ name, path: fullPath, success: true })
    }
    return { success: true, results }
  } catch (err) {
    return { success: false, error: err.message }
  }
})
