const { deleteFileById, getFilesById, getAllFiles } = require("../services/data_manager");
const { checkFileCode } = require("../utils/utils");
const fs = require("fs").promises;
require("dotenv").config();

const ADMIN_ID = process.env.ADMIN_CHAT_ID;

async function sendError(bot, chatId, message) {
    return bot.sendMessage(chatId, `⛔ ${message}`);
}

async function deleteFileFromDisk(path) {
    try {
        await fs.access(path);
        await fs.unlink(path);
        return true;
    } catch (error) {
        if (error.code === "ENOENT") {
            return false;
        }
        throw error;
    }
}

async function deleteFile(bot, msg) {
    const chatId = msg.chat.id;

    if (!ADMIN_ID || isNaN(parseInt(ADMIN_ID))) {
        return sendError(bot, chatId, "Server configuration error: Admin ID is missing.");
    }

    if (chatId !== parseInt(ADMIN_ID)) {
        return sendError(bot, chatId, "You have no permission to use this command.");
    }

    try {
        const allFiles = getAllFiles()
            .map((file) => `${file.id} - ${file.name} (Code: ${file.code})`)
            .join("\n") || "No files found";
        await bot.sendMessage(chatId, "📝 Send the file code you want to delete");
        await bot.sendMessage(chatId, `All files:\n${allFiles}`);

        bot.once("message", async (response) => {
            if (!response.text) {
                return sendError(bot, chatId, "Please send only a text message.");
            }

            const fileId = response.text.trim();
            if (!checkFileCode(fileId)) {
                return sendError(bot, chatId, "Invalid file code. Please send a valid code (e.g., '12345').");
            }
            const file = getFilesById(fileId);
            if (!file || file.length === 0) {
                return sendError(bot, chatId, "File not found. Please check the file code.");
            }

            const targetFile = file[0];
            await bot.sendMessage(chatId, `Are you sure you want to delete "${targetFile.name}"?\n\nSend 'yes' or 'no'`);

            const waitForConfirmation = async () => {
                bot.once("message", async (confirmation) => {
                    if (!confirmation.text) {
                        await sendError(bot, chatId, "Please send only a text message.");
                        return waitForConfirmation();
                    }

                    const answer = confirmation.text.trim().toLowerCase();
                    if (["yes", "y", "ha", "ye"].includes(answer)) {
                        try {
                            const fileDeletedFromDisk = await deleteFileFromDisk(targetFile.path);
                            const deletedFromDB = deleteFileById(fileId);

                            if (fileDeletedFromDisk && deletedFromDB) {
                                await bot.sendMessage(chatId, `✅ "${targetFile.name}" deleted successfully from disk and database.`);
                            } else if (deletedFromDB) {
                                await bot.sendMessage(chatId, `✅ "${targetFile.name}" deleted from database but was not found on disk.`);
                            } else {
                                await sendError(bot, chatId, "Failed to delete file from database.");
                            }
                        } catch (error) {
                            console.error("File deletion error:", { fileId, chatId, error: error.message });
                            await sendError(bot, chatId, `Error deleting file: ${error.message}`);
                        }
                    } else if (["no", "n", "yoq", "cancel"].includes(answer)) {
                        await bot.sendMessage(chatId, "❌ Cancelled the process.");
                    } else {
                        await sendError(bot, chatId, "Wrong answer. Please send 'yes' or 'no'.");
                        return waitForConfirmation();
                    }
                });
            };
            waitForConfirmation();
        });
    } catch (error) {
        console.error("Error while processing delete command:", { chatId, error: error.message });
        await sendError(bot, chatId, "Error occurred while processing the delete command.");
    }
}

module.exports = { deleteFile };