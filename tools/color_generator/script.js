function showMessage(message, color_code) {
    let messageBox = document.createElement('message-box');
    let messageContext = document.createElement('p');
    let closeMessageBox = document.createElement('p');
    closeMessageBox.className = 'close-message';
    closeMessageBox.textContent = '✔️';
    messageContext.textContent = message;
    messageBox.id = "message-box";
    messageBox.appendChild(messageContext);
    messageBox.appendChild(closeMessageBox);
    document.body.appendChild(messageBox);
    closeMessageBox.addEventListener('click', hideMessage);

    setTimeout(hideMessage, 3000);
}
function hideMessage() {
    let messageBox = document.getElementById('message-box');
    if (messageBox) {
        messageBox.remove();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    function generateSimilarColors(baseColor, steps = 5) {
        let colors = [baseColor];
        for (let i = 1; i <= steps; i++) {
            let newColor = chroma(baseColor).set('hsl.h', `+${i * 15}`).hex();
            colors.push(newColor);
        }
        return colors;
    }

    let colorPicker = document.getElementById('color-picker');
    let colorBoxes = document.querySelectorAll('.color_box');

    function updateColors(baseColor) {
        let similarColors = generateSimilarColors(baseColor);
        colorBoxes.forEach((box, index) => {
            if (index < similarColors.length) {
                let color = similarColors[index];
                box.style.backgroundColor = color;
                box.querySelector('.color_code p').textContent = color;
            }
        });
    }

    function setupCopyFunctionality() {
        document.querySelectorAll('.copy_code').forEach(copyButton => {
            copyButton.addEventListener('click', function () {
                let colorCode = this.previousElementSibling.querySelector('p').textContent;
                navigator.clipboard.writeText(colorCode).then(() => {
                    showMessage(`Color ${colorCode} copied`);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                });
            });
        });
    }

    let defaultColor = "#7a2cba";
    colorPicker.value = defaultColor;
    updateColors(defaultColor);
    setupCopyFunctionality();

    colorPicker.addEventListener('input', function () {
        updateColors(this.value);
        setupCopyFunctionality();
    });

    function generateRandomGradients() {
        let gradients = [];
        for (let i = 0; i < 2; i++) {
            let color1 = chroma.random();
            let color2 = chroma(color1).set('hsl.h', '+30').brighten(0.5).hex();
            let gradient = `linear-gradient(135deg, ${color1.hex()} 0%, ${color2} 100%)`;
            gradients.push(gradient);
        }
        return gradients;
    }

    let reloadButton = document.querySelector('.reload_btn');
    let gradientBoxes = document.querySelectorAll('.top_gradient');

    reloadButton.addEventListener('click', function () {
        let gradients = generateRandomGradients();
        gradientBoxes.forEach((box, index) => {
            box.style.background = gradients[index];
            box.querySelector('.color_code p').textContent = gradients[index].match(/#[0-9a-fA-F]{6}/g);
        });
    });

    let initialGradients = generateRandomGradients();
    gradientBoxes.forEach((box, index) => {
        box.style.background = initialGradients[index];
        box.querySelector('.color_code p').textContent = initialGradients[index].match(/#[0-9a-fA-F]{6}/g);
    });
});

