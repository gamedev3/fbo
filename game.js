const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas for all devices
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Load images
let carImg = new Image();
carImg.src = 'car.png';
let monsterImg = new Image();
monsterImg.src = 'monster.png';
let bulletImg = new Image();
bulletImg.src = 'bullet.png';
let explosionSound = new Audio('ex.mp3');
let shootSound = new Audio('gun.mp3');
let sunImg = new Image();
sunImg.src = 'sun.png';
let moonImg = new Image();
moonImg.src = 'moon.png';
let starImg = new Image();
starImg.src = 'star.png';
let leafImg = new Image();
leafImg.src = 'leaf.png';
let dayBg = new Image();
dayBg.src = 'dayback.jpg';
let nightBg = new Image();
nightBg.src = 'nightback.jpg';
let cloudImg = new Image();
cloudImg.src = 'cloud.png';
let startSound = new Audio('game-bonus-144751.mp3');
gameOverSound = new Audio('game-over-arcade-6435.mp3');

let bgMusic = new Audio('groovy-ambient-funk-201745.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;
let isMuted = false;

// Game variables
let car = { x: canvas.width / 2 - 25, y: canvas.height - 120, width: 100, height: 100, speed: 7, health: 100 };
let monsters = [];
let bullets = [];
let score = 0;
let gameRunning = false;
let keys = {};
let stars = [];
let leaves = [];
let clouds = [];
let timeOfDay = 0;
let weather = "clear";
let rainDrops = [];
let fogIntensity = 0;

//game instruction button
document.getElementById("instructionsButton").addEventListener("click", function() {
    let instructions = document.getElementById("instructions");
    if (instructions.style.display === "none" || instructions.style.display === "") {
        instructions.style.display = "block"; // Show
    } else {
        instructions.style.display = "none"; // Hide
    }
});


// UI Elements
const startButton = document.getElementById("startButton");
const retryButton = document.getElementById("retryButton");
const scoreDisplay = document.getElementById("score");
const healthBar = document.getElementById("healthBar");
const healthBarContainer = document.getElementById("healthBarContainer");
scoreDisplay.style.display = "none";
healthBar.style.display = "none";
healthBarContainer.style.display = "none";

startButton.addEventListener("click", () => {
    startSound.play(); // Play start sound
    gameRunning = true;
    if (!isMuted) {
        bgMusic.play();
    }
    startButton.style.display = "none";
    scoreDisplay.style.display = "block"; // Show score when game starts
    healthBar.style.display = "block";
    healthBarContainer.style.display = "block";

    update();
});

retryButton.addEventListener("click", () => {
    document.location.reload();
});

// Keyboard Controls
window.addEventListener("keydown", (e) => { keys[e.key] = true; });
window.addEventListener("keyup", (e) => { keys[e.key] = false; });

function updateControls() {
    if (keys["ArrowLeft"] && car.x > 0) car.x -= car.speed;
    if (keys["ArrowRight"] && car.x < canvas.width - car.width) car.x += car.speed;
    if (keys["ArrowUp"] && car.y > 0) car.y -= car.speed;
    if (keys["ArrowDown"] && car.y < canvas.height - car.height) car.y += car.speed;
    if (keys["f"]) shoot();
}

// **Mobile Touch Controls**
let touchStartX = null, touchStartY = null;
let touchThreshold = 20; // Minimum movement to trigger action

document.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent scrolling

    let touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    shooting = true; // Tap to shoot
});

document.addEventListener("touchmove", (e) => {
    e.preventDefault();

    let touch = e.touches[0];
    let dx = touch.clientX - touchStartX;
    let dy = touch.clientY - touchStartY;

    // Detect movement direction
    keys["ArrowRight"] = dx > touchThreshold;
    keys["ArrowLeft"] = dx < -touchThreshold;
    keys["ArrowDown"] = dy > touchThreshold;
    keys["ArrowUp"] = dy < -touchThreshold;
});

document.addEventListener("touchend", () => {
    keys = {}; // Stop movement when touch is released
    shooting = false; // Stop shooting
});

// Shooting
function shoot() {
    bullets.push({ x: car.x + 20, y: car.y, width: 5, height: 10, speed: 7 });
    shootSound.play();
}

// Spawn Monsters
function spawnMonster() {
    monsters.push({ x: Math.random() * (canvas.width - 50), y: 0, width: 50, height: 50, speed: 3 });
}
setInterval(spawnMonster, 2000);

// Update UI
function updateUI() {
    scoreDisplay.innerText = `Score: ${score}`;
    healthBar.style.width = `${car.health}px`;
}

