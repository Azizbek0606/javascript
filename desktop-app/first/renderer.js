function lorem() {
    const num1 = parseFloat(document.getElementById('num1').value);
    const num2 = parseFloat(document.getElementById('num2').value);
    const operation = document.getElementById('operation').value;

    window.electronAPI.lorem(num1, num2, operation);
}

window.electronAPI.onResult((event, result) => {
    document.getElementById('result').innerText = result;
});