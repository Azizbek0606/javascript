const { app, BrowserWindow, screen, ipcMain } = require("electron");
const si = require("systeminformation");
const path = require("path");
// Tizim yoqilganda avtomatik ishga tushirish
app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true // Yashirin rejimda ishga tushirish
});
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

        // Sozlamalarni o'zgartirish
        this.CHECK_INTERVAL = 1000; // Tezroq tekshirish uchun 3000ms -> 1000ms
        this.NOTIFICATION_TIMEOUT = 5000;
        this.CRITICAL_THRESHOLD = 5;
        this.LOW_THRESHOLD = 20;
        this.FULL_THRESHOLD = 98;
        this.DEBOUNCE_DELAY = 300; // Kamroq kechikish uchun 500ms -> 300ms
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
                preload: path.join(__dirname, 'preload.js') // Preload qo'shish
            },
        });

        this.notificationWindow.loadFile(path.join(__dirname, "notification.html"));
        this.notificationWindow.on("closed", () => {
            this.notificationWindow = null;
        });

        // Oynani yopish tugmasi uchun event listener
        ipcMain.on('close-notification', () => {
            if (this.notificationWindow && !this.notificationWindow.isDestroyed()) {
                this.notificationWindow.hide();
                this.state.isNotifying = false;
            }
        });
    }

    setupEventListeners() {
        // Electron.js ning powerMonitor obyekti orqali emas, si.battery() bilan 
        // real vaqt monitoringini o'zimiz qilamiz
        app.on('will-quit', () => {
            this.stopMonitoring();
        });
    }

    startMonitoring() {
        // Dastlab tekshirish
        this.checkBatteryStatus();

        // Muntazam tekshirish
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
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = null;
        }
    }

    async checkBatteryStatus() {
        try {
            const battery = await si.battery();
            if (!battery.hasBattery) {
                this.showNotification("info", "No battery detected in the system");
                this.stopMonitoring();
                return;
            }

            const statusInfo = this.getBatteryStatus(battery);

            // Holat o'zgarishini tekshirish
            const isChargeStateChanged = this.state.lastCharging !== battery.isCharging;
            const isPercentThresholdChanged = this.hasPercentCrossedThreshold(this.state.lastPercent, battery.percent);
            const isStatusChanged = this.state.lastStatus !== statusInfo.status;

            // Agar o'zgarish bo'lsa, xabarni yangilash
            if (isChargeStateChanged || isPercentThresholdChanged || isStatusChanged ||
                (battery.percent !== this.state.lastPercent && Math.abs(battery.percent - this.state.lastPercent) >= 5)) {
                this.updateNotification(battery, statusInfo);
            } else {
                // Faqat oxirgi qiymatlarni yangilash, bildirish uchun emas
                this.state.lastPercent = battery.percent;
            }
        } catch (error) {
            console.error("Battery check failed:", error);
            this.showNotification("error", "Failed to check battery status");
        }
    }

    // Foiz qiymati chegaradan o'tganligini tekshirish
    hasPercentCrossedThreshold(lastPercent, currentPercent) {
        if (lastPercent === null || currentPercent === null) return false;

        const thresholds = [this.CRITICAL_THRESHOLD, this.LOW_THRESHOLD, 50, this.FULL_THRESHOLD];

        // Tekshirish: oldingi va hozirgi qiymatlar orasida biron bir chegara bormi?
        for (const threshold of thresholds) {
            if ((lastPercent < threshold && currentPercent >= threshold) ||
                (lastPercent >= threshold && currentPercent < threshold)) {
                return true;
            }
        }

        return false;
    }

    getBatteryStatus(battery) {
        const { percent, isCharging } = battery;

        if (!isCharging && percent <= this.CRITICAL_THRESHOLD) {
            return { status: "error", message: `Battery critically low at ${percent.toFixed(0)}%! Plug in now!` };
        }
        if (!isCharging && percent <= this.LOW_THRESHOLD) {
            return { status: "warning", message: `Battery low at ${percent.toFixed(0)}%. Charge soon.` };
        }
        if (isCharging && percent >= this.FULL_THRESHOLD) {
            return { status: "success", message: `Battery fully charged at ${percent.toFixed(0)}%!` };
        }
        if (isCharging) {
            return { status: "info", message: `Charging at ${percent.toFixed(0)}%` };
        }
        if (percent > 50) {
            return { status: "success", message: `Battery good at ${percent.toFixed(0)}%` };
        }
        return { status: "warning", message: `Battery discharging at ${percent.toFixed(0)}%` };
    }

    updateNotification(battery, { status, message }) {
        const { percent, isCharging } = battery;

        // Oldingi holatni saqlash
        this.state.lastStatus = status;
        this.state.lastCharging = isCharging;
        this.state.lastPercent = percent;

        // Debounce bildirish uchun
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = setTimeout(() => {
            this.showNotification(status, message);
        }, this.DEBOUNCE_DELAY);
    }

    showNotification(status, message) {
        if (!this.notificationWindow || this.notificationWindow.isDestroyed()) {
            this.createNotificationWindow();
        }

        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        // Joriy bildirish holati
        if (this.state.isNotifying) {
            // Oyna allaqachon ko'rsatilayotgan bo'lsa, faqat matnni yangilash
            this.notificationWindow.webContents.send("update-notification", {
                status,
                message,
                timestamp: new Date().toLocaleTimeString()
            });
        } else {
            // Yangi oynani ko'rsatish
            this.state.isNotifying = true;
            this.notificationWindow.webContents.send("show-notification", {
                status,
                message,
                timestamp: new Date().toLocaleTimeString()
            });
            this.notificationWindow.show();
        }

        // Avtomatik yopilish rejasi
        this.notificationTimeout = setTimeout(() => {
            if (this.notificationWindow && !this.notificationWindow.isDestroyed()) {
                this.notificationWindow.hide();
            }
            this.state.isNotifying = false;
        }, this.NOTIFICATION_TIMEOUT);
    }
}

const notifier = new BatteryNotifier();
notifier.initialize().catch(console.error);

app.on("window-all-closed", () => {
    app.quit();
});