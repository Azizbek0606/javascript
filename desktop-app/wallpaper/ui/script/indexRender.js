import { startAudio, stopAudio } from "./bg_animation.js";
import { showMessage } from "./modules/utils/utils.js";
let volumeControl = document.querySelector("#volumeControl");
let rangePercent = document.querySelector(".range_percent");


volumeControl.addEventListener("input", () => {
    let percent = volumeControl.value * 100;
    rangePercent.innerHTML = `${percent.toFixed(0)}%`;
    document.querySelector(".line_range").style.width = `${percent}%`;
});
let soundStatus = false;
function soundStartStop() {
    if (soundStatus) {
        stopAudio();
        soundStatus = false;
        document.querySelector(".pauseSound").style.display = "none";
        document.querySelector(".playSound").style.display = "block";
    } else {
        startAudio();
        soundStatus = true;
        document.querySelector(".pauseSound").style.display = "block";
        document.querySelector(".playSound").style.display = "none";
    }
}
document.querySelector(".sound_p_s_button").addEventListener("click", () => {
    soundStartStop();
})
window.myAPI.getProfileInfo();

let defaultImage = "../../assets/resources/images/controller/userAvatar.png"
let user_name = document.querySelector("#user_name");
window.electronAPI.userData((data) => {
    user_name.textContent = data.user_name;
    document.querySelector("#profile_image").src = data.profile_image !== "default" ? data.profile_image : defaultImage;

    if (user_name.offsetWidth > user_name.parentElement.clientWidth) {
        user_name.classList.add("scrolling-text");
    } else {
        user_name.classList.remove("scrolling-text");
    }
});

window.addEventListener("load", async () => {
    if (navigator.onLine) {
        renderWeatherData();
    } else {
        showMessage("Connect to the internet to get weather information.")
    }
});

window.addEventListener("online", () => {
    showMessage("Internet connected", "success")
    window.electronAPI.getWeatherData();
});

async function renderWeatherData() {
    let reloadAnimation = document.querySelector(".reloadAnimation");
    reloadAnimation.style.display = "block";

    let weatherData = await window.electronAPI.getWeatherData();

    if (!weatherData) {
        console.error("Weather data is undefined");
        reloadAnimation.style.display = "none";
        showMessage("Something went wrong. Please try again", "error");
        return;
    }

    let mainImage = document.querySelector(".mainImageWeather");
    let mainTemperature = document.querySelector(".mainTemprature");
    let secondTemperature = document.querySelector(".secondTemp");
    let sunset = document.querySelector(".sunsetTime");
    let sunrise = document.querySelector(".sunriseTime");

    if (mainImage) mainImage.src = weatherData.imageSrc || "";
    if (mainTemperature) mainTemperature.innerHTML = weatherData.currentTemp || "N/A";
    if (secondTemperature) secondTemperature.innerHTML = weatherData.nightTemp || "N/A";
    if (sunset) sunset.innerHTML = weatherData.sunset || "N/A";
    if (sunrise) sunrise.innerHTML = weatherData.sunrise || "N/A";

    reloadAnimation.style.display = "none";
}
document.addEventListener("click", (event) => {
    let reloadBtn = event.target.closest(".reloadBtn");
    if (reloadBtn) {
        renderWeatherData();
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    let latestImage = await window.electronAPI.getLatestImage();

    if (!latestImage) {
        console.error("Latest image is undefined");
        return;
    }

    let imageElement = document.querySelector(".last_saved_image > img");
    if (imageElement) {
        imageElement.src = latestImage.file_path;
    } else {
        console.error("Element .last_saved_image > img topilmadi");
    }
});
