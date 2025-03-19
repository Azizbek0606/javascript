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
export function updateWallpaperGroup(imageId, newGroup) {
    try {
        db.prepare("UPDATE images SET group_id = ? WHERE id = ?").run(newGroup, imageId);
        return true;
    } catch (error) {
        console.error("Error updating wallpaper group:", error);
        return false;
    }
}
export function deleteImageDB(imageId) {
    try {
        const stmt = db.prepare("DELETE FROM images WHERE id = ?");
        const result = stmt.run(imageId);

        if (result.changes === 0) {
            console.warn(`No record found for imageId: ${imageId}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error deleting wallpaper from database:", error);
        return false;
    }
}
export function getImageGroups() {
    const stmt = db.prepare(`
        SELECT 
            ig.id AS group_id, 
            ig.group_name AS group_name,
            ig.created_at AS created_at,
            ig.applied_at AS applied_at,
            u.user_name AS uploaded_by,
            c.name AS category_name,
            c.id AS category_id,
            COUNT(i.id) AS total_images,
            (SELECT file_path FROM images WHERE group_id = ig.id ORDER BY id LIMIT 1) AS first_image,
            GROUP_CONCAT(i.file_path) AS all_images
        FROM image_group ig
        LEFT JOIN images i ON ig.id = i.group_id
        LEFT JOIN users u ON ig.user_id = u.id
        LEFT JOIN Category c ON ig.category_id = c.id
        GROUP BY ig.id
        ORDER BY ig.id;
    `);
    let groups = stmt.all().map(group => ({
        ...group,
        all_images: group.all_images ? group.all_images.split(",") : []
    }));

    return groups;
}
export function getGroupAndCategory() {
    const groups = db.prepare(`SELECT * FROM image_group`).all();
    const categories = db.prepare(`SELECT * FROM Category`).all();

    return {
        groups: groups,
        categories: categories
    };
}
export function getImageGroupById(group_id) {
    const stmt = db.prepare(`
        SELECT 
            ig.id AS group_id, 
            ig.group_name AS group_name,
            ig.created_at AS created_at,
            ig.applied_at AS applied_at,
            u.user_name AS uploaded_by,
            c.name AS category_name,
            c.id AS category_id,
            COUNT(i.id) AS total_images,
            (SELECT file_path FROM images WHERE group_id = ig.id ORDER BY id LIMIT 1) AS first_image,
            GROUP_CONCAT(i.file_path) AS all_images
        FROM image_group ig
        LEFT JOIN images i ON ig.id = i.group_id
        LEFT JOIN users u ON ig.user_id = u.id
        LEFT JOIN Category c ON ig.category_id = c.id
        WHERE ig.id = ?
        GROUP BY ig.id;
    `);

    let group = stmt.get(group_id);

    if (group) {
        group.all_images = group.all_images ? group.all_images.split(",") : [];
    }

    return group;
}
export function updateGroup(data) {
    const { id, name, category, time } = data;

    if (!id) {
        return { status: "error", message: "Group ID is required!" };
    }

    let existingGroup = db.prepare("SELECT * FROM image_group WHERE id = ?").get(id);

    if (!existingGroup) {
        return { status: "error", message: "Group not found!" };
    }

    let updates = [];
    let params = {};

    if (name && name !== existingGroup.name) {
        updates.push("group_name = @name");
        params.name = name;
    }
    if (category && category !== existingGroup.category_id) {
        updates.push("category_id = @category");
        params.category = category;
    }
    if (time && time !== existingGroup.applied_at) {
        updates.push("applied_at = @time");
        params.time = time;
    }

    if (updates.length === 0) {
        return { status: "info", message: "No changes detected." };
    }

    params.id = id;
    let query = `UPDATE image_group SET ${updates.join(", ")} WHERE id = @id`;

    db.prepare(query).run(params);

    return { status: "success", message: `${params.name} Updated successfuly` };
}
export function deleteGroup(group_id) {
    try {
        const stmt = db.prepare("DELETE FROM image_group WHERE id =?");
        const result = stmt.run(group_id);
        if (result.changes > 0) {
            return { status: "success", message: "Image Group deleted successfully" }
        }
    } catch (err) {
        console.error("Error deleting group from database:", err);
        return false;
    }
}
