import path from "path";
import os from "os";
import fs from "fs";
import { fileURLToPath } from "url";
import { app, BrowserWindow, ipcMain, Tray, Menu } from "electron";
import AutoLaunch from "auto-launch"; // Auto-start uchun
import { switchToNextGroup } from "./mainMethod.js"; // Wallpaper almashtirish funksiyasi
import { loginFunc, signUpFunc, updateUsername, addAvatarToProfile, updatePassword, updateEmail } from "../functions/registration.js";
import { getSystemUser } from "../services/db_register.js";
import { createGroup, getAllImages, getCategory, getLatestImage, getSettings, getWallpaperById, updateUserSetting } from "../services/db_manager.js";
import { saveWallpaper, processWallpapers, deleteWallpaper } from "../functions/wallpaperMethod.js";
import { deleteGroup, getGroupAndCategory, getImageGroupById, getImageGroups, updateGroup, updateWallpaperGroup } from "../services/wallpaperCRUD.js";
import { db } from "../services/path_db.js";
import { getWeatherData } from "../integration/weatherData.js";
import { updateQuote } from "../integration/quote.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow, tray;

// **1. Auto-launch sozlash** (kompyuter yoqilishi bilan ishga tushirish)
const autoLauncher = new AutoLaunch({
    name: "WallpaperManager",
    path: process.execPath,
});

autoLauncher.isEnabled().then((enabled) => {
    if (!enabled) autoLauncher.enable();
});

// **2. Tray menyu va boshqaruv**
function createTray() {
    tray = new Tray(path.join(__dirname, "../../assets/resources/images/app-icon/icon.png"));
    const contextMenu = Menu.buildFromTemplate([
        { label: "Show App", click: showMainWindow },
        {
            label: "Exit", click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip("Wallpaper Manager");
    tray.setContextMenu(contextMenu);

    tray.on("click", showMainWindow);
}

// **3. MainWindow yaratish yoki mavjudini ko‘rsatish**
function showMainWindow() {
    if (!mainWindow) {
        createMainWindow();
    }
    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }
    mainWindow.show();
}

// **4. MainWindow yaratish**
function createMainWindow() {
    mainWindow = new BrowserWindow({
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
        }
    });

    mainWindow.loadFile(path.join(__dirname, "../../ui/templates/index.html"));

    mainWindow.on("close", (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on("closed", () => {
        mainWindow = null; // Oyna yopilganda null qilamiz, tray orqali qayta ochish uchun
    });
}

// **5. Ilova boshlanganda UI ochilmasin, faqat wallpaper almashtirish ishlasin**
app.whenReady().then(() => {
    createTray();

    if (!app.commandLine.hasSwitch("show-ui")) {
        console.log("Wallpaper background service ishga tushdi...");
    } else {
        showMainWindow();
    }

    switchToNextGroup();
});

// **6. Komandalar (UI boshqarish)**
ipcMain.on("window-minimise", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on("window-close", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.hide();
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
ipcMain.handle("getGroup", async () => {
    return await getImageGroups();
});
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
ipcMain.handle("getGroupById", async (event) => {
    return await getGroupAndCategory();
});
ipcMain.handle("updateGroup", async (event, data) => {
    try {
        const updated = await updateGroup(data);
        return updated;
    } catch (error) {
        console.error("error while updating group:", error);
        return { status: "error", message: "error while updating group" };
    }
})
ipcMain.handle("deleteGroup", (event, data) => {
    try {
        const deleted = deleteGroup(data);
        return deleted;
    } catch (error) {
        console.error("error while deleting group:", error);
        return { status: "error", message: "error while deleting group" };
    }
});
ipcMain.handle("getImageGroupById", (event, data) => {
    try {
        let groupById = getImageGroupById(data);
        return groupById;
    } catch (e) {
        console.error("error while getting group by id:", e);
        return { status: "error", message: "error while getting group by id" };
    }
});
ipcMain.handle("getWeatherData", async (event) => {
    try {
        return await getWeatherData();
    } catch (e) {
        console.error("error while getting weather data:", e);
        return { status: "error", message: "error while getting weather data" };
    }
});
ipcMain.handle("getLatestImage", (event) => {
    try {
        return getLatestImage();
    } catch (e) {
        console.error("error while getting latest image:", e);
        return { status: "error", message: "error while getting latest image" };
    }
})
ipcMain.handle("getQuote", async (event) => {
    try {
        return await updateQuote();
    } catch (e) {
        console.error("error while getting quote:", e);
        return { status: "error", message: "error while getting quote" };
    }
});
ipcMain.handle("getSettings", (event) => {
    try {
        return getSettings();
    } catch (e) {
        console.error("error while getting settings:", e);
        return { status: "error", message: "error while getting settings" };
    }
});
ipcMain.handle("updateUserSetting", (event, data) => {
    try {
        return updateUserSetting(data);
    } catch (e) {
        console.error("error while updating user setting:", e);
        return { status: "error", message: "error while updating user setting" };
    }
});
ipcMain.handle("getCategory", (event) => {
    try {
        return getCategory();
    } catch (e) {
        console.error("error while getting category:", e);
        return { status: "error", message: "error while getting category" };
    }
});
ipcMain.handle("createGroup", (event, data) => {
    try {
        return createGroup(data);
    } catch (e) {
        console.error("error while creating group:", e);
        return { status: "error", message: "error while creating group" };
    }
});