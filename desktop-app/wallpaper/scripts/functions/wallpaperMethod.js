import fs from "fs";
import * as fsPromises from "fs/promises";
import path from "path";
import { deleteImageDB, saveWallpaperDb } from "../services/wallpaperCRUD.js";
import { fileURLToPath } from "url";
import { getWallpaperById } from "../services/db_manager.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WALLPAPER_DIR = path.join(__dirname, "../../database/images/wallpaper");

export async function saveWallpaper({ name, group_id, buffer }) {

    try {
        if (!fs.existsSync(WALLPAPER_DIR)) {
            fs.mkdirSync(WALLPAPER_DIR, { recursive: true });
        }

        const ext = path.extname(name).toLowerCase();
        if (![".jpg", ".png", ".jpeg", ".svg", ".webp"].includes(ext)) {
            return { status: "error", message: "Image format must be: jpg, png, jpeg, svg, webp" };
        }

        const baseName = path.basename(name, ext);
        let finalFilePath = path.join(WALLPAPER_DIR, name);

        let counter = 1;
        while (fs.existsSync(finalFilePath)) {
            finalFilePath = path.join(WALLPAPER_DIR, `${baseName}_${counter}${ext}`);
            counter++;
        }

        const bufferData = Buffer.from(new Uint8Array(buffer));

        try {
            fs.writeFileSync(finalFilePath, bufferData);
        } catch (error) {
            console.error("Error while saving image :", error);
        }

        const saved = await saveWallpaperDb({
            group_id,
            from_bot: false,
            liked: false,
            path: finalFilePath
        });

        if (!saved) {
            if (fs.existsSync(finalFilePath)) {
                fs.unlinkSync(finalFilePath);
            }
            console.error("Data didn't save, image deleted");
            return { status: "error", message: "Database error" };
        }

        return { status: "success", message: "Image saved successfully" };

    } catch (error) {
        console.error("Error while saving image:", error);

        if (fs.existsSync(finalFilePath)) {
            fs.unlinkSync(finalFilePath);
            console.error("Error detected! Image deleted:", finalFilePath);
        }

        return { status: "error", message: "File system error" };
    }
}
export function processWallpapers(wallpapers) {
    return wallpapers.map(wp => ({
        id: wp.id,
        file_path: wp.file_path,
        created_at: wp.created_at,
        liked: Boolean(wp.liked),
        from_bot: Boolean(wp.from_bot),
        group_id: wp.group_id,
        user_id: wp.user_id,
        user_name: wp.user_name || "Unknown User",
        group_name: wp.group_name || "No Group"
    }));
}

export async function deleteWallpaper(imageId) {
    try {
        const wallpaper = await getWallpaperById(imageId);
        if (!wallpaper) {
            console.error("Wallpaper not found!");
            return false;
        }

        const filePath = wallpaper.file_path;

        try {
            await fsPromises.stat(filePath);
            await fsPromises.unlink(filePath);
        } catch (err) {
            console.error(`Wallpaper file not found or cannot be deleted: ${filePath}`, err);
            return false;
        }

        await deleteImageDB(imageId);

        return true;
    } catch (error) {
        console.error("Error deleting wallpaper:", error);
        return false;
    }
}
