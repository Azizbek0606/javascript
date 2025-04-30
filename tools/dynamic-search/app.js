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
searchInput.focus();
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
    }
});
searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    let firstVisibleIndex = -1;
    products.forEach((product, index) => {
        const title = product.querySelector(".title").textContent.toLowerCase();
        if (title.includes(value)) {
            product.classList.remove("hidden");
            if (firstVisibleIndex === -1) firstVisibleIndex = index;
        } else {
            product.classList.add("hidden");
        }
    });
    if (firstVisibleIndex !== -1) {
        SelectProduct(firstVisibleIndex);
    } else {
        products.forEach(product => product.classList.remove("selected"));
    }
});

function SelectProduct(index) {
    const visibleProducts = Array.from(products).filter(
        product => !product.classList.contains("hidden")
    );
    if (index >= 0 && index < visibleProducts.length) {
        visibleProducts.forEach((product, i) => {
            if (i === index) {
                product.classList.add("selected");
                product.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } else {
                product.classList.remove("selected");
            }
        });
    }
}

window.addEventListener("keydown", (e) => {
    const visibleProducts = Array.from(products).filter(
        product => !product.classList.contains("hidden")
    );
    const selectedIndex = visibleProducts.findIndex(product =>
        product.classList.contains("selected")
    );

    if (e.key === "ArrowDown") {
        if (selectedIndex < visibleProducts.length - 1) {
            SelectProduct(selectedIndex + 1);
        } else if (selectedIndex === -1 && visibleProducts.length > 0) {
            SelectProduct(0);
        }
    } else if (e.key === "ArrowUp") {
        if (selectedIndex > 0) {
            SelectProduct(selectedIndex - 1);
        } else if (selectedIndex === -1 && visibleProducts.length > 0) {
            SelectProduct(0);
        }
    } else if (e.key === "Enter") {
        if (selectedIndex !== -1) {
            const selectedProduct = visibleProducts[selectedIndex];
            const id = selectedProduct.querySelector(".id").textContent;
            const title = selectedProduct.querySelector(".title").textContent;
            const price = selectedProduct.querySelector(".price").textContent;
            const imageSrc = selectedProduct.querySelector(".product-image").src;

            alert(`Product Details:\nID: ${id}\nTitle: ${title}\nPrice: ${price}\nImage URL: ${imageSrc}`);
        } else {
            alert("No product is selected.");
        }
    }
});

if (products.length > 0) {
    SelectProduct(0);
}
