const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { checkText, generateFileCode, checkNumber } = require("../utils/utils");
const { getCategories, createFile, checkExistingFiles } = require("../data_manager");

const userSteps = {};

async function createNewFile(bot, msg) {
    const chatId = msg.chat.id;

    if (!userSteps[chatId]) {
        userSteps[chatId] = { step: 1, data: {} };
        return bot.sendMessage(chatId, "Enter file name (only letters, no spaces):");
    }

    let userData = userSteps[chatId];

    switch (userData.step) {
        case 1:
            if (!checkText(msg.text)) {
                return bot.sendMessage(chatId, `❌ Invalid name: ${msg.text}\nUse only letters without spaces.`);
            }
            if (!checkExistingFiles(msg.text)) {
                return bot.sendMessage(chatId, `❌ File with this name already exists.`);
            }
            userData.data.fileName = msg.text.replace(/\s+/g, '_');
            userData.step = 2;

            const categories = getCategories();
            const categoriesList = categories.map((cat, index) => `${index + 1}. ${cat}`).join('\n');
            return bot.sendMessage(chatId, `Choose file category (Send only ID)\n\n${categoriesList}\n\nUse a number between 1 and ${categories.length}.`);

        case 2:
            const categoryId = parseInt(msg.text);
            if (!checkNumber(msg.text) || categoryId < 1 || categoryId > getCategories().length) {
                return bot.sendMessage(chatId, `❌ Invalid ID: ${msg.text}\nChoose a valid number between 1 and ${getCategories().length}.`);
            }
            userData.data.categoryId = categoryId;
            userData.step = 3;
            return bot.sendMessage(chatId, "Write a brief description of the project:");

        case 3:
            userData.data.description = msg.text;
            userData.step = 4;
            return bot.sendMessage(chatId, "Now send the file!");

        case 4:
            if (!msg.document) {
                return bot.sendMessage(chatId, "❌ Please send a valid file.");
            }

            const fileId = msg.document.file_id;
            const fileName = msg.document.file_name;
            const fileExtension = path.extname(fileName);
            const saveDir = path.resolve(__dirname, "../data/source");

            if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
            }

            const savedFileName = `${userData.data.fileName}${fileExtension}`;
            const filePath = path.join(saveDir, savedFileName);

            try {
                const fileLink = await bot.getFileLink(fileId);
                const response = await axios({ url: fileLink, responseType: "stream" });
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on("finish", async () => {
                    userData.data.path = filePath;
                    userData.data.count = 0;
                    userData.data.code = generateFileCode();
                    userData.data.author_id = chatId;

                    try {
                        const isSaved = createFile(userData.data);
                        if (isSaved) {
                            bot.sendMessage(chatId, `✅ File saved successfully!\n📝 Name: ${userData.data.fileName}\n📂 Category: ${userData.data.categoryId}\n💬 Description: ${userData.data.description}\n🔢 Code: ${userData.data.code}\n👤 Author ID: ${userData.data.author_id}\n📁 Path: ${filePath}\n\nUse /delete to remove the file.\nUse /update to modify it.\nUse /get to view it.\nUse /getall to see all files.`);
                        } else {
                            fs.unlinkSync(filePath);
                            bot.sendMessage(chatId, "❌ Error: Data was not saved to the database. File has been deleted.");
                        }
                    } catch (e) {
                        fs.unlinkSync(filePath);
                        bot.sendMessage(chatId, `❌ Error saving file data to the database. File has been deleted: ${e.message}`);
                    }
                delete userSteps[chatId];
                });
            } catch (error) {
                console.error("❌ File upload error:", error);
                bot.sendMessage(chatId, "❌ Error uploading file. Please try again.");
            }
            break;

        default:
            bot.sendMessage(chatId, "❌ Invalid step. Please restart the process using /create.");
    }
}

module.exports = { createNewFile, userSteps };
