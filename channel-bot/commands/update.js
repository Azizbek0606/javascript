const userSteps = {};

function updateUser(bot, msg) {
    const chatId = msg.chat.id;

    if (!userSteps[chatId]) {
        userSteps[chatId] = { step: 1, data: {} };
        bot.sendMessage(chatId, "🔄️ Qaysi ma'lumotni yangilamoqchisiz? (Ism/Familiya/Username)");
        return;
    }

    let userData = userSteps[chatId];

    if (userData.step === 1) {
        const choice = msg.text.toLowerCase();
        if (["ism", "familiya", "username"].includes(choice)) {
            userData.data.updateField = choice;
            userData.step = 2;
            bot.sendMessage(chatId, `Yangi ${choice} kiriting:`);
        } else {
            bot.sendMessage(chatId, "Noto‘g‘ri tanlov! Iltimos, Ism, Familiya yoki Username yozing.");
        }
    } else if (userData.step === 2) {
        const field = userData.data.updateField;

        bot.sendMessage(
            chatId,
            `✅ ${field} muvaffaqiyatli yangilandi: ${msg.text}`
        );

        delete userSteps[chatId];
    }
}

module.exports = { updateUser, userSteps };
