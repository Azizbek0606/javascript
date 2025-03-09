const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
    minimise: () => ipcRenderer.send("window-minimise"),
    close: () => ipcRenderer.send("window-close"),
    login: (data) => ipcRenderer.send('login', data),
    register: (data) => ipcRenderer.send('register', data),
    getProfileInfo: () => ipcRenderer.send("get-userData"),
    // ///////////////////////////// CRUD Profile methods ///////////////////////////////
    updateUsername: (data) => ipcRenderer.send('updateName', data),
    // // ///////////////////////////// CRUD Profile methods ///////////////////////////////
});

contextBridge.exposeInMainWorld("electronAPI", {
    onLoginSuccess: (callback) => ipcRenderer.on("login-success", callback),
    onLoginError: (callback) => ipcRenderer.on("login-error", (event, message) => callback(message)),
    onRegisterSuccess: (callback) => ipcRenderer.on("sign-up-success", callback),
    onRegisterError: (callback) => ipcRenderer.on("sign-up-error", (event, message) => callback(message)),
    userData: (callback) => ipcRenderer.on("userData", (event, message) => callback(message)),
    // ///////////////////////////// CRUD Profile methods ///////////////////////////////
    showUpdatedNameStatus: (callback) => ipcRenderer.on("updatedStatus", (event, message) => callback(message))
    // ///////////////////////////// CRUD Profile methods ///////////////////////////////
});
