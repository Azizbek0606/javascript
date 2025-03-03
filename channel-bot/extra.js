async function test() {
    const comment = "You are stupid!";
    const result = await isToxic(comment);
    console.log(`Comment: "${comment}"`);
    console.log(`Is toxic? ${result}`);
}

test();
