const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 3D yurak nuqtalari (vertices)
const vertices = [];
const edges = [];
const numPoints = 50;

// Yurak shaklini yaratish
for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * 2 * Math.PI;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const z = 0; // Boshlang'ichda Z o'qi bo'yicha 0
    vertices.push({ x, y, z });
}

// Chiqiqlarni (edges) yaratish
for (let i = 0; i < numPoints; i++) {
    edges.push([i, (i + 1) % numPoints]);
}

// 3D transformatsiya uchun funktsiyalar
function rotateX(point, angle) {
    const y = point.y * Math.cos(angle) - point.z * Math.sin(angle);
    const z = point.y * Math.sin(angle) + point.z * Math.cos(angle);
    return { ...point, y, z };
}

function rotateY(point, angle) {
    const x = point.x * Math.cos(angle) + point.z * Math.sin(angle);
    const z = -point.x * Math.sin(angle) + point.z * Math.cos(angle);
    return { ...point, x, z };
}

function rotateZ(point, angle) {
    const x = point.x * Math.cos(angle) - point.y * Math.sin(angle);
    const y = point.x * Math.sin(angle) + point.y * Math.cos(angle);
    return { ...point, x, y };
}

// Perspektiv proyeksiya
function project(point) {
    const fov = 500; // Ko'rish maydoni (field of view)
    const scale = fov / (fov + point.z); // Masshtab
    const x = point.x * scale;
    const y = point.y * scale;
    return { x, y };
}

// Nuqtalarni chizish
function drawPoints(points) {
    ctx.fillStyle = 'red';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Chiqiqlarni chizish
function drawEdges(points, edges) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    edges.forEach(edge => {
        const [start, end] = edge;
        const p1 = points[start];
        const p2 = points[end];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    });
}

// Animatsiya
let angleX = 0;
let angleY = 0;
let angleZ = 0;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Markazga o'tkazish
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Nuqtalarni aylantirish va proyeksiya qilish
    const transformedPoints = vertices.map(vertex => {
        let point = rotateX(vertex, angleX);
        point = rotateY(point, angleY);
        point = rotateZ(point, angleZ);
        const projected = project(point);
        return projected;
    });

    // Chizish
    drawPoints(transformedPoints);
    drawEdges(transformedPoints, edges);

    ctx.restore();

    // Aylanish burchagini oshirish
    angleX += 0.01;
    angleY += 0.02;
    angleZ += 0.005;

    requestAnimationFrame(animate);
}

animate();

// Oynani o'lchamini o'zgartirganda canvasni yangilash
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});