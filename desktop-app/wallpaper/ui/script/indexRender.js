import { startAudio, stopAudio } from "./bg_animation.js";
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
