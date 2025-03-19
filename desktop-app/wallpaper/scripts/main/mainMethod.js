import { setWallpaper } from "wallpaper";
import { db } from "../services/path_db.js";
import { getMainWindow } from "./main.js";

let currentGroup = null;
let imageIndex = 0;
let remainingTime = 0;
let timerInterval = null;
let nextImageTimeout = null;

function getLastState() {
    return db.prepare("SELECT last_group_id, last_image_index FROM setting").get();
}

function saveLastState(groupId, imageIndex) {
    db.prepare("UPDATE setting SET last_group_id = ?, last_image_index = ?").run(groupId, imageIndex);
}

function clearAllIntervals() {
    clearInterval(timerInterval);
    clearTimeout(nextImageTimeout);
    timerInterval = null;
    nextImageTimeout = null;
}

export function switchToNextGroup(groupId = null) {
    try {
        clearAllIntervals();

        const setting = db.prepare("SELECT * FROM setting").get();
        const autoSwitch = setting.auto_switch;
        const groups = db.prepare("SELECT * FROM image_group ORDER BY id").all();

        if (groups.length === 0) {
            sendErrorMessage("No groups found, please create a group first.");
            return;
        }

        if (groupId) {
            currentGroup = groups.find(g => g.id === Number(groupId));
            if (!currentGroup) {
                sendErrorMessage("Group not found.");
                return;
            }
            imageIndex = 0;
        } else {
            if (!currentGroup) {
                const lastState = getLastState();
                currentGroup = groups.find(g => g.id === lastState?.last_group_id) || groups[0];
                imageIndex = lastState?.last_image_index || 0;
            } else if (autoSwitch) {
                const currentIndex = groups.findIndex(g => g.id === currentGroup.id);
                currentGroup = groups[(currentIndex + 1) % groups.length];
                imageIndex = 0;
            }
        }
        applyNextImage(true);
    } catch (error) {
        console.error("Error in switchToNextGroup:", error);
        sendErrorMessage("An unexpected error occurred.");
    }
}

function applyNextImage(resetTimer = false) {
    try {
        if (!currentGroup) {
            sendErrorMessage("No active group found.");
            return;
        }

        const images = db.prepare("SELECT * FROM images WHERE group_id = ?").all(currentGroup.id);
        if (images.length === 0) {
            sendErrorMessage("No images found, please upload new.");
            return;
        }

        if (imageIndex >= images.length) {
            switchToNextGroup();
            return;
        }

        const imagePath = images[imageIndex]?.file_path;
        const nextImagePath = images[(imageIndex + 1) % images.length]?.file_path;

        if (!imagePath) {
            imageIndex++;
            applyNextImage();
            return;
        }

        setWallpaper(imagePath).then(() => {
            saveLastState(currentGroup.id, imageIndex);
            sendWallpaperUpdate(imagePath, nextImagePath);

            const setting = db.prepare("SELECT * FROM setting").get();
            const interval = setting.image_changes_interval || 3600;
            remainingTime = interval;

            if (resetTimer) {
                startTimer(interval);
            }

            imageIndex++;
            nextImageTimeout = setTimeout(() => applyNextImage(true), interval * 1000);
        }).catch((error) => {
            console.error("Failed to set wallpaper:", error);
            sendErrorMessage("Failed to set wallpaper.");
            imageIndex++;
            applyNextImage();
        });
    } catch (error) {
        console.error("Error in applyNextImage:", error);
        sendErrorMessage("An unexpected error occurred.");
    }
}

function startTimer(interval) {
    clearAllIntervals();

    timerInterval = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            sendTimerUpdate();
        }
    }, 1000);
}

function sendWallpaperUpdate(currentImage, nextImage) {
    let mainWindow = getMainWindow();
    if (mainWindow) {
        mainWindow.webContents.send("update-wallpaper", {
            currentImage,
            nextImage,
            groupName: getCurrentGroupName()
        });
    }
}

function sendTimerUpdate() {
    let mainWindow = getMainWindow();
    if (mainWindow) {
        mainWindow.webContents.send("update-timer", { remainingTime });
    }
}

function sendErrorMessage(message) {
    let mainWindow = getMainWindow();
    if (mainWindow) {
        mainWindow.webContents.send("error-message", { status: "error", message });
    }
}

export function getCurrentGroupName() {
    return currentGroup ? currentGroup.group_name : "No active group";
}
