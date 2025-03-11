function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
    console.log("Loading demo...");
    
    for (let i = 0; i < 5; i++) {
        await sleep(i * 1000);
    }
    console.log('Done');
}

demo();
