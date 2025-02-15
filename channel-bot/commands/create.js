const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { checkText, generateFileCode, checkNumber } = require("../utils/utils");
const { getCategories, createFile, checkExistingFiles } = require("../data_manager");
const userSteps = {};
let categoryCount = 0;
async function createNewFile(bot, msg) {
    const chatId = msg.chat.id;

    if (!userSteps[chatId]) {
        userSteps[chatId] = { step: 1, data: {} };
        bot.sendMessage(chatId, "Enter file name only letter:");
        return;
    }

    let userData = userSteps[chatId];

    if (userData.step === 1) {
        if (checkText(msg.text)) {
            userData.data.fileName = msg.text;
            userData.step = 2;
            let categories = getCategories()
            let categoriesList = categories.join('\n');
            categoryCount = categories.length;
            bot.sendMessage(chatId, "Choose file category Send Only ID\n\n\n" + categoriesList + `\n\n\nUse only numbers and until ${categoryCount}`);
            return;
        } else {
            bot.sendMessage(chatId, `Wrong name: ${msg.text}\nuse only letters and without spaces`);
            userData.step = 1;
            return;
        }
    } else if (userData.step === 2) {
        if (checkNumber(msg.text) && msg.text < categoryCount + 1) {
            userData.data.categoryId = parseInt(msg.text);
            userData.step = 3;
            bot.sendMessage(chatId, "Write Something about project");
            return;
        } else {
            bot.sendMessage(chatId, `Wrong ID: ${msg.text}\nUse only numbers and until ${categoryCount}`);
            userData.step = 2;
            return;
        }
    } else if (userData.step === 3) {
        userData.data.description = msg.text;
        userData.step = 4;
        bot.sendMessage(chatId, "Now send a file!");
    } else if (userData.step === 4 && msg.document) {
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

            writer.on("finish", () => {
                if (checkExistingFiles(userData.data.fileName)) {
                    userData.data.path = filePath;
                    userData.data.count = 0;
                    userData.data.code = generateFileCode();
                    userData.data.author_id = chatId;
                    try {
                        createFile(userData.data);
                        bot.sendMessage(chatId, `✅ File saved successfully\n📝 File name: ${userData.data.fileName}\n🔷 File category: ${userData.data.categoryId}\n💬 File description: ${userData.data.description}\n🔷 File code: ${userData.data.code}\n👤 Author ID: ${userData.data.author_id}\n\n📁 File saved in: ${filePath}\n\n\n\n⚙️ Use /delete command to delete this file.\n⚙️ Use /update command to update this file.\n⚙️ Use /get command to see a file.\n⚙️ Use /getall command to see all files.`);
                    } catch (e) {
                        bot.sendMessage(chatId, "❌ Something went wrong while trying to save the data.", e);
                    }
                } else if (checkExistingFiles(userData.data.fileNumber) == null) {
                    bot.sendMessage(chatId, "❌ Something went wrong while connecting to the database for checking files name.")
                } else {
                    bot.sendMessage(chatId, "⚠️ File name already exists")
                }
                delete userSteps[chatId];
            });

        } catch (error) {
            console.error("❌ Fayl yuklashda xatolik:", error);
            bot.sendMessage(chatId, "❌ Faylni yuklashda xatolik yuz berdi. Iltimos, qayta yuboring.");
        }
    } else {
        bot.sendMessage(chatId, "❌ Iltimos, kerakli qadamni bajaring yoki /create buyrug‘ini qayta kiriting.");
    }
}

module.exports = { createNewFile, userSteps };
