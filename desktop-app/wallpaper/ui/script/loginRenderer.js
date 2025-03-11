import { showMessage } from "./modules/utils/utils.js";

let swipper_block = document.querySelector(".swipper_block");
let design_image = document.querySelector(".design_image > img");

function setActiveBar(value) {
    if (value == 1) {
        swipper_block.classList.add("active");
        design_image.classList.add("active");
    } else {
        swipper_block.classList.remove("active");
        design_image.classList.remove("active");
    }
}
document.querySelector(".open_sing").addEventListener("click", ()=>{
    setActiveBar(1);
});
document.querySelector(".open_login").addEventListener("click", ()=>{
    setActiveBar(2);
});

function loginFunc() {
    const userNameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (!userNameInput || !passwordInput) {
        console.error("Login input elementlari topilmadi!");
        return;
    }

    const userName = userNameInput.value.trim();
    const password = passwordInput.value.trim();

    if (userName === "" || password === "") {
        showMessage("Username or password cannot be empty!", "error");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters!", "error");
        return;
    }

    const loginData = {
        "username": userName,
        "password": password
    };

    try {
        window.myAPI.login(loginData);
    } catch (error) {
        console.error("Login API xatosi:", error);
        showMessage("An unexpected error occurred!", "error");
    }
}
function signUpFunc() {
    const userNameInput = document.getElementById("r_username");
    const passwordInput = document.getElementById("r_password");
    const confirmPasswordInput = document.getElementById("r_confirm_password");
    const emailInput = document.getElementById("r_email");

    if (!userNameInput || !passwordInput || !confirmPasswordInput || !emailInput) {
        console.error("Ro‘yxatdan o‘tish input elementlari topilmadi!");
        return;
    }

    const userName = userNameInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const email = emailInput.value.trim();

    if (userName === "" || password === "" || confirmPassword === "" || email === "") {
        showMessage("All fields must be filled!", "error");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Invalid email format!", "error");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters!", "error");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match!", "error");
        return;
    }

    const userData = {
        "username": userName,
        "password": password,
        "email": email
    };

    try {
        window.myAPI.register(userData);
    } catch (error) {
        console.error("Register API xatosi:", error);
        showMessage("An unexpected error occurred!", "error");
    }
}



document.getElementById("login_button").addEventListener("click", () => {
    loginFunc();
})
document.getElementById("r_button").addEventListener("click", () => {
    signUpFunc();
})
window.electronAPI.onRegisterSuccess(() => {
    showMessage("Registration successful!");
});
window.electronAPI.onRegisterError((errorMessage) => {
    showMessage(errorMessage, "error");
});
window.electronAPI.onLoginSuccess(()=>{
    showMessage("Login successful!");
})
window.electronAPI.onLoginError((errorMessage) => {
    showMessage(errorMessage, "error");
});