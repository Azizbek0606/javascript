import * as THREE from './node_modules/three/build/three.module.min.js';

// Sahna, kamera va renderer yaratish
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Oq realistik sfera
const sphereGeometry = new THREE.SphereGeometry(1.2, 128, 128);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    metalness: 0.5,
    roughness: 0.4
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.castShadow = true;
sphere.position.set(0, 0, 0);
scene.add(sphere);

// Yorug'lik
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 5, 5);
pointLight.castShadow = true;
scene.add(pointLight);

// 1500 ta aqua rangli nuqta (birinchi guruh: 2.4-2.8 radius)
const totalParticlesFirstGroup = 700;
const particlesGeometryFirstGroup = new THREE.BufferGeometry();
const positionsFirstGroup = new Float32Array(totalParticlesFirstGroup * 3);
const velocitiesFirstGroup = new Float32Array(totalParticlesFirstGroup * 3);
const basePositionsFirstGroup = new Float32Array(totalParticlesFirstGroup * 3);
const dispersionState = { active: false, progress: 0 }; // Tarqalish holati

for (let i = 0; i < totalParticlesFirstGroup; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 2.4 + Math.random() * 0.4;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positionsFirstGroup[i * 3] = x;
    positionsFirstGroup[i * 3 + 1] = y;
    positionsFirstGroup[i * 3 + 2] = z;

    basePositionsFirstGroup[i * 3] = x;
    basePositionsFirstGroup[i * 3 + 1] = y;
    basePositionsFirstGroup[i * 3 + 2] = z;

    velocitiesFirstGroup[i * 3] = (Math.random() - 0.5) * 0.005;
    velocitiesFirstGroup[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
    velocitiesFirstGroup[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
}

particlesGeometryFirstGroup.setAttribute('position', new THREE.BufferAttribute(positionsFirstGroup, 3));
particlesGeometryFirstGroup.setAttribute('basePosition', new THREE.BufferAttribute(basePositionsFirstGroup, 3));

// Yana 1000 ta nuqta (ikkinchi guruh: 6-8 radius)
const totalParticlesSecondGroup = 7000;
const particlesGeometrySecondGroup = new THREE.BufferGeometry();
const positionsSecondGroup = new Float32Array(totalParticlesSecondGroup * 3);
const velocitiesSecondGroup = new Float32Array(totalParticlesSecondGroup * 3);
const basePositionsSecondGroup = new Float32Array(totalParticlesSecondGroup * 3);

for (let i = 0; i < totalParticlesSecondGroup; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 6 + Math.random() * 2; // 6-8 radius

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positionsSecondGroup[i * 3] = x;
    positionsSecondGroup[i * 3 + 1] = y;
    positionsSecondGroup[i * 3 + 2] = z;

    basePositionsSecondGroup[i * 3] = x;
    basePositionsSecondGroup[i * 3 + 1] = y;
    basePositionsSecondGroup[i * 3 + 2] = z;

    velocitiesSecondGroup[i * 3] = (Math.random() - 0.5) * 0.005;
    velocitiesSecondGroup[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
    velocitiesSecondGroup[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
}

particlesGeometrySecondGroup.setAttribute('position', new THREE.BufferAttribute(positionsSecondGroup, 3));
particlesGeometrySecondGroup.setAttribute('basePosition', new THREE.BufferAttribute(basePositionsSecondGroup, 3));

// Yumaloq nuqtalar uchun ShaderMaterial
const particlesShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        pointSize: { value: 4.0 },
        color: { value: new THREE.Color(0x00ffff) }
    },
    vertexShader: `
        uniform float pointSize;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = pointSize;
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        void main() {
            vec2 uv = gl_PointCoord - vec2(0.5);
            float dist = length(uv);
            if (dist > 0.5) discard; // Dumaloq shakl uchun
            gl_FragColor = vec4(color, 0.9);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
});

// Birinchi guruh (2.4-2.8 radius) uchun nuqtalar
const particlesFirstGroup = new THREE.Points(particlesGeometryFirstGroup, particlesShaderMaterial);
scene.add(particlesFirstGroup);

// Ikkinchi guruh (6-8 radius) uchun nuqtalar
const particlesSecondGroup = new THREE.Points(particlesGeometrySecondGroup, particlesShaderMaterial);
scene.add(particlesSecondGroup);

// Ekranni ikki marta bosish hodisasi
let clickCount = 0;
document.addEventListener('click', () => {
    clickCount++;
    if (clickCount === 2) {
        dispersionState.active = true;
        dispersionState.progress = 0;
        clickCount = 0;
    }
});

// Kamerani sozlash
camera.position.z = 10; // Katta radiusni ko'rish uchun kamerani biroz uzoqlashtirdim

// Animatsiya funksiyasi
let time = 0;
function animate() {
    requestAnimationFrame(animate);

    // Sferani sekin aylantirish
    sphere.rotation.x += 0.005;
    sphere.rotation.y += 0.005;

    // Birinchi guruh (2.4-2.8 radius)
    const positionsFirst = particlesGeometryFirstGroup.attributes.position.array;
    for (let i = 0; i < totalParticlesFirstGroup; i++) {
        const i3 = i * 3;
        let x = positionsFirst[i3];
        let y = positionsFirst[i3 + 1];
        let z = positionsFirst[i3 + 2];

        x += velocitiesFirstGroup[i3];
        y += velocitiesFirstGroup[i3 + 1];
        z += velocitiesFirstGroup[i3 + 2];

        const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
        if (distanceFromCenter < 2.4 || distanceFromCenter > 2.8) {
            const scale = 2.6 / distanceFromCenter;
            x *= scale;
            y *= scale;
            z *= scale;
        }

        if (dispersionState.active) {
            dispersionState.progress += 0.02;

            if (dispersionState.progress < 1) {
                const randomDirX = (Math.random() - 0.5) * 10;
                const randomDirY = (Math.random() - 0.5) * 10;
                const randomDirZ = (Math.random() - 0.5) * 10;
                const dispersionFactor = Math.sin(dispersionState.progress * Math.PI / 2);
                x += randomDirX * dispersionFactor;
                y += randomDirY * dispersionFactor;
                z += randomDirZ * dispersionFactor;
            } else if (dispersionState.progress < 2) {
                const returnFactor = Math.sin((dispersionState.progress - 1) * Math.PI / 2);
                x = THREE.MathUtils.lerp(x, basePositionsFirstGroup[i3], returnFactor);
                y = THREE.MathUtils.lerp(y, basePositionsFirstGroup[i3 + 1], returnFactor);
                z = THREE.MathUtils.lerp(z, basePositionsFirstGroup[i3 + 2], returnFactor);
            } else {
                dispersionState.active = false;
                dispersionState.progress = 0;
            }
        }

        positionsFirst[i3] = x;
        positionsFirst[i3 + 1] = y;
        positionsFirst[i3 + 2] = z;
    }
    particlesGeometryFirstGroup.attributes.position.needsUpdate = true;

    // Ikkinchi guruh (6-8 radius)
    const positionsSecond = particlesGeometrySecondGroup.attributes.position.array;
    for (let i = 0; i < totalParticlesSecondGroup; i++) {
        const i3 = i * 3;
        let x = positionsSecond[i3];
        let y = positionsSecond[i3 + 1];
        let z = positionsSecond[i3 + 2];

        x += velocitiesSecondGroup[i3];
        y += velocitiesSecondGroup[i3 + 1];
        z += velocitiesSecondGroup[i3 + 2];

        const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
        if (distanceFromCenter < 6 || distanceFromCenter > 8) {
            const scale = 7 / distanceFromCenter;
            x *= scale;
            y *= scale;
            z *= scale;
        }

        if (dispersionState.active) {
            dispersionState.progress += 0.02;

            if (dispersionState.progress < 1) {
                const randomDirX = (Math.random() - 0.5) * 10;
                const randomDirY = (Math.random() - 0.5) * 10;
                const randomDirZ = (Math.random() - 0.5) * 10;
                const dispersionFactor = Math.sin(dispersionState.progress * Math.PI / 2);
                x += randomDirX * dispersionFactor;
                y += randomDirY * dispersionFactor;
                z += randomDirZ * dispersionFactor;
            } else if (dispersionState.progress < 2) {
                const returnFactor = Math.sin((dispersionState.progress - 1) * Math.PI / 2);
                x = THREE.MathUtils.lerp(x, basePositionsSecondGroup[i3], returnFactor);
                y = THREE.MathUtils.lerp(y, basePositionsSecondGroup[i3 + 1], returnFactor);
                z = THREE.MathUtils.lerp(z, basePositionsSecondGroup[i3 + 2], returnFactor);
            }
        }

        positionsSecond[i3] = x;
        positionsSecond[i3 + 1] = y;
        positionsSecond[i3 + 2] = z;
    }
    particlesGeometrySecondGroup.attributes.position.needsUpdate = true;

    time += 0.016;
    renderer.render(scene, camera);
}

// Animatsiyani boshlash
animate();