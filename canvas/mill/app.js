import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Three.js sahna yaratish
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Yorug'lik qo'shish
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Model yuklash uchun GLTFLoader
const loader = new GLTFLoader();

// Ground yuklash
loader.load('mill.glb', function (gltf) {
    const ground = gltf.scene;
    ground.position.set(0, 0, 0); // Yerni o'zgartirmadik, joyi to'g'ri
    ground.scale.set(0.4, 0.4, 0.4); // 2.5 barobar kichraytirish
    scene.add(ground);
});

// Street Light (Chiroq) joylash
loader.load('street_light.glb', function (gltf) {
    const streetLight = gltf.scene;
    streetLight.position.set(1.5, 0, 0); // O‘ng tomonga yaqinroq, lekin yerdan baland emas
    streetLight.scale.set(0.4, 0.4, 0.4); // 2.5 barobar kichraytirish
    scene.add(streetLight);
});

// OrbitControls ishlatish
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 2, 5);
controls.update();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
