const { getFilesById, updateFileInfo, getCategories, checkExistingFiles } = require('../services/data_manager');
const { checkText } = require('../utils/utils');

const userSteps = {};
const allowedUpdates = ["name", "category_id", "description"];

function findId(categories, id) {
    return categories.categoryList.some(item => item.id === parseInt(id));
}

function updateUser(bot, msg) {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (!text) {
        return bot.sendMessage(chatId, "❌ No input provided!");
    }

    if (!userSteps[chatId]) {
        userSteps[chatId] = { step: 1, data: {} };
        return bot.sendMessage(chatId, "📩 Send file code to update.");
    }

    let userData = userSteps[chatId];

    switch (userData.step) {
        case 1:
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
            }
            return bot.sendMessage(chatId, "❌ File not found, please try again.");

        case 2:
            if (!allowedUpdates.includes(text)) {
                return bot.sendMessage(chatId, "⚠️ Invalid field! Please select one from the list.");
            }

            userData.choice = text;
            userData.step = 3;

            if (text === "category_id") {
                const categories = getCategories();
                if (!categories.filtered?.length) {
                    delete userSteps[chatId];
                    return bot.sendMessage(chatId, "❌ No categories available!");
                }
                const categoryList = categories.filtered.map(cat => `${cat}`).join('\n');
                return bot.sendMessage(chatId, `Choose a category ID from the list:\n\n${categoryList}\n\nSend only the ID number`);
            }

            return bot.sendMessage(chatId, `✍️ Send a new value for: ${userData.choice}`, {
                reply_markup: { remove_keyboard: true }
            });

        case 3:
            if (!text) {
                return bot.sendMessage(chatId, "⚠️ Value cannot be empty! Please enter a valid value.");
            }

            let valueToUpdate = text;

            if (userData.choice === "category_id") {
                const categoryId = parseInt(text, 10);
                const categories = getCategories();

                if (isNaN(categoryId) || !findId(categories, text)) {
                    const categoryList = categories.filtered.map(cat => `${cat}`).join('\n');
                    return bot.sendMessage(chatId, `⚠️ Invalid category ID! Please select a valid ID from:\n\n${categoryList}`);
                }
                valueToUpdate = categoryId;
            }
            else if (userData.choice === "name") {
                if (!checkText(text)) {
                    return bot.sendMessage(chatId, "⚠️ Invalid file name! Use only letters and numbers, no special characters.");
                }
                if (!checkExistingFiles(text.trim())) {
                    return bot.sendMessage(chatId, "⚠️ File with this name already exists.");
                }
                valueToUpdate = text.trim();
            }
            else if (userData.choice === "description") {
                valueToUpdate = text.trim();
            }

            const success = updateFileInfo(userData.choice, valueToUpdate, userData.fileId);

            if (success) {
                bot.sendMessage(chatId, `✅ File ${userData.choice} updated successfully!`);
            } else {
                bot.sendMessage(chatId, "❌ Error updating file. Please try again.");
            }

            delete userSteps[chatId];
            break;

        default:
            delete userSteps[chatId];
            return bot.sendMessage(chatId, "❌ Process error! Please start again with the update command.");
    }
}

module.exports = { updateUser, userSteps };