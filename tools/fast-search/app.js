const template = document.getElementById('product-card');
for (let i = 0; i < 30; i++) {
    const clone = template.content.cloneNode(true);
    const productImage = clone.querySelector('.product-image');
    const id = clone.querySelector('.id');
    const productName = clone.querySelector('.title');
    const productPrice = clone.querySelector('.price');

    id.textContent = i + 1;
    productImage.src = `https://picsum.photos/id/${i + 10}/200/200`;
    productName.textContent = `Product ${i + 1}`;
    productPrice.textContent = `$${(Math.random() * 100).toFixed(2)}`;

    document.querySelector(".product-list").append(clone);
}
const searchInput = document.querySelector("#search");
const products = document.querySelectorAll(".product-card");

searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    products.forEach(product => {
        const title = product.querySelector(".title").textContent.toLowerCase();
        if (title.includes(value)) {
            product.classList.remove("hidden");
        } else {
            product.classList.add("hidden");
        }
    });
});
