const Database = require('better-sqlite3');
const db = new Database('./data/database/data.db');
const generateFileCode = require('./utils/utils');

function addNewUser(user) {
    const stmt = db.prepare(`
        INSERT INTO users (telegram_id, first_name, last_name, username, language_code)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(telegram_id) DO NOTHING;
    `);
    stmt.run(user.telegram_id, user.first_name, user.last_name, user.username, user.language_code);
}

function getAllUserData() {
    const stmt = db.prepare('SELECT telegram_id, user_name FROM users');
    const rows = stmt.all();
    return rows;
}

function getUserById(userId) {
    const stmt = db.prepare('SELECT * FROM users WHERE telegram_id =?');
    const row = stmt.get(userId);
    return row;
}

function getCategories() {
    const stmt = db.prepare('SELECT * FROM categories');
    const rows = stmt.all();
    const categoryList = rows.map(category => `${category.id} - ${category.name}`);
    return categoryList;
}

function getFilesById(categoryId) {
    const stmt = db.prepare('SELECT * FROM files WHERE category_id =?');
    const rows = stmt.all(categoryId);
    return rows;
}


function deleteUser(telegram_id) {
    const stmt = db.prepare("DELETE FROM users WHERE telegram_id = ?");
    stmt.run(telegram_id);
}


function createFile(file) {
    try {
        const existingFile = db.prepare(`
            SELECT * FROM files WHERE name = ? OR code = ?
        `).get(file.name, file.code);

        if (existingFile) {
            console.log(`❌ Fayl qo‘shilmadi: "${file.name}" allaqachon mavjud!`);
            return;
        }

        const stmt = db.prepare(`
            INSERT INTO files (name, path, category_id, description, code, author_id, count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(name) DO NOTHING;;
        `);

        stmt.run(
            file.fileName,
            file.path,
            file.categoryId,
            file.description,
            file.code,
            file.author_id,
            file.count
        );

        console.log(`✅ Fayl qo‘shildi: ${file.fileName}`);
        return true;
    } catch (error) {
        console.error("❌ Fayl qo‘shishda xatolik:", error.message);
    }
}
function checkExistingFiles(fileName) {
    try {
        const stmt = db.prepare('SELECT name FROM files WHERE name = ?');
        const row = stmt.get(fileName);

        return !row;
    } catch (error) {
        console.error("❌ Xatolik yuz berdi:", error.message);
        return null;
    }
}


module.exports = { addNewUser, getCategories, deleteUser, createFile , checkExistingFiles};