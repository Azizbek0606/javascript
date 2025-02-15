require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const { createNewFile, userSteps: createSteps } = require("./commands/create");
const { updateUser, userSteps: updateSteps } = require("./commands/update");

function resetUserSession(chatId) {
    if (createSteps[chatId]) delete createSteps[chatId];
    if (updateSteps[chatId]) delete updateSteps[chatId];
}

bot.onText(/\/create/, (msg) => {
    const chatId = msg.chat.id;

    if (createSteps[chatId] || updateSteps[chatId]) {
        bot.sendMessage(chatId, "⛔ Siz avvalgi jarayonni yakunlamadingiz! Eski jarayon bekor qilindi.");
        resetUserSession(chatId);
    }

    createNewFile(bot, msg);
});

bot.onText(/\/update/, (msg) => {
    const chatId = msg.chat.id;

    if (createSteps[chatId] || updateSteps[chatId]) {
        bot.sendMessage(chatId, "⛔ Siz avvalgi jarayonni yakunlamadingiz! Eski jarayon bekor qilindi. Qayta buyruq yuboring!");
        resetUserSession(chatId);
    }

    updateUser(bot, msg);
});

bot.on("message", (msg) => {
    const chatId = msg.chat.id;

    if (msg.text?.startsWith("/")) return;

    if (createSteps[chatId]) {
        createNewFile(bot, msg);
    } else if (updateSteps[chatId]) {
        updateUser(bot, msg);
    }
});

module.exports = bot;
