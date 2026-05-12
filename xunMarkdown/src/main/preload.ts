import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  saveFileDialog: (defaultName?: string) => ipcRenderer.invoke('save-file-dialog', defaultName),
  listFiles: (folderPath: string) => ipcRenderer.invoke('list-files', folderPath),
  createFile: (filePath: string) => ipcRenderer.invoke('create-file', filePath),
  createDirectory: (dirPath: string) => ipcRenderer.invoke('create-directory', dirPath),
  renameItem: (oldPath: string, newPath: string) => ipcRenderer.invoke('rename-item', oldPath, newPath),
  deleteItem: (itemPath: string) => ipcRenderer.invoke('delete-item', itemPath),
  saveImage: (dataUrl: string, savePath: string) => ipcRenderer.invoke('save-image', dataUrl, savePath),
  exportHtml: (content: string) => ipcRenderer.invoke('export-html', content),
  exportPdf: (content: string) => ipcRenderer.invoke('export-pdf', content),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Record<string, unknown>) => ipcRenderer.invoke('save-settings', settings),
  showItemInFolder: (itemPath: string) => ipcRenderer.invoke('show-item-in-folder', itemPath),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  searchFiles: (folderPath: string, query: string, options?: { caseSensitive?: boolean; regex?: boolean }) => 
    ipcRenderer.invoke('search-files', folderPath, query, options),
  onFileOpened: (callback: (filePath: string) => void) => {
    const handler = (_event: unknown, filePath: string) => callback(filePath);
    ipcRenderer.on('file-opened', handler);
    return () => ipcRenderer.removeListener('file-opened', handler);
  }
});

export interface ElectronAPI {
  openFileDialog: () => Promise<{ success: boolean; filePath?: string }>;
  openFolderDialog: () => Promise<{ success: boolean; folderPath?: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  saveFileDialog: (defaultName?: string) => Promise<{ success: boolean; filePath?: string }>;
  listFiles: (folderPath: string) => Promise<{ success: boolean; files?: Array<{ name: string; path: string; isDirectory: boolean }>; error?: string }>;
  createFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  createDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
  renameItem: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (itemPath: string) => Promise<{ success: boolean; error?: string }>;
  saveImage: (dataUrl: string, savePath: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  exportHtml: (content: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  exportPdf: (content: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  getSettings: () => Promise<{
    theme: string;
    autoSave: boolean;
    shortcuts: Record<string, string>;
    aiSettings: { enabled: boolean; [key: string]: unknown };
  }>;
  saveSettings: (settings: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  showItemInFolder: (itemPath: string) => Promise<{ success: boolean }>;
  openExternal: (url: string) => Promise<{ success: boolean }>;
  searchFiles: (
    folderPath: string, 
    query: string, 
    options?: { caseSensitive?: boolean; regex?: boolean }
  ) => Promise<{
    success: boolean;
    results?: Array<{
      path: string;
      name: string;
      matches: Array<{ line: number; content: string }>;
    }>;
    error?: string;
  }>;
  onFileOpened: (callback: (filePath: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
