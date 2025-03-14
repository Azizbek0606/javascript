import { db } from './path_db.js';
export async function getAllImages(limit = 10, offset = 0) {
    db.pragma("synchronous = OFF");
    db.pragma("cache_size = -10000");
    const stmt = db.prepare(`
        SELECT 
            images.id, 
            images.file_path, 
            images.created_at, 
            images.liked, 
            images.from_bot,
            images.group_id,
            images.user_id,
            users.user_name AS user_name, 
            image_group.group_name AS group_name
        FROM images
        LEFT JOIN users ON images.user_id = users.id
        LEFT JOIN image_group ON images.group_id = image_group.id
        ORDER BY images.created_at DESC
        LIMIT ? OFFSET ?
    `).all(limit, offset);

    return stmt.length ? stmt : [];
}
export function getWallpaperById(imageId) {
    try {
        return db.prepare("SELECT * FROM images WHERE id = ?").get(imageId) || null;
    } catch (error) {
        console.error("Error getting wallpaper by ID:", error);
        return null;
    }
}
export function getLatestImage() {
    const row = db.prepare("SELECT * FROM images ORDER BY created_at DESC LIMIT 1").get();
    return row || null;
}
