const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  validateNodeProject: (dirPath) => ipcRenderer.invoke('validate-node-project', dirPath),
  gitPull: (dirPath) => ipcRenderer.invoke('git-pull', dirPath),
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  saveFiles: (dirPath, message, csvFile, mediaFiles) => 
    ipcRenderer.invoke('saveFiles', dirPath, message, csvFile, mediaFiles),
  runNpmStart: (dirPath) => ipcRenderer.invoke('runNpmStart', dirPath)
});