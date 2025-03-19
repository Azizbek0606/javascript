import { getSystemUser } from './db_register.js';
import { db } from './path_db.js';
import os from "os";
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
export function getSettings() {
    let user = os.userInfo().username;
    let system_user = getSystemUser(user);

    return db.prepare("SELECT * FROM setting WHERE user_id = ?").get(system_user.id) || null;
}
export function updateUserSetting(data) {
    let [allow_special, auto_switch, image_interval, location] = data;
    let user = os.userInfo().username;
    let system_user = getSystemUser(user);

    if (!system_user || !system_user.id) {
        return { success: false, error: "User not found" };
    }

    let allow_special_int = allow_special ? 1 : 0;
    let auto_switch_int = auto_switch ? 1 : 0;

    let statement = db.prepare(`
        UPDATE setting 
        SET allow_special = ?, auto_switch = ?, image_changes_interval = ?, location = ? 
        WHERE user_id = ?
    `);

    let result = statement.run(allow_special_int, auto_switch_int, image_interval, location, system_user.id);

    return result.changes > 0 ? { success: true } : { success: false };
}
export function getCategory(){
    return db.prepare("SELECT * FROM Category").all() || [];
}
export function createGroup(data) {
    try {
        let user_name = os.userInfo().username;

        let statement = db.prepare(`
            INSERT INTO image_group (group_name, user_id, category_id, applied_at)
            VALUES (?, ?, ?, NULL)  
        `);

        let result = statement.run(data.name, user_name.id, data.category);

        return result.changes > 0 ? {success: true} : {success: false}; 
    } catch (error) {
        console.error("Error creating group:", error);
        return false;
    }
}
export function getGroupWithImage() {
    const stmt = db.prepare(`
        SELECT DISTINCT ig.*
        FROM image_group ig
        INNER JOIN images i ON ig.id = i.group_id
    `);

    return stmt.all();
}
export function getCurrentGroup(){
    let user = os.userInfo().username;
    let system_user = getSystemUser(user);
    return db.prepare("SELECT * FROM setting WHERE user_id = ?").get(system_user.id) || null;
}