function helpCommand(bot, msg) {
    const chatId = msg.chat.id;

    const helpText = `
🤖 *Bot Commands List*:
/start - Start the Bot
/help - You can know all the commands
/comment - You can comment on the bot
/categories - This command shows the categories

📌 *Main Information*:
-With this bot you can get all project's souce code for free just send file code.


    *Future changes*
>>> I will share the answers of my Leetcode problems on the channel, and if you have a better solution than mine, you can upload it to the bot, and if your answer is really better than mine, your name and the solution you gave will be shared on the channel.<<<
    `;

    bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
}

module.exports = { helpCommand };
