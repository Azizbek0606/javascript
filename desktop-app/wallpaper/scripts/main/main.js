import path from "path";
import { fileURLToPath } from "url";
import { app, BrowserWindow, ipcMain, session } from "electron";

// ES Module uchun __dirname ni qayta aniqlash
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let loginWindow;

// CSP ni barcha oynalar uchun sozlash
function applyGlobalCSP() {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": [
                    "default-src 'self' https://cdnjs.cloudflare.com; script-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'"
                ]
            }
        });
    });
}

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
    applyGlobalCSP(); // CSP ni faqat bir marta chaqiramiz

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

    createLoginWindow();
});

// IPC orqali kelayotgan buyruqlarni boshqarish
ipcMain.on("login-success", () => {
    if (loginWindow) loginWindow.close();
});

ipcMain.on("window-minimise", (event) => {
    let win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
});

ipcMain.on("window-close", (event) => {
    let win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
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