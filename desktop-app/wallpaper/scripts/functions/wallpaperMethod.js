import fs from "fs";
import path from "path";
import { saveWallpaperDb } from "../services/wallpaperCRUD.js";
import { fileURLToPath } from "url";

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
