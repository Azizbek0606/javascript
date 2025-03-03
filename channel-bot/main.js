require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const { createNewFile, userSteps: createSteps } = require("./commands/create");
const { updateUser, userSteps: updateSteps } = require("./commands/update");
const { helpCommand } = require("./commands/help");
const {
    allCategory,
    addCategory,
    editCategories,
    removeCategory,
    getProjectsByCategory
}= require("./commands/category");
function resetUserSession(chatId) {
    if (createSteps[chatId]) delete createSteps[chatId];
    if (updateSteps[chatId]) delete updateSteps[chatId];
}

bot.onText(/\/create/, (msg) => {
    const chatId = msg.chat.id;

    if (createSteps[chatId] || updateSteps[chatId]) {
        bot.sendMessage(chatId, "⛔ You are not completing the last process! The last process has been canceled.");
        resetUserSession(chatId);
    }

    createNewFile(bot, msg);
});

bot.onText(/\/update/, (msg) => {
    const chatId = msg.chat.id;

    if (createSteps[chatId] || updateSteps[chatId]) {
        bot.sendMessage(chatId, "⛔ You are not completing the last process! The last process has been canceled.");
        resetUserSession(chatId);
    }

    updateUser(bot, msg);
});

bot.onText(/\/help/, (msg) => {
    helpCommand(bot, msg);
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
bot.onText(/\/categories/, (msg) => allCategory(msg, bot));
bot.onText(/\/c_create/, (msg) => addCategory(msg, bot));
bot.onText(/\/c_delete/, (msg) => removeCategory(msg, bot));
bot.onText(/\/c_edit/, (msg) => editCategories(msg, bot));
bot.onText(/\/c_projects/, (msg) => getProjectsByCategory(msg, bot));

module.exports = bot;
