const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
    minimise: () => ipcRenderer.send("window-minimise"),
    close: ()=> ipcRenderer.send("window-close")
});
