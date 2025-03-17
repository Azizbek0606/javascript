import { exec } from "child_process";
import path from "path";

let lastWallpaper = null;

export function setWallpaper(imagePath) {
    if (!imagePath || typeof imagePath !== "string") {
        console.error("Invalid image path!");
        return;
    }

    const absPath = path.resolve(imagePath);

    exec(`reg add "HKEY_CURRENT_USER\\Control Panel\\Desktop" /v Wallpaper /t REG_SZ /d "${absPath}" /f`, (error) => {
        if (error) {
            console.error("Failed to set wallpaper:", error);
            return;
        }

        exec(`RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters`, (updateError) => {
            if (updateError) {
                console.error("Failed to refresh wallpaper:", updateError);
            }
        });
    });

    lastWallpaper = absPath;
}
