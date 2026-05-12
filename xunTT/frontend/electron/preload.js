const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    newWindow: () => ipcRenderer.invoke('window:new-window')
  },
  app: {
    quit: () => ipcRenderer.invoke('app:quit'),
    setAutoStart: (enabled) => ipcRenderer.invoke('app:set-autostart', enabled),
    getAutoStart: () => ipcRenderer.invoke('app:get-autostart')
  }
});
