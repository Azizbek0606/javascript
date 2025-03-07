let swipper_block = document.querySelector(".swipper_block");
let design_image = document.querySelector(".design_image > img");
function setActiveBar(value) {
    if (value == 1) {
        swipper_block.style.cssText = "transform: translateX(-450px)";
        design_image.src = "../../assets/resources/images/register/registrate.jpg";
    } else {
        swipper_block.style.cssText = "transform: translateX(0px)";
        design_image.src = "../../assets/resources/images/register/login.jpg";
    }

}
document.querySelector(".minus").addEventListener("click", () => { window.myAPI.minimise() });
document.querySelector(".x_mark").addEventListener("click", () => { window.myAPI.close() });