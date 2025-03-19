const { app, BrowserWindow, screen, ipcMain, powerMonitor } = require("electron");
const si = require("systeminformation");
const path = require("path");

class BatteryNotifier {
    constructor() {
        this.notificationWindow = null;
        this.state = {
            lastStatus: null,
            lastPercent: null,
            lastCharging: null,
            isNotifying: false
        };
        this.checkInterval = null;
        this.debounceTimeout = null;
        this.notificationTimeout = null;

        this.CHECK_INTERVAL = 3000;
        this.NOTIFICATION_TIMEOUT = 5000;
        this.CRITICAL_THRESHOLD = 5;
        this.LOW_THRESHOLD = 20;
        this.FULL_THRESHOLD = 98;
        this.DEBOUNCE_DELAY = 500;
    }

    async initialize() {
        await app.whenReady();
        this.createNotificationWindow();
        this.setupEventListeners();
        this.startMonitoring();
    }

    createNotificationWindow() {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;

        this.notificationWindow = new BrowserWindow({
            width: 380,
            height: 120,
            x: width - 400,
            y: height - 140,
            frame: false,
            alwaysOnTop: true,
            transparent: true,
            skipTaskbar: true,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });

        this.notificationWindow.loadFile(path.join(__dirname, "notification.html"));
        this.notificationWindow.on("closed", () => {
            this.notificationWindow = null;
        });
    }

    setupEventListeners() {
        powerMonitor.on("on-ac", () => this.handlePowerConnected());
        powerMonitor.on("on-battery", () => this.handlePowerDisconnected());
        powerMonitor.on("suspend", () => this.handleSystemSleep());
        powerMonitor.on("resume", () => this.handleSystemWake());
    }

    startMonitoring() {
        this.checkBatteryStatus();
        this.checkInterval = setInterval(() => this.checkBatteryStatus(), this.CHECK_INTERVAL);
    }

    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = null;
        }
    }

    async checkBatteryStatus() {
        if (this.state.isNotifying) return;

        try {
            const battery = await si.battery();
            if (!battery.hasBattery) {
                this.showNotification("info", "No battery detected in the system");
                this.stopMonitoring();
                return;
            }

            const statusInfo = this.getBatteryStatus(battery);
            this.updateNotification(battery, statusInfo);
        } catch (error) {
            console.error("Battery check failed:", error);
            this.showNotification("error", "Failed to check battery status");
        }
    }

    getBatteryStatus(battery) {
        const { percent, isCharging } = battery;

        if (!isCharging && percent <= this.CRITICAL_THRESHOLD) {
            return { status: "error", message: `Battery critically low at ${percent}%! Plug in now!` };
        }
        if (!isCharging && percent <= this.LOW_THRESHOLD) {
            return { status: "warning", message: `Battery low at ${percent}%. Charge soon.` };
        }
        if (isCharging && percent >= this.FULL_THRESHOLD) {
            return { status: "success", message: "Battery fully charged!" };
        }
        if (isCharging) {
            return { status: "info", message: `Charging at ${percent}%` };
        }
        if (percent > 50) {
            return { status: "success", message: `Battery good at ${percent}%` };
        }
        return { status: "warning", message: `Battery discharging at ${percent}%` };
    }

    updateNotification(battery, { status, message }) {
        const { percent, isCharging } = battery;

        // Only notify on status or charging state change, not on every percentage change
        if (this.state.lastStatus !== status || this.state.lastCharging !== isCharging) {
            this.state.lastStatus = status;
            this.state.lastCharging = isCharging;
            this.state.lastPercent = percent;

            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }

            this.debounceTimeout = setTimeout(() => {
                this.showNotification(status, message);
            }, this.DEBOUNCE_DELAY);
        } else {
            // Update lastPercent silently without triggering notification
            this.state.lastPercent = percent;
        }
    }

    showNotification(status, message) {
        if (!this.notificationWindow || this.notificationWindow.isDestroyed()) {
            this.createNotificationWindow();
        }

        this.state.isNotifying = true;

        this.notificationWindow.webContents.send("show-notification", {
            status,
            message,
            timestamp: new Date().toLocaleTimeString()
        });

        this.notificationWindow.show();

        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            if (this.notificationWindow && !this.notificationWindow.isDestroyed()) {
                this.notificationWindow.hide();
            }
            this.state.isNotifying = false;
        }, this.NOTIFICATION_TIMEOUT);
    }

    handlePowerConnected() {
        this.showNotification("success", "Power connected: Charging started");
        if (!this.checkInterval) {
            this.startMonitoring();
        }
    }

    handlePowerDisconnected() {
        this.checkBatteryStatus().then(() => {
            if (this.state.lastPercent !== null) {
                const status = this.state.lastPercent <= this.CRITICAL_THRESHOLD ? "error" : "warning";
                this.showNotification(status, `Power disconnected at ${this.state.lastPercent}%`);
            }
        });
    }

    handleSystemSleep() {
        this.stopMonitoring();
        this.showNotification("info", "System entering sleep mode");
    }

    handleSystemWake() {
        this.startMonitoring();
        this.showNotification("info", "System resumed from sleep");
    }
}

const notifier = new BatteryNotifier();
notifier.initialize().catch(console.error);

app.on("window-all-closed", () => {
    notifier.stopMonitoring();
    app.quit();
});