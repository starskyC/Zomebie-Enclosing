// Constants that can be modified and played around
const R = 30;
const PlayerSpeed = 10;
const ZombieSpeed = 0.2;

// Canvas size
const WIDTH = 2500;
const HEIGHT = 2500;
const STEP = 40;

// Don't change below

const X_MIN = -WIDTH / STEP / 2
const X_MAX =  WIDTH / STEP / 2
const Y_MIN = -HEIGHT / STEP / 2
const Y_MAX =  HEIGHT / STEP / 2

function convertX(x) {
	return x * STEP + WIDTH / 2;
}
function convertY(y) {
	return HEIGHT / 2  - y * STEP;
}

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');

canvas.height = HEIGHT;
canvas.width = WIDTH;

const CANVAS_LEFT = canvas.offsetLeft;
const CANVAS_TOP = canvas.offsetTop;
const CANVAS_WIDTH =  Math.min(window.innerHeight, window.innerWidth);
const CANVAS_HEIGHT = Math.min(window.innerHeight, window.innerWidth);

const ctx = canvas.getContext('2d');

function renderInfo() {
	ctx.font = "50px Arial"
	ctx.fillText(`r=${R}\nzombieSpd=${ZombieSpeed}\nplayerSpd=${PlayerSpeed}`, 0, 50);
}

function renderGameOver() {
	ctx.font = "100px Arial"
	ctx.fillStyle = "red"
	ctx.fillText(`GAME OVER`, WIDTH / 2 - 5 * 50, 150);
}

function renderGameSuccess() {
	ctx.font = "100px Arial"
	ctx.fillStyle = "green"
	ctx.fillText(`GAME SUCCESS`, WIDTH / 2 - 6 * 50, 150);
}

function renderOuterRim() {
	ctx.beginPath();
	ctx.strokeStyle = "green";
	ctx.lineWidth = 10
	ctx.ellipse(convertX(0), convertY(0), R * STEP, R * STEP, 0, 0, 2 * Math.PI);
	ctx.stroke();
}

/**
 * @param {number} x 
 * @param {number} y 
 * @param {{color: string, r: number}} opt 
 */
function dot(x, y, {color = 'blue', r = 5} = {}) {
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
	ctx.fill();
}

const zombies = []
for (let x = X_MIN; x <= X_MAX; x++) for (let y = Y_MIN; y <= Y_MAX; y++) {
	if (x === 0 && y === 0) continue
	if (x * x + y * y <= R * R) zombies.push({x, y});
}

const mouse = {x: 0, y: 0};
canvas.onmousemove = e => {
	mouse.x = ((e.clientX - CANVAS_LEFT) / CANVAS_WIDTH * WIDTH - WIDTH / 2) / STEP;
	mouse.y = (HEIGHT / 2 - (e.clientY - CANVAS_TOP) / CANVAS_HEIGHT * HEIGHT) / STEP;
}

const player = {x: 0, y: 0};

let lastTime = performance.now();

/**
 * @param {number} time 
 */
const loop = time => {
	const dt = (time - lastTime) / 1000;
	lastTime = time;
	
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	renderInfo();
	renderOuterRim();
	
	const {x: playerX, y: playerY} = player;

	dot(convertX(playerX), convertY(playerY), {color: 'red', r: 10});
	zombies.forEach(({x, y}) => dot(convertX(x), convertY(y)));

	if (playerX ** playerX + playerY ** playerY > R ** R) {
		renderGameSuccess();
		return;
	}

	// Cursor
	dot(convertX(mouse.x), convertY(mouse.y), {color: 'green'});

	for (let idx = 0; idx < zombies.length; idx++) {
		const {x, y} = zombies[idx];
		const dx = x - playerX;
		const dy = y - playerY;
		const ds = Math.sqrt(dx * dx + dy * dy);

		if (ds < ZombieSpeed ) {
			renderGameOver();
			return
		}

		if (ds > 1E-5) {
			zombies[idx].x -= dx / ds * ZombieSpeed * dt;
			zombies[idx].y -= dy / ds * ZombieSpeed * dt;
		}

		
	}

	const dx = mouse.x - playerX, dy = mouse.y - playerY;
	const ds = Math.sqrt(dx * dx + dy * dy);
	if (ds > 1E-2) {
		player.x += dx / ds * PlayerSpeed * dt;
		player.y += dy / ds * PlayerSpeed * dt;
	
		// console.log(dx * dt / ds, dy / ds * dt)
	}


	requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
