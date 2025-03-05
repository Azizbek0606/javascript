const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x111111, 5, 30);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(15, 5, 15);
camera.lookAt(0, 10, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x111111);

const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const lightning = new THREE.PointLight(0xffffff, 0, 50);
scene.add(lightning);

const textureLoader = new THREE.TextureLoader();
const cloudTexture = textureLoader.load("textures/cloud1.png");

function createCloud(x, y, z) {
    const material = new THREE.SpriteMaterial({ map: cloudTexture, transparent: true, opacity: 0.8 });
    const cloud = new THREE.Sprite(material);
    cloud.position.set(x, y, z);
    cloud.scale.set(15, 8, 1);
    scene.add(cloud);
    return cloud;
}

const clouds = Array.from({ length: 100 }, () => {
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 10 + 15;
    const z = Math.random() * 100 - 50;
    return createCloud(x, y, z);
});

const rainSound = new Audio("sounds/rain/rain.mp3");
rainSound.loop = true;
rainSound.volume = 0.5;

const thunderSounds = [
    new Audio("sounds/thunder/first.mp3"),
    new Audio("sounds/thunder/second.mp3"),
    new Audio("sounds/thunder/third.mp3")
];

const allSounds = [rainSound, ...thunderSounds];

const volumeControl = document.getElementById("volumeControl");
volumeControl.addEventListener("input", (event) => {
    const volume = parseFloat(event.target.value);
    allSounds.forEach(audio => audio.volume = volume);
});

document.body.addEventListener("click", function startAudio() {
    rainSound.play().then(() => {
        document.body.removeEventListener("click", startAudio);
    }).catch(error => console.log("Audio autoplay blocked:", error));
});

const rainCount = 2000;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 2 * 3);
const velocities = new Float32Array(rainCount);

for (let i = 0; i < rainCount; i++) {
    const x = Math.random() * 60 - 30;
    const y = Math.random() * 20 + 5;
    const z = Math.random() * 60 - 30;

    rainPositions[i * 6] = x;     
    rainPositions[i * 6 + 1] = y; 
    rainPositions[i * 6 + 2] = z; 
    rainPositions[i * 6 + 3] = x;    
    rainPositions[i * 6 + 4] = y - 0.5;
    rainPositions[i * 6 + 5] = z;    

    velocities[i] = Math.random() * 0.4 + 0.3;
}

rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
const rainMaterial = new THREE.LineBasicMaterial({
    color: 0x87CEEB,
    transparent: true,
    opacity: 0.7,
    linewidth: 1 
});
const rain = new THREE.LineSegments(rainGeometry, rainMaterial);
scene.add(rain);

const flashBackground = document.createElement("div");
Object.assign(flashBackground.style, {
    position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
    background: "white", opacity: "0", pointerEvents: "none", transition: "opacity 0.2s ease-out"
});
document.body.appendChild(flashBackground);

function triggerLightning() {
    const sound = thunderSounds[Math.floor(Math.random() * thunderSounds.length)];
    sound.currentTime = 0;
    sound.play();

    const randomCloud = clouds[Math.floor(Math.random() * clouds.length)];
    lightning.position.set(randomCloud.position.x, randomCloud.position.y + 5, randomCloud.position.z);
    lightning.intensity = 150;
    flashBackground.style.opacity = "0.8";

    setTimeout(() => {
        lightning.intensity = 0;
        flashBackground.style.opacity = "0";
    }, 200);
}

let lightningTimer = 0;
let lightningCooldown = Math.random() * 10 + 5;

function animate() {
    requestAnimationFrame(animate);

    clouds.forEach(cloud => {
        cloud.position.x += 0.02;
        if (cloud.position.x > 50) cloud.position.x = -50;
    });

    const positions = rain.geometry.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
        positions[i * 6 + 1] -= velocities[i]; 
        positions[i * 6 + 4] -= velocities[i]; 

        if (positions[i * 6 + 1] < -5) {
            const x = Math.random() * 60 - 30;
            const z = Math.random() * 60 - 30;
            positions[i * 6] = x;             
            positions[i * 6 + 1] = 20;        
            positions[i * 6 + 2] = z;         
            positions[i * 6 + 3] = x;         
            positions[i * 6 + 4] = 20 - 0.5;  
            positions[i * 6 + 5] = z;         
        }
    }
    rain.geometry.attributes.position.needsUpdate = true;

    lightningTimer += 0.016;
    if (lightningTimer > lightningCooldown) {
        triggerLightning();
        lightningTimer = 0;
        lightningCooldown = Math.random() * 10 + 5;
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});