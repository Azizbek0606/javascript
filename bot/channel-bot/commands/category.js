require("dotenv").config();
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getFilesByCategory,
    getCategoryById
} = require('../services/data_manager');

const ADMIN_ID = process.env.ADMIN_CHAT_ID;

function allCategory(msg, bot) {
    const chatId = msg.chat.id;
    const categories = getCategories();

    if (categories.length === 0) {
        return bot.sendMessage(chatId, "⚠️ No categories found.");
    }

    bot.sendMessage(chatId, `📂 Available categories:\n\n${categories.join("\n")}`);
}

function addCategory(msg, bot) {
    const chatId = msg.chat.id;

    if (chatId.toString() !== ADMIN_ID) {
        return bot.sendMessage(chatId, "⛔ You do not have permission to add a category.");
    }

    bot.sendMessage(chatId, "📝 Send the category name you want to add:");

    bot.once("message", (response) => {
        const categoryName = response.text.trim();
        createCategory(categoryName);
        bot.sendMessage(chatId, `✅ Category "${categoryName}" has been added.`);
    });
}
function editCategories(msg, bot) {
    const chatId = msg.chat.id.toString();

    if (chatId !== ADMIN_ID) {
        return bot.sendMessage(chatId, "⛔ You do not have permission to edit a category.");
    }

    bot.sendMessage(chatId, "📝 Send the category ID and new name in this format:\n\n`id - new_name`");

    bot.once("message", (response) => {
        if (!response.text.includes(" - ")) {
            return bot.sendMessage(chatId, "⚠️ Invalid format! Use `id - new_name`.");
        }

        const [idPart, namePart] = response.text.split(" - ").map(str => str.trim());

        const categoryId = parseInt(idPart, 10);
        const newName = namePart;

        if (isNaN(categoryId) || !newName) {
            return bot.sendMessage(chatId, "⚠️ Invalid category ID or name.");
        }

        const updated = updateCategory(categoryId, newName);

        if (updated) {
            bot.sendMessage(chatId, `✅ Category ID ${categoryId} has been updated to "${newName}".`);
        } else {
            bot.sendMessage(chatId, "⚠️ Category ID not found or update failed.");
        }
    });
}


function removeCategory(msg, bot) {
    const chatId = msg.chat.id.toString();

    if (chatId !== ADMIN_ID) {
        return bot.sendMessage(chatId, "⛔ You do not have permission to delete a category.");
    }

    bot.sendMessage(chatId, "🗑 Send the category ID you want to delete:");

    bot.once("message", (response) => {
        const categoryId = parseInt(response.text.trim(), 10);

        if (isNaN(categoryId)) {
            return bot.sendMessage(chatId, "⚠️ Invalid category ID.");
        }

        const category = getCategoryById(categoryId);
        if (!category) {
            return bot.sendMessage(chatId, "⚠️ Category not found.");
        }

        bot.sendMessage(
            chatId,
            `⚠️ Are you sure you want to delete the category?\n\n` +
            `ID: ${category.id}\n` +
            `Name: ${category.name}\n\n` +
            `Reply with "YES" to confirm or "NO" to cancel.`
        );

        bot.once("message", (confirmation) => {
            const answer = confirmation.text.trim().toUpperCase();

            if (answer === "YES") {
                deleteCategory(categoryId);
                bot.sendMessage(chatId, `✅ Category "${category.name}" has been deleted.`);
            } else {
                bot.sendMessage(chatId, "❌ Deletion canceled.");
            }
        });
    });
}

function getProjectsByCategory(msg, bot) {
    const chatId = msg.chat.id;

    const categories = getCategories();

    if (categories.filtered.length === 0) {
        return bot.sendMessage(chatId, "⚠️ No categories found.");
    }
    console.log(categories.categoryList);
    const categoryList = categories.filtered.join("\n");
    bot.sendMessage(chatId, `🔎 Send the category ID to see projects:\n\n📂 Available Categories:\n${categoryList}`);

    bot.once("message", (response) => {
        const categoryId = parseInt(response.text.trim(), 10);

        if (isNaN(categoryId)) {
            return bot.sendMessage(chatId, "⚠️ Invalid category ID.");
        }

        const projects = getFilesByCategory(categoryId);

        if (projects.length === 0) {
            return bot.sendMessage(chatId, `📂 No projects found in category ID ${categoryId}.`);
        }

        const projectList = projects.map(p => `🔷Name: ${p.name || "No name"}\n💬Description: ${p.description || "No description"}\n⚙️Code: ${p.code}\n👁️Views:${p.count}\n\n<--------------->\n\n`).join("\n");
        bot.sendMessage(chatId, `📁 Projects in category ID ${categoryId}:\n\n${projectList}`);
    });
}

module.exports = {
    allCategory,
    addCategory,
    removeCategory,
    editCategories,
    getProjectsByCategory
};
