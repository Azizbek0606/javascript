// Preload.js - kontekst izolyatsiyasi bilan ishlashni yaxshilash uchun
const { contextBridge, ipcRenderer } = require('electron');

// Xavfsiz API'ni expose qilish
contextBridge.exposeInMainWorld('electronAPI', {
    closeNotification: () => ipcRenderer.send('close-notification'),
    onShowNotification: (callback) => ipcRenderer.on('show-notification', callback),
    onUpdateNotification: (callback) => ipcRenderer.on('update-notification', callback)
});