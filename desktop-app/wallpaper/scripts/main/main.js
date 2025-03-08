import path from "path";
import { fileURLToPath } from "url";
import { app, BrowserWindow, ipcMain, session } from "electron";
import { loginFunc, signUpFunc } from "../functions/registration.js";
import { getSystemUser } from "../services/db_register.js";
import os from "os";
// ES Module uchun __dirname ni qayta aniqlash
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let loginWindow;

// Login oynasini yaratish
function createLoginWindow() {
    loginWindow = new BrowserWindow({
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
    });

    loginWindow.loadFile(path.join(__dirname, "../../ui/templates/login.html"));
    loginWindow.on("closed", () => {
        loginWindow = null;
        createMainWindow();
    });
}

// Asosiy oynani yaratish
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
        },
    });

    mainWindow.loadFile(path.join(__dirname, "../../ui/templates/index.html"));
}

// Ilovani boshlash
app.whenReady().then(async () => {

    if (process.env.NODE_ENV === "development") {
        try {
            const { default: reload } = await import("electron-reload");
            reload(__dirname, {
                electron: path.join(__dirname, "../../node_modules/electron"),
                awaitWriteFinish: true,
            });
        } catch (error) {
            console.error("electron-reload yuklanmadi:", error);
        }
    }

    try {
        let systemUsername = os.userInfo().username;
        let checkUser = getSystemUser(systemUsername);

        if (checkUser) {
            createMainWindow();
        } else {
            createLoginWindow();
        }
    } catch (error) {
        console.error("Error while checking user:", error);
        createLoginWindow();
    }

});

// IPC orqali kelayotgan buyruqlarni boshqarish

ipcMain.on("window-minimise", (event) => {
    let win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
});
// Login method ----------------------------------------------------------------
ipcMain.on("window-close", (event) => {
    let win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
});
ipcMain.on("login", (event, message) => {
    let login = loginFunc(message);
    if (login.success) {
        event.reply("login-success");
        createMainWindow();
        if (loginWindow) loginWindow.close();
        createMainWindow();
    } else {
        event.reply("login-error", login.message);
    }
});
// -----------------------------------------------------------------
// sign up ----------------------------------------------------------------

ipcMain.on("register", (event, message) => {

    let signUp = signUpFunc(message);

    if (signUp.success) {
        event.reply("sign-up-success");
        if (loginWindow) loginWindow.close();
        createMainWindow();
    } else {
        event.reply("sign-up-error", signUp.error);
    }
});

// Barcha oynalar yopilganda ilovani to‘xtatish
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// MacOS da barcha oynalar yopilgandan keyin qayta ochish
app.on("activate", () => {
    if (!mainWindow) createMainWindow();
});