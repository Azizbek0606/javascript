const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
    minimise: () => ipcRenderer.send("window-minimise"),
    close: () => ipcRenderer.send("window-close"),
    login: (data) => ipcRenderer.send('login', data),
    register: (data) => ipcRenderer.send('register', data),
    getProfileInfo: () => ipcRenderer.send("get-userData"),
    // ///////////////////////////// CRUD Profile methods ///////////////////////////////
    updateUsername: (data) => ipcRenderer.send('updateName', data),
    uploadProfileImage: (data) => ipcRenderer.send('uploadProfileImage', data),
    updateEmail: (data) => ipcRenderer.send('updateEmail', data),
    updatePassword: (data) => ipcRenderer.send('updatePassword', data),
    // // ///////////////////////////// CRUD Profile methods ///////////////////////////////


    // /////////////////////////////////////image methods //////////////////////////////////
    getGroupRequest: () => ipcRenderer.send("get-groups"),
    uploadWallpaper: (data) => ipcRenderer.send("upload-wallpaper", data),
    getAllWallpaper: () => ipcRenderer.send("get-all-wallpaper"),
    getLikeStatus: (imageId) => ipcRenderer.invoke("getLikeStatus", imageId)
});

contextBridge.exposeInMainWorld("electronAPI", {
    onLoginSuccess: (callback) => ipcRenderer.on("login-success", callback),
    onLoginError: (callback) => ipcRenderer.on("login-error", (event, message) => callback(message)),
    onRegisterSuccess: (callback) => ipcRenderer.on("sign-up-success", callback),
    onRegisterError: (callback) => ipcRenderer.on("sign-up-error", (event, message) => callback(message)),
    userData: (callback) => ipcRenderer.on("userData", (event, message) => callback(message)),
    // ///////////////////////////// CRUD Profile methods ///////////////////////////////
    showUpdatedNameStatus: (callback) => ipcRenderer.on("updatedStatus", (event, message) => callback(message)),
    profileImageSaved: (callback) => ipcRenderer.on("profileImageSaved", (_, data) => callback(data)),
    updateEmailStatus: (callback) => ipcRenderer.on("updatedEmailStatus", (event, message) => callback(message)),
    updatePasswordStatus: (callback) => ipcRenderer.on("updatedPasswordStatus", (event, message) => callback(message)),
    // ///////////////////////////// CRUD Profile methods ///////////////////////////////

    // ///////////////////////////////// image methods //////////////////////////////
    getGroup: () => ipcRenderer.invoke("getGroup"),
    saveImagesResponse: (callback) => ipcRenderer.on("upload-wallpaper-success", (event, message) => callback(message)),
    wallpaperResponse: (callback) => ipcRenderer.on("all-wallpapers", (event, message) => callback(message)),
    loadImages: (limit, offset) => ipcRenderer.invoke("load-images", { limit, offset }),
    getWallpaperById: (imageId) => ipcRenderer.invoke("getWallpaperById", imageId),
    updateWallpaperGroup: (imageId, newGroup) => ipcRenderer.invoke("updateWallpaperGroup", imageId, newGroup),
    deleteWallpaper: (imageId) => ipcRenderer.invoke("delete-wallpaper", imageId),
    updateLikeStatus: (imageId, newStatus) => ipcRenderer.invoke("updateLikeStatus", imageId, newStatus),
    getGroupById: (data) => ipcRenderer.invoke("getGroupById", data),
    updateGroup: (data) => ipcRenderer.invoke("updateGroup", data),
    deleteGroup: data => ipcRenderer.invoke("deleteGroup", data),
    getImageGroupById: (data) => ipcRenderer.invoke("getImageGroupById", data),
    getWeatherData: () => ipcRenderer.invoke("getWeatherData"),
    getLatestImage: () => ipcRenderer.invoke("getLatestImage"),
    getQuote: () => ipcRenderer.invoke("getQuote"),
    getSettings: () => ipcRenderer.invoke("getSettings"),
    updateUserSetting: (data) => ipcRenderer.invoke("updateUserSetting", data),
    getCategory: () => ipcRenderer.invoke("getCategory"),
    createGroup: (data) => ipcRenderer.invoke("createGroup", data),
});
