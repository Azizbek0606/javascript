import { db } from './path_db.js';
import { getSystemUser } from './db_register.js';
import os from "os";

export async function saveWallpaperDb({ group_id, path, from_bot = 0, liked = 0 }) {
    const userData = await getSystemUser(os.userInfo().username);
    if (!userData) {
        console.error("User not found!");
        return false;
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO images (group_id, user_id, file_path, from_bot, liked) 
            VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(group_id || null, userData.id, path, from_bot ? 1 : 0, liked ? 1 : 0);
        return true;
    } catch (error) {
        console.error("Bazaga yozishda xatolik:", error);
        return false;
    }
}

