function createGradientTexture() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 256;
    canvas.height = 256;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#03152c");
    gradient.addColorStop(1, "#010c1c");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}
const scene = new THREE.Scene();
scene.background = createGradientTexture();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const starCount = 2000;
const starPositions = new Float32Array(starCount * 3);
const starOpacity = new Float32Array(starCount);
const starTwinkleSpeed = new Float32Array(starCount);
const starMoveSpeed = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 300;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 300;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 300;

    starOpacity[i] = Math.random();
    starTwinkleSpeed[i] = Math.random() * 0.02 + 0.005;
    starMoveSpeed[i] = (Math.random() - 0.5) * 0.5;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute("opacity", new THREE.BufferAttribute(starOpacity, 1));

const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        attribute float opacity;
        varying float vOpacity;
        void main() {
            vOpacity = opacity;
            gl_PointSize = 3.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying float vOpacity;
        void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            float alpha = smoothstep(0.5, 0.2, dist) * vOpacity;
            gl_FragColor = vec4(1.0, 1.0, 0.8, alpha);
        }
    `,
    transparent: true
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const meteors = [];
const meteorCount = 3;
for (let i = 0; i < meteorCount; i++) {
    const meteorGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const meteorMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);
    meteor.visible = false;
    scene.add(meteor);

    meteors.push({ mesh: meteor, speed: 0, active: false });
}

function launchMeteor() {
    meteors.forEach(meteor => {
        if (!meteor.active && Math.random() < 0.01) {
            meteor.active = true;
            meteor.mesh.visible = true;
            meteor.mesh.position.set(Math.random() * 50 - 25, 30, Math.random() * 50 - 25);
            meteor.speed = Math.random() * 0.4 + 0.2;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;
    starMaterial.uniforms.time.value = time;

    const opacityArray = starGeometry.attributes.opacity.array;
    const positionArray = starGeometry.attributes.position.array;

    for (let i = 0; i < starCount; i++) {
        opacityArray[i] = 0.5 + 0.5 * Math.sin(time * starTwinkleSpeed[i]);

        positionArray[i * 3] += starMoveSpeed[i] * 0.1;
        positionArray[i * 3 + 1] += starMoveSpeed[i] * 0.1;
    }

    starGeometry.attributes.opacity.needsUpdate = true;
    starGeometry.attributes.position.needsUpdate = true;

    meteors.forEach(meteor => {
        if (meteor.active) {
            meteor.mesh.position.x -= meteor.speed;
            meteor.mesh.position.y -= meteor.speed * 1.5;
            meteor.mesh.position.z -= meteor.speed * (Math.random() - 0.5);
            if (meteor.mesh.position.y < -30) {
                meteor.active = false;
                meteor.mesh.visible = false;
            }
        }
    });

    launchMeteor();
    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
