const { app, BrowserWindow, ipcMain } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        webPreferences: {
            preload: __dirname + '/preload.js'
        },
        width: 800,
        height: 600,
        autoHideMenuBar: true
    });
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('shoptoli', (event, num1, num2, operation) => {
    let result;
    switch (operation) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
        case '/':
            result = num1 / num2;
            break;
        default:
            result = 'Invalid operation';
    }
    event.reply('result', result);
});