require('dotenv').config();

const path = require('path');
const Database = require('better-sqlite3');
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

if (!BOT_TOKEN || !ADMIN_ID) {
    console.error("Xatolik: .env faylida BOT_TOKEN yoki ADMIN_ID yo'q!");
    process.exit(1);
}

const dbPath = path.join(__dirname, 'database', 'quote.db');
const db = new Database(dbPath);
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const deleteRequests = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, chatId.toString() === ADMIN_ID ? "Hi, Admin!" : "Hi, User!");
});

bot.onText(/\/add "(.+)" - (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (chatId.toString() !== ADMIN_ID) return bot.sendMessage(chatId, "❌ Sizda ruxsat yo'q!");
    try {
        db.prepare("INSERT INTO quotes (quote, author) VALUES (?, ?)").run(match[1].trim(), match[2].trim());
        bot.sendMessage(chatId, "✅ Iqtibos muvaffaqiyatli qo'shildi!");
    } catch (err) {
        bot.sendMessage(chatId, "❌ Iqtibos qo'shishda xatolik yuz berdi!");
    }
});

bot.onText(/\/delete (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (chatId.toString() !== ADMIN_ID) return bot.sendMessage(chatId, "❌ Sizda ruxsat yo'q!");
    const id = parseInt(match[1], 10);
    const quote = db.prepare("SELECT * FROM quotes WHERE id = ?").get(id);
    if (!quote) return bot.sendMessage(chatId, "❌ Bunday ID bilan iqtibos topilmadi!");
    deleteRequests[chatId] = id;
    bot.sendMessage(chatId, `"${quote.quote}" - ${quote.author}\n\n❗ O'chirishni xohlaysizmi? (yes/no)`);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase().trim();
    if (!(chatId in deleteRequests)) return;
    if (text === "yes") {
        db.prepare("DELETE FROM quotes WHERE id = ?").run(deleteRequests[chatId]);
        bot.sendMessage(chatId, `✅ Iqtibos (ID: ${deleteRequests[chatId]}) o'chirildi!`);
    } else {
        bot.sendMessage(chatId, "❌ O'chirish bekor qilindi.");
    }
    delete deleteRequests[chatId];
});
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    const helpMessage = `
🤖 *Bot buyruqlari:*

✅ *Iqtibos qo'shish:* 
*/add "Iqtibos matni" - Muallif*  
Misol:  
*/add "Haqiqiy do'stlik har doim ham muammosiz bo'lmaydi." - Bob Marley*

❌ *Iqtibos o'chirish:*  
*/delete ID*  
Misol:  
*/delete 3*  
(Avval tasdiqlash so‘raladi)

📖 *Yordam:*  
*/help* - Ushbu yordam xabarini ko‘rsatish.

ℹ️ *Izoh:* Buyruqlar faqat *Admin* uchun ishlaydi!
    `;

    bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
});
