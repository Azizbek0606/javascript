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

let defaultImage = "../../assets/resources/images/register/login.jpg"

window.electronAPI.userData((data) => {    
    document.querySelector("#user_name").textContent = data.user_name;
    document.querySelector("#profile_image").src = data.profile_image !== "default" ? data.profile_image : defaultImage;
});


