import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getBookshelf: () => ipcRenderer.invoke('get-bookshelf'),
  addBookToShelf: (book: any, shelfId: string) => ipcRenderer.invoke('add-book-to-shelf', book, shelfId),
  removeBookFromShelf: (bookId: string, shelfId: string) => ipcRenderer.invoke('remove-book-from-shelf', bookId, shelfId),
  getHistory: () => ipcRenderer.invoke('get-history'),
  addToHistory: (book: any) => ipcRenderer.invoke('add-to-history', book),
  removeFromHistory: (bookId: string) => ipcRenderer.invoke('remove-from-history', bookId),
  callApi: (endpoint: string, data: any) => ipcRenderer.invoke('call-api', endpoint, data),
  getEnvironment: () => ipcRenderer.invoke('get-environment'),
  setEnvironment: (env: string) => ipcRenderer.invoke('set-environment', env),
  getDeviceId: () => ipcRenderer.invoke('get-device-id'),
});