// Draw Environment
function drawEnvironment() {
    timeOfDay += 0.005;
    let dayFactor = Math.sin(timeOfDay % (2 * Math.PI)) * 0.5 + 0.5;
    ctx.globalAlpha = 1;

    if (dayFactor > 0.5) {
        ctx.drawImage(dayBg, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(sunImg, canvas.width - 150, 50, 100, 100);
    } else {
        ctx.drawImage(nightBg, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(moonImg, 803, 60, 180, 120);
        drawStars();
    }

    drawWeatherEffects();
    drawClouds();
    drawLeaves();
}

// Weather Effects
function drawWeatherEffects() {
    if (weather === "rain") drawRain();
    if (weather === "fog") drawFog();
    if (weather === "thunderstorm") {
        drawRain();
        if (Math.random() > 0.97) drawLightning();
    }
}

// Draw Rain
function drawRain() {
    ctx.fillStyle = "rgba(0, 0, 255, 0.94)";
    rainDrops.forEach((drop) => {
        ctx.fillRect(drop.x, drop.y, 2, 10);
        drop.y += drop.speed;
        if (drop.y > canvas.height) drop.y = 0;
    });
}

// Draw Fog
function drawFog() {
    fogIntensity = Math.sin(timeOfDay) * 0.3 + 0.3;
    ctx.fillStyle = `rgba(200, 200, 200, ${fogIntensity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw Lightning
function drawLightning() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 100);
}

// Draw Stars
function drawStars() {
    if (stars.length < 50) {
        for (let i = 0; i < 50; i++) {
            stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height / 2, speed: Math.random() * 0.5 + 0.1 });
        }
    }
    stars.forEach((star) => {
        ctx.drawImage(starImg, star.x, star.y, 10, 10);
        star.y += star.speed;
        if (star.y > canvas.height / 2) star.y = 0;
    });
}

// Draw Leaves
function drawLeaves() {
    if (leaves.length < 10) {
        for (let i = 0; i < 10; i++) {
            leaves.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: Math.random() * 1.5 + 0.5 });
        }
    }
    leaves.forEach((leaf) => {
        ctx.drawImage(leafImg, leaf.x, leaf.y, 20, 20);
        leaf.y += leaf.speed;
        if (leaf.y > canvas.height) leaf.y = 0;
    });
}

// Draw Clouds
function drawClouds() {
    clouds.forEach((cloud) => {
        ctx.drawImage(cloudImg, cloud.x, cloud.y, 100, 50);
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width) cloud.x = -100;
    });
}

  

function update() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateControls();
    updateUI();
    drawEnvironment();
    ctx.drawImage(carImg, car.x, car.y, car.width, car.height);
    
    // Check bullet-monster collisions
bullets.forEach((bullet, bulletIndex) => {
    monsters.forEach((monster, monsterIndex) => {
        if (
            bullet.x < monster.x + monster.width &&
            bullet.x + bullet.width > monster.x &&
            bullet.y < monster.y + monster.height &&
            bullet.y + bullet.height > monster.y
        ) {
            // Collision detected
            bullets.splice(bulletIndex, 1); // Remove bullet
            monsters.splice(monsterIndex, 1); // Remove monster
            score += 10; // Increment score
            explosionSound.play(); // Play explosion sound
            updateUI(); // Update the score display
        }
    });
});


    function drawMonsters() {
        monsters.forEach((monster, i) => {
            ctx.drawImage(monsterImg, monster.x, monster.y, monster.width, monster.height);
            monster.y += monster.speed;
    
            // Remove monster if it moves off-screen
            if (monster.y > canvas.height) {
                monsters.splice(i, 1);
            }
        });
    }
    

    // Update bullets
    bullets.forEach((bullet, i) => {
        bullet.y -= bullet.speed;
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
        if (bullet.y < 0) bullets.splice(i, 1);
    });

    // Update monsters
    monsters.forEach((monster, i) => {
        monster.y += monster.speed;
        ctx.drawImage(monsterImg, monster.x, monster.y, monster.width, monster.height);
        if (monster.y + monster.height >= car.y && monster.x < car.x + car.width && monster.x + monster.width > car.x) {
            car.health -= 20;
            explosionSound.play();
            monsters.splice(i, 1);
            if (car.health <= 0) {
                gameRunning = false;
                gameOverSound.play();
                bgMusic.pause();
                bgMusic.currentTime = 0; // Reset music
                retryButton.style.display = "block";
            }
        }
        // Remove monster if it moves off-screen
        if (monster.y > canvas.height) {
            monsters.splice(i, 1);
        }
    });

    requestAnimationFrame(update);
}

// Mute/Unmute Button
document.getElementById('muteButton').addEventListener('click', function () {
    if (isMuted) {
        if (gameRunning) bgMusic.play();
        this.innerText = "Mute";
    } else {
        bgMusic.pause();
        this.innerText = "Unmute";
    }
    isMuted = !isMuted;
});
