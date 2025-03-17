import { setWallpaper } from "wallpaper";
import { db } from "../services/path_db.js";

function getLastState() {
    return db.prepare("SELECT last_group_id, last_image_index FROM setting").get();
}

function saveLastState(groupId, imageIndex) {
    db.prepare("UPDATE setting SET last_group_id = ?, last_image_index = ?").run(groupId, imageIndex);
}

let currentGroup = null;
let imageIndex = 0;

export function switchToNextGroup() {
    try {
        const setting = db.prepare("SELECT * FROM setting").get();
        const autoSwitch = setting.auto_switch;

        const groups = db.prepare("SELECT * FROM image_group ORDER BY id").all();
        if (groups.length === 0) {
            console.log("No groups found.");
            return;
        }

        if (!currentGroup) {
            const lastState = getLastState();
            console.log("Last saved state:", lastState); // Tekshirish uchun log

            if (lastState?.last_group_id) {
                currentGroup = groups.find(g => g.id === lastState.last_group_id) || groups[0];
                imageIndex = lastState.last_image_index || 0;
            } else {
                currentGroup = groups[0];
                imageIndex = 0; // Faqat birinchi marta 0 qilamiz
            }
        } else {
            const currentIndex = groups.findIndex(g => g.id === currentGroup.id);
            if (currentIndex === -1) {
                currentGroup = groups[0];
            } else if (autoSwitch) {
                currentGroup = groups[(currentIndex + 1) % groups.length];
            }
            imageIndex = 0; // Guruh almashtirilganda 0 qilishni saqlab qolamiz
        }

        console.log(`Switched to group: ${currentGroup?.group_name || "unknown"} at imageIndex: ${imageIndex}`);
        applyNextImage();
    } catch (error) {
        console.error("Error in switchToNextGroup:", error);
    }
}

function applyNextImage() {
    try {
        if (!currentGroup) {
            console.log("No active group found.");
            return;
        }

        const images = db.prepare("SELECT * FROM images WHERE group_id = ?").all(currentGroup.id);
        if (images.length === 0) {
            console.log("No images found in group:", currentGroup.group_name);
            switchToNextGroup();
            return;
        }

        if (imageIndex >= images.length) {
            console.log("No more images in this group, switching to next.");
            switchToNextGroup();
            return;
        }

        const imagePath = images[imageIndex]?.file_path;
        if (!imagePath) {
            console.log("Invalid image path.");
            imageIndex++;
            applyNextImage(); // Keyingi rasmga o‘tish
            return;
        }

        setWallpaper(imagePath)
            .then(() => {
                console.log(`Applied: ${imagePath}`);
                saveLastState(currentGroup.id, imageIndex); // Hozirgi holatni saqlaymiz
                imageIndex++;

                const setting = db.prepare("SELECT * FROM setting").get();
                const interval = setting.image_changes_interval || 3600;

                setTimeout(applyNextImage, interval * 1000);
            })
            .catch((error) => {
                console.error("Failed to set wallpaper:", error);
                imageIndex++;
                applyNextImage();
            });

    } catch (error) {
        console.error("Error in applyNextImage:", error);
    }
}
