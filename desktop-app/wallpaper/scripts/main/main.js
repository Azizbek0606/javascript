import path from "path";
import { fileURLToPath } from "url";
import { app, BrowserWindow, ipcMain } from "electron";
import { loginFunc, signUpFunc } from "../functions/registration.js";
import { getSystemUser } from "../services/db_register.js";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow, loginWindow;
const systemUsername = os.userInfo().username;
const checkUser = getSystemUser(systemUsername);
const userImage = checkUser?.profile_image || "default";
const this_username = checkUser?.user_name;

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
    mainWindow.webContents.once("did-finish-load", () => {
        mainWindow.webContents.send("userData", { user_name: this_username, profile_image: userImage });
    });
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

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (!mainWindow) createMainWindow();
});