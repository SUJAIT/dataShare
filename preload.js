const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('datashare', {
  onInit: (callback) => ipcRenderer.on('init-data', (event, data) => callback(data)),
  deleteFile: (storedName) => ipcRenderer.invoke('file:delete', storedName),
  openFile: (storedName) => ipcRenderer.invoke('file:open', storedName),
  saveFile: (storedName, originalName) => ipcRenderer.invoke('file:save', storedName, originalName),
  printFile: (storedName) => ipcRenderer.invoke('file:print', storedName),
  openStorageFolder: () => ipcRenderer.invoke('storage:open-folder'),
  setNetworkIp: (ip) => ipcRenderer.invoke('network:set-ip', ip)
});
