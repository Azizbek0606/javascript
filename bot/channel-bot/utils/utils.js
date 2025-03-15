const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database/data.db');
const db = new Database(dbPath);

function generateFileCode() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';

    while (true) {
        let randomLetter = letters[Math.floor(Math.random() * letters.length)];
        let randomNumber = Math.floor(10000 + Math.random() * 90000);
        let fileCode = randomLetter + randomNumber;

        const stmt = db.prepare('SELECT COUNT(*) as count FROM files WHERE code = ?');
        const result = stmt.get(fileCode);

        if (result.count === 0) {
            return fileCode;
        }
    }
}

function checkFileCode(code) {
    return /^[a-zA-Z][0-9]{5}$/.test(code);
}
function checkText(text) {
    return /^[a-zA-Z_]{1,50}$/.test(text);
}
function checkNumber(value) {
    return /^\d+$/.test(value);
}
module.exports = { generateFileCode, checkFileCode, checkNumber, checkText };