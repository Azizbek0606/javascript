import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const topLight = new THREE.PointLight(0xffffff, 1, 100);
topLight.position.set(0, 10, 0);
scene.add(topLight);

const loader = new GLTFLoader();

loader.load('ground.glb', (gltf) => {
    const groundModel = gltf.scene;
    groundModel.scale.set(0.4, 0.4, 0.4);

    const groundPositions = [
        [0, -0.01, 0], [7, -0.01, 0], [14, -0.01, 0],
        [0, -0.01, 6.5], [7, -0.01, 6.5], [0, -0.01, 13], [6.5, -0.01, 13]
    ];

    groundPositions.forEach(pos => {
        const groundClone = groundModel.clone();
        groundClone.position.set(...pos);
        scene.add(groundClone);
    });
});

loader.load('street_light.glb', (gltf) => {
    const streetLight = gltf.scene;
    streetLight.scale.set(0.1, 0.1, 0.1);

    const lightPositions = [[8, 0, 2], [6, 0, 1]];

    lightPositions.forEach(pos => {
        const streetLightClone = streetLight.clone();
        streetLightClone.position.set(...pos);
        scene.add(streetLightClone);

        const pointLight = new THREE.PointLight(0xffcc77, 5, 5);
        pointLight.position.set(pos[0], pos[1] + 2, pos[2]);
        scene.add(pointLight);
    });
});

function createLightSphere(position) {
    const lightMaterial = new THREE.MeshStandardMaterial({
        emissive: 0xffffff,
        emissiveIntensity: 3
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.09, 64, 64), lightMaterial);
    sphere.position.set(...position);
    scene.add(sphere);

    const light = new THREE.PointLight(0xffffff, 50, 15);
    light.position.set(...position);
    scene.add(light);

    return { sphere, light };
}
const lightSphere1 = createLightSphere([10.1, 2.55, 4.24]);
const lightSphere2 = createLightSphere([8.1, 2.55, 3.24]);

function createThunderSphere(position, audioFiles = ['thunder1.mp3', 'thunder2.mp3']) {

    const lightMaterial = new THREE.MeshStandardMaterial({
        emissive: 0xffffff,
        emissiveIntensity: 0
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(5, 64, 64), lightMaterial);
    sphere.position.set(...position);
    sphere.visible = false;
    scene.add(sphere);

    const light = new THREE.PointLight(0xffffff, 0, 1000);
    light.position.set(...position);
    scene.add(light);

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function triggerLightning() {
        const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
        const audio = new Audio(randomAudioFile);

        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audio.addEventListener('play', () => {
            sphere.visible = true;
        });

        audio.addEventListener('ended', () => {
            sphere.visible = false;
            light.intensity = 0;
            lightMaterial.emissiveIntensity = 0;
        });

        function syncLightningWithAudio() {
            if (audio.paused || audio.ended) return;

            analyser.getByteTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += Math.abs(dataArray[i] - 128);
            }
            const amplitude = sum / bufferLength; 

            const intensity = amplitude * 20; 
            light.intensity = Math.min(intensity, 1500);
            lightMaterial.emissiveIntensity = Math.min(amplitude / 10, 15);

            requestAnimationFrame(syncLightningWithAudio);
        }

        audio.play();
        syncLightningWithAudio();

        const nextLightningDelay = Math.random() * 20000 + 5000; 
        setTimeout(triggerLightning, nextLightningDelay);
    }

    const initialDelay = Math.random() * 6000;
    setTimeout(triggerLightning, initialDelay);

    return { sphere, light };
}

const thunder1 = createThunderSphere([-10, 18, 4.24], ['thunder1.mp3', 'thunder2.mp3']);
const thunder2 = createThunderSphere([10, 18, 8.24], ['thunder1.mp3', 'thunder2.mp3']);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(10, 2, 8);
controls.update();

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
const groundBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    material: new CANNON.Material({ friction: 0.1, restitution: 0.0 })
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

const rainBodies = [];
const rainMeshes = [];
const rainCount = 200;

const rainMaterial = new THREE.MeshPhongMaterial({
    color: 0x99ccff,
    transparent: true,
    opacity: 0.7,
    shininess: 100,
    specular: 0xffffff
});

for (let i = 0; i < rainCount; i++) {
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        rainMaterial
    );
    const x = (Math.random() - 0.5) * 20;
    const y = Math.random() * 10 + 5;
    const z = (Math.random() - 0.5) * 20;
    sphere.position.set(x, y, z);
    scene.add(sphere);
    rainMeshes.push(sphere);

    const sphereShape = new CANNON.Sphere(0.03);
    const sphereBody = new CANNON.Body({
        mass: 0.01,
        shape: sphereShape,
        position: new CANNON.Vec3(x, y, z),
        velocity: new CANNON.Vec3(
            (Math.random() - 0.5) * 0.5,
            -Math.random() * 5 - 2,
            (Math.random() - 0.5) * 0.5
        ),
        material: new CANNON.Material({ friction: 0, restitution: 0.1 })
    });
    world.addBody(sphereBody);
    rainBodies.push(sphereBody);
}

const groundRainContact = new CANNON.ContactMaterial(
    groundBody.material,
    rainBodies[0].material,
    { friction: 0.1, restitution: 0 }
);
world.addContactMaterial(groundRainContact);

function updatePhysics() {
    world.step(1 / 60); 

    for (let i = 0; i < rainBodies.length; i++) {
        const body = rainBodies[i];
        const mesh = rainMeshes[i];

        if (body.position.y < 0.03) {
            createSplash(body.position.x, body.position.z);
            body.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 10 + 5,
                (Math.random() - 0.5) * 20
            );
            body.velocity.set(
                (Math.random() - 0.5) * 0.5,         
                -Math.random() * 30 - 4,            
                (Math.random() - 0.5) * 0.5         
            );
        }

        mesh.position.copy(body.position);
        const speed = body.velocity.length();
        mesh.scale.set(1, 1 + speed * 1, 1); 
    }
}

function createSplash(x, z) {
    const splashGeometry = new THREE.CircleGeometry(0.1, 8);
    const splashMaterial = new THREE.MeshBasicMaterial({
        color: 0x99ccff,
        transparent: true,
        opacity: 0.5
    });
    const splash = new THREE.Mesh(splashGeometry, splashMaterial);
    splash.position.set(x, 0.01, z);
    splash.rotation.x = -Math.PI / 2;
    scene.add(splash);

    gsap.to(splash.scale, {
        x: 2,
        y: 2,
        duration: 0.3,
        onComplete: () => scene.remove(splash)
    });
    gsap.to(splash.material, {
        opacity: 0,
        duration: 0.3
    });
}

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
