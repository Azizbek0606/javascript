const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    lorem: (num1, num2, operation) => ipcRenderer.send('shoptoli', num1, num2, operation),
    onResult: (callback) => ipcRenderer.on('result', callback)
});