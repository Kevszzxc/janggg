const canvas = document.getElementById("birthday");
const ctx = canvas.getContext("2d");
const twoPi = Math.PI * 2;
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const fireworkHues = [215, 330];

class Firework {
  constructor(x, y, targetX, targetY, hue, offspringCount) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.hue = hue;
    this.offspringCount = offspringCount;
    this.history = [];
    this.dead = false;
    this.childrenCreated = false;
  }

  update(delta) {
    if (this.dead) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      this.x += dx * 2 * delta;
      this.y += dy * 2 * delta;
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > 20) this.history.shift();
    } else {
      if (this.offspringCount && !this.childrenCreated) {
        const count = Math.floor(this.offspringCount / 2);
        for (let i = 0; i < count; i++) {
          const angle = (twoPi * i) / count;
          fireworks.push(
            new Firework(
              this.x,
              this.y,
              this.x + this.offspringCount * Math.cos(angle),
              this.y + this.offspringCount * Math.sin(angle),
              this.hue,
              0
            )
          );
        }
        this.childrenCreated = true;
      }
      this.history.shift();
    }

    if (this.history.length === 0) {
      this.dead = true;
      return;
    }

    this.history.forEach((point, index) => {
      ctx.beginPath();
      ctx.fillStyle = `hsl(${this.hue}, 100%, ${Math.max(30, index * 5)}%)`;
      ctx.arc(point.x, point.y, 1.5, 0, twoPi);
      ctx.fill();
    });

    if (!this.offspringCount) {
      ctx.beginPath();
      ctx.fillStyle = `hsl(${this.hue}, 100%, 65%)`;
      ctx.arc(this.x, this.y, 2, 0, twoPi);
      ctx.fill();
    }
  }
}

let width = 0;
let height = 0;
let spawnLeft = 0;
let spawnRight = 0;
let launchTimer = 0;
let previousTime = performance.now();
const fireworks = [];

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  spawnLeft = width * 0.25;
  spawnRight = width * 0.75;
}

function launch(targetX, targetY) {
  const count = random(3, 5);
  for (let i = 0; i < count; i++) {
    fireworks.push(
      new Firework(
        random(spawnLeft, spawnRight),
        height,
        targetX,
        targetY,
        fireworkHues[random(0, fireworkHues.length - 1)],
        random(30, 90)
      )
    );
  }
}

function animate(now) {
  const delta = Math.min((now - previousTime) / 1000, 0.05);
  previousTime = now;

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  fireworks.forEach((firework) => firework.update(delta));
  launchTimer += delta;

  if (launchTimer >= 0.9) {
    launch(random(0, width), random(height * 0.1, height * 0.55));
    launchTimer = 0;
  }

  if (fireworks.length > 500) {
    for (let i = fireworks.length - 1; i >= 0; i--) {
      if (fireworks[i].dead) fireworks.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointerdown", (event) => launch(event.clientX, event.clientY));
requestAnimationFrame(animate);
