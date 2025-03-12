import path from "path";
import os from "os";
import fs from "fs";
import { fileURLToPath } from "url";
import { app, BrowserWindow, ipcMain } from "electron";
import { loginFunc, signUpFunc, updateUsername, addAvatarToProfile, updatePassword, updateEmail } from "../functions/registration.js";
import { getSystemUser } from "../services/db_register.js";
import { getGroups, getAllImages, getWallpaperById } from "../services/db_manager.js";
import { saveWallpaper, processWallpapers, deleteWallpaper } from "../functions/wallpaperMethod.js";
import { updateWallpaperGroup } from "../services/wallpaperCRUD.js";
import { db } from "../services/path_db.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow, loginWindow;

function createWindow(type, options, file) {
    let win = new BrowserWindow({
        width: 1000,
        height: 600,
        frame: false,
        transparent: true,
        resizable: false,
        autoHideMenuBar: true,
        backgroundColor: "#00000000",
        icon: path.join(__dirname, "../../assets/resources/images/app-icon/icon.png"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
        ...options,
    });

    win.loadFile(path.join(__dirname, `../../ui/templates/${file}.html`));
    win.on("closed", () => (type === "login" ? (loginWindow = null) : (mainWindow = null)));
    return win;
}

function createLoginWindow() {
    loginWindow = createWindow("login", {}, "login");
}

function createMainWindow() {
    mainWindow = createWindow("main", {}, "index");
}

app.whenReady().then(async () => {
    if (process.env.NODE_ENV === "development") {
        try {
            const { default: reload } = await import("electron-reload");
            reload(__dirname, { electron: path.join(__dirname, "../../node_modules/electron"), awaitWriteFinish: true });
        } catch (error) {
            console.error("electron-reload yuklanmadi:", error);
        }
    }

    const checkUser = getSystemUser(os.userInfo().username);

    checkUser ? createMainWindow() : createLoginWindow();
});

ipcMain.on("window-minimise", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on("window-close", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
});

ipcMain.on("login", (event, message) => {
    let login = loginFunc(message);
    if (login.success) {
        event.reply("login-success");
        loginWindow?.close();
        createMainWindow();
    } else {
        event.reply("login-error", login.message);
    }
});

ipcMain.on("register", (event, message) => {
    let signUp = signUpFunc(message);
    if (signUp.success) {
        event.reply("sign-up-success");
        loginWindow?.close();
        createMainWindow();
    } else {
        event.reply("sign-up-error", signUp.error);
    }
});

function sendUserData(event) {
    const updatedUser = getSystemUser(os.userInfo().username);
    event.reply("userData", {
        user_name: updatedUser?.user_name,
        profile_image: updatedUser?.profile_image || "default"
    });
}

ipcMain.on("get-userData", sendUserData);

ipcMain.on("updateName", (event, data) => {
    try {
        let updatedUser = updateUsername(data);
        event.reply("updatedStatus", updatedUser);
        if (updatedUser.status == "success") {
            sendUserData(event);
        }
    } catch (error) {
        console.error("Error updating username:", error);
        event.reply("updatedStatus", { status: "error", message: "Internal server error" });
    }
});
ipcMain.on("uploadProfileImage", (event, data) => {
    try {
        const savePath = path.join(__dirname, "../../database/images/profile_image");

        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
        }

        const files = fs.readdirSync(savePath);
        files.forEach((file) => {
            const filePath = path.join(savePath, file);
            fs.unlinkSync(filePath);
        });

        const filePath = path.join(savePath, data.name);
        fs.writeFileSync(filePath, Buffer.from(data.buffer));

        let savedbStatus = addAvatarToProfile(filePath);
        if (savedbStatus.status !== "success") {
            fs.unlinkSync(filePath);
            throw new Error("Failed to save image path in database.");
        } else {
            sendUserData(event);
        }

        event.reply("profileImageSaved", savedbStatus);

    } catch (error) {
        console.error("Error saving image:", error);
        event.reply("profileImageSaved", { status: "error", message: "Something went wrong while saving image!" });
    }
});
ipcMain.on("updatePassword", (event, data) => {
    try {
        let updatedUser = updatePassword(data.oldPassword, data.newPassword);
        event.reply("updatedPasswordStatus", updatedUser);
    } catch (error) {
        console.error("Error updating password:", error);
        event.reply("updatedPasswordStatus", { status: "error", message: "Internal server error" });
    }
});
ipcMain.on("updateEmail", (event, data) => {
    try {
        let updatedUser = updateEmail(data);
        event.reply("updatedEmailStatus", updatedUser);
    } catch (error) {
        console.error("Error updating email:", error);
        event.reply("updatedEmailStatus", { status: "error", message: "Internal server error" });
    }
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
function sendGroup(event) {
    let groups = getGroups();    
    event.reply("groups", groups);
}
ipcMain.on("get-groups", sendGroup);
ipcMain.on("upload-wallpaper", async (event, data) => {
    try {
        if (!data || !data.name || !data.buffer) {
            throw new Error("Invalid data: image!");
        }

        const saved = await saveWallpaper({
            name: data.name,
            group_id: data.group_id || null,
            buffer: data.buffer
        });

        event.reply("upload-wallpaper-success", saved);

    } catch (error) {
        console.error("Wallpaper upload error:", error);
        event.reply("upload-wallpaper-success", { status: "error", message: error.message });
    }
});
ipcMain.handle("load-images", async (_, { limit, offset }) => {
    const rawImages = await getAllImages(limit, offset);
    return processWallpapers(rawImages);
});
app.on("activate", () => {
    if (!mainWindow) createMainWindow();
});
ipcMain.handle("getWallpaperById", async (event, imageId) => {
    return getWallpaperById(imageId);
});
ipcMain.handle("delete-wallpaper", async (_, imageId) => {
    try {
        const success = await deleteWallpaper(imageId);
        return success;
    } catch (error) {
        console.error("Failed to delete wallpaper:", error);
        return false;
    }
});
ipcMain.handle("updateWallpaperGroup", async (event, imageId, newGroup) => {
    return updateWallpaperGroup(imageId, newGroup);
});
ipcMain.handle("getLikeStatus", async (event, imageId) => {
    const row = db.prepare("SELECT liked FROM images WHERE id = ?").get(imageId);
    return row ? !!row.liked : false;
});
ipcMain.handle("updateLikeStatus", async (event, imageId, newStatus) => {
    try {
        const likeValue = newStatus ? 1 : 0;

        const stmt = db.prepare("UPDATE images SET liked = ? WHERE id = ?");
        stmt.run(likeValue, imageId);

        return true;
    } catch (error) {
        console.error("Like statusni yangilashda xatolik:", error);
        throw error;
    }
});

