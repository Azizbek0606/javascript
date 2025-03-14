import { db } from './path_db.js';
import bcrypt from 'bcrypt';

export function getSystemUser(systemUName) {
    if (!systemUName || typeof systemUName !== "string") {
        return null;
    }

    return db.prepare("SELECT * FROM users WHERE system_user = ?").get(systemUName) || null;
}
export function newUser(userData) {
    if (
        !userData || typeof userData !== "object" ||
        !userData.username || typeof userData.username !== 'string' ||
        !userData.password || typeof userData.password !== 'string' ||
        !userData.system_user || typeof userData.system_user !== 'string' ||
        !userData.email || typeof userData.email !== 'string'
    ) {
        return { error: "Invalid user data" };
    }

    try {
        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(userData.password, saltRounds);

        const stmt = db.prepare(
            "INSERT INTO users (user_name, password, system_user, email, logged_at) VALUES (?, ?, ?, ?, ?)"
        );
        const now = new Date();
        const result = stmt.run(
            userData.username,
            hashedPassword,
            userData.system_user,
            userData.email,
            now.toISOString().slice(0, 19).replace("T", " ")
        );

        return { success: true, userId: result.lastInsertRowid };
    } catch (e) {
        console.error("Error while saving user data:", e);
        return { error: "Error while saving user data" };
    }
}
export function updateUsernamedb(newUsername, system_user) {
    const updateUser = db.prepare(`UPDATE users SET user_name = ? WHERE system_user = ?`);
    let status = updateUser.run(newUsername, system_user);
    return status.changes > 0 ? { success: true } : { success: false };
}
export function updateAvatardb(imagePath, systemUsername) {
    const updateUser = db.prepare(`UPDATE users SET profile_image =? WHERE system_user =?`);
    let status = updateUser.run(imagePath, systemUsername);
    return status.changes > 0 ? { success: true } : { success: false };
}
export function updatePassworddb(newPassword, system_user) {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const updateUser = db.prepare(`UPDATE users SET password =? WHERE system_user =?`);
    let status = updateUser.run(hashedPassword, system_user);
    return status.changes > 0 ? { success: true } : { success: false };
}
export function updateEmaildb(newEmail, system_user) {
    const updateUser = db.prepare(`UPDATE users SET email =? WHERE system_user =?`);
    let status = updateUser.run(newEmail, system_user);
    return status.changes > 0 ? { success: true } : { success: false };
}