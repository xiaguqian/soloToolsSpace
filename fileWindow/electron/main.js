const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow = null
const isDev = process.env.NODE_ENV === 'development'

const userDataPath = app.getPath('userData')
const dataPath = path.join(userDataPath, 'data')
const configFile = path.join(dataPath, 'config.json')
const statsFile = path.join(dataPath, 'stats.json')

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建文档',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate', '/editor')
            }
          }
        },
        {
          label: '刷新',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.reload()
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+=',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              const currentZoom = focusedWindow.webContents.getZoomLevel()
              focusedWindow.webContents.setZoomLevel(currentZoom + 0.5)
            }
          }
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              const currentZoom = focusedWindow.webContents.getZoomLevel()
              focusedWindow.webContents.setZoomLevel(currentZoom - 0.5)
            }
          }
        },
        {
          label: '重置缩放',
          accelerator: 'CmdOrCtrl+0',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.setZoomLevel(0)
            }
          }
        },
        { type: 'separator' },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools()
            }
          }
        },
        {
          label: '全屏',
          accelerator: 'F11',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            }
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于文档管理应用',
              message: '文档管理应用',
              detail: '版本: 1.0.0\n\n一款简洁高效的桌面文档管理工具'
            })
          }
        }
      ]
    }
  ]
  
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function ensureDataDir() {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
  }
  if (!fs.existsSync(configFile)) {
    const defaultConfig = {
      tags: [],
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
  createMenu()
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
