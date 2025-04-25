let dict = { "lorem": "shoptoli" };
for (let i = 0; i < 15; i++) {
    dict["lorem" + i] = "shoptoli" + i;
}
// how to get key and value in loop from dict
for (let key in dict) {
    console.log(key, dict[key]);
}

