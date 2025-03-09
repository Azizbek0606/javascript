export function showMessage(message, type = "info") {
    const messageBox = document.createElement("div");
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;

    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.remove();
    }, 3000);
}