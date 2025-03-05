const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow;
let loginWindow;

function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        frame: false,
        transparent: true,
        resizable: false,
        autoHideMenuBar: true,
        backgroundColor: "#00000000",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // nodeIntegration bo'lsa, contextIsolation false bo'lishi kerak
        },
    });

    loginWindow.loadFile(path.join(__dirname, "../../ui/templates/login.html"));
    applyCSP(loginWindow);

    loginWindow.on("closed", () => {
        loginWindow = null;
        createMainWindow();
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        frame: false,
        transparent: true,
        resizable: false,
        autoHideMenuBar: true,
        backgroundColor: "#00000000",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    mainWindow.loadFile(path.join(__dirname, "../../ui/templates/index.html"));
    applyCSP(mainWindow);
}

function applyCSP(win) {
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": ["default-src 'self' 'unsafe-inline'"]
            }
        });
    });
}

app.whenReady().then(() => {
    if (process.env.NODE_ENV === "development") {
        require("electron-reload")(path.join(__dirname, "../../ui/templates"), {
            electron: require(path.join(__dirname, "../../node_modules/electron")),
            awaitWriteFinish: true,
        });
    }

    createLoginWindow();
});

ipcMain.on("login-success", () => {
    if (loginWindow) loginWindow.close();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (!mainWindow) createMainWindow();
});
