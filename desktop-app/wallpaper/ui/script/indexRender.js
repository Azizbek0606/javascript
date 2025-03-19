import { createModal } from "./modules/modals/modal.js";
import { showMessage } from "./modules/utils/utils.js";

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
        getQuote();
    } else {
        showMessage("Connect to the internet to get weather information.")
    }
});

window.addEventListener("online", () => {
    showMessage("Internet connected", "success")
    renderWeatherData();
    getQuote();
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
    let secondTemperature = document.querySelector(".sencondTemprature");
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
    let reloadBtn = event.target.closest(".weatherReloadBtn");
    if (reloadBtn) {
        renderWeatherData();
    }
});
document.addEventListener("DOMContentLoaded", async () => {
    let latestImage = await window.electronAPI.getLatestImage();
    let imageElement = document.querySelector(".last_saved_image > img");

    if (!latestImage) {
        imageElement.style.display = "none";
        imageElement.parentElement.textContent = "No found";
        return;
    }

    if (imageElement) {
        imageElement.src = latestImage.file_path;
    } else {
        console.error("Element .last_saved_image > img topilmadi");
    }
});
document.addEventListener("click", (event) => {
    let reloadBtn = event.target.closest(".quoteReloadBtn");
    if (reloadBtn) {
        getQuote();
    }
});
async function getQuote() {
    let quoteAnimation = document.querySelector(".quoteLoadingnimation");
    quoteAnimation.style.display = "block";
    let quoteText = document.querySelector(".quoteText");
    let quoteAuthor = document.querySelector(".authorName");
    let quoteData = await window.electronAPI.getQuote();

    if (!quoteData) {
        showMessage("somthing went wrong please try again", "error")
        return;
    }
    quoteText.textContent = quoteData.quote;
    quoteAuthor.textContent = quoteData.author;
    quoteAnimation.style.display = "none";
}
document.addEventListener("DOMContentLoaded", () => {
    window.electronAPI.onImageUpdate((data) => {
        document.querySelector("#current_wallpaper").src = data.currentImage;
        document.querySelector("#previous_wallpaper").src = data.nextImage;
        document.querySelector("#currentGroupName").textContent = data.groupName
    });

    window.electronAPI.onTimerUpdate((data) => {
        const formattedTime = formatTime(data.remainingTime);
        document.querySelector("#wallpaperTimer").textContent = formattedTime;
    });
});
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
window.electronAPI.errorMessage((data) => {
    showMessage(data.message, data.status);
});
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".change_group").addEventListener("click", () => {
        openChangeGroup();
    });
});
async function openChangeGroup() {
    let groups = await window.electronAPI.groupForChange();
    let currentGroup = await window.electronAPI.getCurrnetGroup();

    if (!groups?.length || !currentGroup) {
        showMessage("Group not found!", "error");
        return;
    }
    createModal({
        title: "Change Wallpaper Group",
        inputs: [
            {
                label: "Select Group",
                type: "select",
                options: groups.map((group) => ({ value: group.id, text: group.group_name })),
                value: currentGroup.last_group_id
            },
        ],
        buttons: [
            {
                text: "Cancel",
                class: "cancel-btn",
                action: () => { },
            },
            {
                text: "Apply",
                class: "apply-btn",
                action: (data) => {
                    if (data[0] != currentGroup.last_group_id) {
                        window.electronAPI.changeWallpaperGroup(data[0]);
                    }
                },
            },
        ]
    });
}