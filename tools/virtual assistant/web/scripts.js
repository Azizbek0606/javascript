// JavaScript’da Python’dan kelgan matnni yangilash
eel.expose(update_text);
function update_text(result) {
    const parsed = JSON.parse(result);
    document.getElementById('final-text').innerText = `Yakuniy matn: ${parsed.text}`;
}

eel.expose(update_partial);
function update_partial(partial) {
    const parsed = JSON.parse(partial);
    if (parsed.partial) {
        document.getElementById('partial-text').innerText = `Qisman matn: ${parsed.partial}`;
    }
}