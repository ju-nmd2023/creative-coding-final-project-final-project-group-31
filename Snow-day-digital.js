let particles = [];

// tweak particles, keep particleAmount lower to reduce lag
let particleAmount = 2;
let durationMin = 80;
let durationMax = 900;

// spawn particles in a sheet above screen, and apply direction.
let bandHeight = 25;
let bandY = -25;
let dirY = 0.2;

// physics
let gravityStrength = 0.10;

// sway timings
let swayT = 0;
let swaySpeed = 0.02;
let swayAmp = 1;
let swayPhaseOffset = 0;

// sway offset
let swayOffset = 0;
let prevSwayOffset = 0;
let swayVel = 0;

// bg below
let bg; 

const size = 11;        
const layers = 20;       
const variance = size / layers;

function getRandomValue(pos, variance) {
  return pos + map(Math.random(), 0, 1, -variance, variance);
}

function drawLayers(g, x, y, size, layers) {
  g.noFill();

  let tY = constrain(y / height, 0, 1);
  tY = lerp(0.25, 0, tY);
  const strokeCol = lerpColor(color(12, 22, 70), color(255), tY);

  for (let i = 0; i < layers; i++) {
    if (Math.random() > 0.09) continue;

    g.stroke(strokeCol);

    const s = (size / layers) * i;
    const half = s / 2;

    g.beginShape();
    g.vertex(getRandomValue(x - half, variance), getRandomValue(y + half, variance));
    g.vertex(getRandomValue(x - half, variance), getRandomValue(y - half, variance));
    g.vertex(getRandomValue(x + half, variance), getRandomValue(y - half, variance));
    g.vertex(getRandomValue(x + half, variance), getRandomValue(y + half, variance));
    g.endShape(CLOSE);
  }
}

function rebuildBackground() {
  bg = createGraphics(innerWidth, innerHeight);
  bg.background(0);

  const cols = Math.ceil(width / size) + 1;
  const rows = Math.ceil(height / size) + 1;
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      drawLayers(bg, size / 2 + x * size, size / 2 + y * size, size, layers);
    }
  }
}

function setup() {
  createCanvas(innerWidth, innerHeight);

  // Random sway per generation for the partcles
  swayPhaseOffset = random(TWO_PI);
  swayAmp = random(10, 26);
  swaySpeed = random(0.06, 0.14);

  rebuildBackground();
}

function draw() {
  // draw bg without loop
  image(bg, 0, 0);

  // Uupdate global sway
  prevSwayOffset = swayOffset;
  swayT += swaySpeed;
  swayOffset = sin(swayT + swayPhaseOffset) * swayAmp;
  swayVel = swayOffset - prevSwayOffset;

  // spawn particles as a sheet
  for (let i = 0; i < particleAmount; i++) {
    let px = random(0, width);
    let py = random(bandY, bandY + bandHeight);
    spawnParticle(px, py);
  }

  // update or draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].durationEnd) particles.splice(i, 1);
  }
}

function spawnParticle(x, y) {
  let duration = int(random(durationMin, durationMax));

  // individual gravity and airThickness, kept from old artwork
  let individualAirThickness = random(0.985, 0.999);
  let individualGravity = random(gravityStrength * 0.6, gravityStrength * 1.4);

  particles.push(new Particle(x, y, duration, individualAirThickness, individualGravity));
}

class Particle {
  constructor(x, y, duration, individualAirThickness, individualGravity) {
    this.baseX = x;
    this.y = y;

    this.vy = 0;

    this.duration = duration;
    this.maxduration = duration;

    this.size = random(1.5, 3.5);
    this.drag = individualAirThickness;
    this.gravityStrength = individualGravity;

    // Randomize amplitude per particle (timing is shared)
    this.swayStrength = random(0.16, 2.6);
  }

  update() {
    this.vy += dirY * this.gravityStrength;
    this.vy *= this.drag;
    this.y += this.vy;

    this.duration--;
    this.durationEnd = this.duration <= 0;
  }

  draw() {
    let alpha = map(this.duration, 0, this.maxduration, 0, 80);

    let x = this.baseX + swayOffset * this.swayStrength;
    let y = this.y;

    noStroke();
    fill(255 * 0.55);
    circle(x, y, this.size * 1.2);
  }
}  

// press space to reset bg. 
function keyPressed() {
  if (key === ' ') {
    rebuildBackground();
  }
}
