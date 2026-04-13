const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (fileName, content, defaultPath) => ipcRenderer.invoke('save-file', { fileName, content, defaultPath }),
  getAppPath: () => ipcRenderer.invoke('get-app-path')
});
