import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import Store from 'electron-store';

const store = new Store();
let mainWindow: BrowserWindow | null = null;
let windows: BrowserWindow[] = [];

const createWindow = (isBlank: boolean = false): BrowserWindow => {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'xunMarkdown',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    window.loadURL('http://localhost:3000');
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  windows.push(window);

  window.on('closed', () => {
    windows = windows.filter(w => w !== window);
    if (window === mainWindow) {
      mainWindow = null;
    }
  });

  return window;
};

app.whenReady().then(() => {
  mainWindow = createWindow(true);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow(true);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const hasBlankWindow = (): boolean => {
  for (const win of windows) {
    const url = win.webContents.getURL();
    if (url.includes('blank=true') || url === 'http://localhost:3000/' || url.endsWith('index.html')) {
      return true;
    }
  }
  return false;
};

const openFileInWindow = (filePath: string) => {
  const targetWindow = hasBlankWindow() ? 
    windows.find(w => w.webContents.getURL().includes('blank=true') || w === mainWindow) :
    createWindow(false);
  
  if (targetWindow) {
    targetWindow.webContents.send('file-opened', filePath);
    targetWindow.show();
  }
};

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    openFileInWindow(result.filePaths[0]);
    return { success: true, filePath: result.filePaths[0] };
  }
  return { success: false };
});

ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, folderPath: result.filePaths[0] };
  }
  return { success: false };
});

ipcMain.handle('read-file', async (_event, filePath: string) => {
  try {
    const content = await fsPromises.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('write-file', async (_event, filePath: string, content: string) => {
  try {
    await fsPromises.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('save-file-dialog', async (_event, defaultName: string = 'untitled.md') => {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: [{ name: 'Markdown Files', extensions: ['md'] }]
  });

  if (!result.canceled && result.filePath) {
    return { success: true, filePath: result.filePath };
  }
  return { success: false };
});

ipcMain.handle('list-files', async (_event, folderPath: string) => {
  try {
    const entries = await fsPromises.readdir(folderPath, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async entry => ({
        name: entry.name,
        path: path.join(folderPath, entry.name),
        isDirectory: entry.isDirectory()
      }))
    );
    return { success: true, files };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('create-file', async (_event, filePath: string) => {
  try {
    await fsPromises.writeFile(filePath, '', 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('create-directory', async (_event, dirPath: string) => {
  try {
    await fsPromises.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('rename-item', async (_event, oldPath: string, newPath: string) => {
  try {
    await fsPromises.rename(oldPath, newPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('delete-item', async (_event, itemPath: string) => {
  try {
    const stat = await fsPromises.stat(itemPath);
    if (stat.isDirectory()) {
      await fsPromises.rm(itemPath, { recursive: true, force: true });
    } else {
      await fsPromises.unlink(itemPath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('save-image', async (_event, dataUrl: string, savePath: string) => {
  try {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    await fsPromises.writeFile(savePath, base64Data, 'base64');
    return { success: true, path: savePath };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('export-html', async (_event, content: string) => {
  const result = await dialog.showSaveDialog({
    defaultPath: 'document.html',
    filters: [{ name: 'HTML Files', extensions: ['html'] }]
  });

  if (!result.canceled && result.filePath) {
    try {
      await fsPromises.writeFile(result.filePath, content, 'utf-8');
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  return { success: false };
});

ipcMain.handle('export-pdf', async (event, _content: string) => {
  const focusedWindow = BrowserWindow.fromWebContents(event.sender);
  if (!focusedWindow) return { success: false };

  const result = await dialog.showSaveDialog({
    defaultPath: 'document.pdf',
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (!result.canceled && result.filePath) {
    try {
      const pdfData = await focusedWindow.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4'
      });
      await fsPromises.writeFile(result.filePath, pdfData);
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  return { success: false };
});

ipcMain.handle('get-settings', async () => {
  return {
    theme: store.get('theme', 'light'),
    autoSave: store.get('autoSave', true),
    shortcuts: store.get('shortcuts', {}),
    aiSettings: store.get('aiSettings', { enabled: false })
  };
});

ipcMain.handle('save-settings', async (_event, settings: Record<string, unknown>) => {
  try {
    for (const [key, value] of Object.entries(settings)) {
      store.set(key, value);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('show-item-in-folder', async (_event, itemPath: string) => {
  shell.showItemInFolder(itemPath);
  return { success: true };
});

ipcMain.handle('open-external', async (_event, url: string) => {
  shell.openExternal(url);
  return { success: true };
});

ipcMain.handle('search-files', async (_event, folderPath: string, query: string, options: { caseSensitive?: boolean; regex?: boolean } = {}) => {
  const results: Array<{
    path: string;
    name: string;
    matches: Array<{ line: number; content: string }>;
  }> = [];

  const searchQuery = options.regex ? 
    new RegExp(query, options.caseSensitive ? '' : 'i') :
    new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), options.caseSensitive ? '' : 'i');

  const searchDirectory = async (dir: string) => {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name !== '.git' && entry.name !== 'node_modules') {
          await searchDirectory(fullPath);
        }
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.markdown')) {
        try {
          const content = await fsPromises.readFile(fullPath, 'utf-8');
          const lines = content.split('\n');
          const matches: Array<{ line: number; content: string }> = [];
          
          lines.forEach((line, index) => {
            if (searchQuery.test(line)) {
              matches.push({ line: index + 1, content: line });
            }
          });
          
          if (matches.length > 0 || searchQuery.test(entry.name)) {
            results.push({
              path: fullPath,
              name: entry.name,
              matches
            });
          }
        } catch (error) {
          console.error('Error reading file:', fullPath, error);
        }
      }
    }
  };

  try {
    await searchDirectory(folderPath);
    return { success: true, results };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

app.on('open-file', (_event, filePath) => {
  openFileInWindow(filePath);
});
