document.addEventListener("DOMContentLoaded", function () {
    var video1 = document.getElementById("video1");
    var video2 = document.getElementById("video2");
    var duration1 = document.getElementById("duration1");
    var duration2 = document.getElementById("duration2");
    var videoInfo1 = document.getElementById("videoInfo1");
    var videoInfo2 = document.getElementById("videoInfo2");

    video1.addEventListener('loadedmetadata', function () {
        duration1.textContent = `Davomiyligi: ${Math.floor(video1.duration / 60)} daqiqa ${Math.floor(video1.duration % 60)} soniya`;
    });

    video1.addEventListener('ended', function () {
        video1.style.display = 'none';
        duration1.style.display = 'none';
        videoInfo1.style.display = 'none';

        video2.style.display = 'block';
        duration2.style.display = 'block';
        videoInfo2.style.display = 'block';
        video2.play();
    });

    video2.addEventListener('loadedmetadata', function () {
        duration2.textContent = `Davomiyligi: ${Math.floor(video2.duration / 60)} daqiqa ${Math.floor(video2.duration % 60)} soniya`;
    });
});
