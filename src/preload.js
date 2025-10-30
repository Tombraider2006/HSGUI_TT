const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: async () => ipcRenderer.invoke('get-app-version'),
  invoke: async (channel, ...args) => ipcRenderer.invoke(channel, ...args)
});


