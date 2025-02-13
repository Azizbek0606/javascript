let canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let c = canvas.getContext('2d');

// c.fillStyle = 'rgba(255, 0, 0, 0.5)';
// c.fillRect(100, 100, 100, 100);
// c.fillStyle = 'rgba(0, 255, 0, 0.5)';
// c.fillRect( 200 , 200 , 100 , 100 );
// c.fillStyle = 'rgba(0, 0, 255, 0.5)';
// c.fillRect( 300 , 300 , 100 , 100 );

// c.beginPath();
// c.moveTo(50, 300);
// c.lineTo(50, 100);
// c.lineTo(350, 100);
// c.lineTo(350, 300);
// c.lineTo(50, 300);
// c.strokeStyle = 'rgba(16, 177, 32, 0.5)';
// c.stroke();

// for (let i = 0; i < 12; i++) {
//     let x = Math.random() * window.innerWidth;
//     let y = Math.random() * window.innerHeight;
//     c.beginPath();
//     c.arc(x, y, 30, 0, Math.PI * 2, false);
//     c.strokeStyle = 'rgb(180, 14, 108)';
//     c.stroke();
// }

// function Circle(x, y, dx, dy, radius) {
//     this.x = x;
//     this.y = y;
//     this.dx = dx;
//     this.dy = dy;
//     this.radius = radius;

//     this.draw = function () {
//         c.beginPath();
//         c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
//         c.strokeStyle = 'rgb(255, 255, 255)';
//         c.stroke();
//     }
//     this.update = function () {
//         if (this.x + this.radius > window.innerWidth || this.x - this.radius < 0) {
//             this.dx = -this.dx;
//         }
//         if (this.y + this.radius > window.innerHeight || this.y - this.radius < 0) {
//             this.dy = -this.dy;
//         }
//         this.x += this.dx;
//         this.y += this.dy;
//     }
// }

// let circle = new Circle(200, 200);
// circle.draw();

// let x = Math.random() * window.innerWidth;
// let y = Math.random() * window.innerHeight;
// let dx = 7;
// let dy = 7;
// let radius = 50;
// function animation() {
//     c.clearRect(0, 0, window.innerWidth, window.innerHeight);
//     requestAnimationFrame(animation)
//     c.beginPath();
//     c.arc(x, y, radius, 0, Math.PI * 2, false);
//     c.strokeStyle = 'rgb(255, 255, 255)';
//     c.stroke();
// }
// animation();
let mouse = {
    x: undefined,
    y: undefined
}
window.addEventListener("mousemove",
    function (event) {
        mouse.x = event.x;
        mouse.y = event.y;
    }
)

class Circle {
    constructor(x, y, dx, dy, radius, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
        this.color = color;
        this.minRadius = radius
        this.maxRadius = 40;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        if (this.x + this.radius > window.innerWidth || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > window.innerHeight || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }
        this.x += this.dx;
        this.y += this.dy;

        if (mouse.x - this.x < 100 && mouse.x - this.x > -100 && mouse.y - this.y < 100 && mouse.y - this.y > -100) {
            if (this.radius < this.maxRadius) {
                this.radius += 1;
            }
        } else if (this.radius > this.minRadius) {
            this.radius -= 1;
        }
        this.draw();
    }

}
let circleArray = [];
for (let i = 0; i < 200; i++) {
    let radius = 10;
    let x = Math.random() * (innerWidth - radius * 2) + radius;
    let y = Math.random() * (innerHeight - radius * 2) + radius;
    let dx = (Math.random() - 0.5) * 5;
    let dy = (Math.random() - 0.5) * 5;
    let color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    circleArray.push(new Circle(x, y, dx, dy, radius, color));
}
function animation() {
    requestAnimationFrame(animation);
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = 0; i < circleArray.length; i++) {
        circleArray[i].update();
    }
}

animation();


