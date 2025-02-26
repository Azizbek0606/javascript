const { getFilesById, updateFileInfo, getCategories } = require('../services/data_manager');
const { checkText } = require('../utils/utils');
const userSteps = {};

let allowedUpdates = ["name", "category_id", "description"];

function updateUser(bot, msg) {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (!userSteps[chatId]) {
        userSteps[chatId] = { step: 1, data: {} };
        return bot.sendMessage(chatId, "📩 Send file code to update.");
    }

    let userData = userSteps[chatId];

    if (userData.step === 1) {
        const files = getFilesById(text);

        if (Array.isArray(files) && files.length > 0) {
            userData.fileId = text;
            userData.step = 2;

            return bot.sendMessage(chatId, "✅ File found! Please select an option:", {
                reply_markup: {
                    keyboard: [
                        ["name", "category_id"],
                        ["description"]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else {
            return bot.sendMessage(chatId, "❌ File not found, please try again.");
        }
    }

    else if (userData.step === 2) {
        if (allowedUpdates.includes(text)) {
            userData.choice = text;
            userData.step = 3;

            return bot.sendMessage(chatId, `✍️ Send a new value for: ${userData.choice}`, {
                reply_markup: {
                    remove_keyboard: true
                }
            });
        } else {
            return bot.sendMessage(chatId, "⚠️ Invalid field! Please select one from the list.");
        }
    }

    else if (userData.step === 3) {
        if (text !== "") {

            const categories = getCategories().map(cat => parseInt(cat.split(" - ")[0], 10));

            if (userData.choice === "category_id") {
                const categoryId = parseInt(text, 10);
                if (!categories.includes(categoryId)) {
                    return bot.sendMessage(chatId, `⚠️ Invalid category ID! Please enter a valid ID between ${Math.min(...categories)} and ${Math.max(...categories)}.`);
                }
            }
            if(userData.choice === "name"){
                if(!checkText(text)){
                    return bot.sendMessage(chatId, "⚠️ Invalid file name! Please enter a valid name.");
                }
            }
            const success = updateFileInfo(userData.choice, text, userData.fileId);

            if (success === true) {
                bot.sendMessage(chatId, "✅ File updated successfully!");
            } else {
                bot.sendMessage(chatId, "❌ Error updating file. Please try again.");
            }

            delete userSteps[chatId];
            return;
        } else {
            return bot.sendMessage(chatId, "⚠️ Value cannot be empty! Please enter a valid value.");
        }
    }

}

module.exports = { updateUser, userSteps };
