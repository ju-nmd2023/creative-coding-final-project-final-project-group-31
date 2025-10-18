function setup() {
  createCanvas(750, 750);
  background(12, 18, 46);
  field = generateField();
  agents = generateAgents();
}

const cell = 20;
const cols = Math.ceil(750 / cell);
const rows = Math.ceil(750 / cell);

const scale = 1 / 20;
const numAgents = 1000;
const maxSpeed = 1.8;
const maxForce = 0.06;

let field = [];
let agents = [];

class Agent {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.prev = this.pos.copy();
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
  }

  follow(dir) {
    const desired = dir.copy().mult(maxSpeed);
    const steer = p5.Vector.sub(desired, this.vel).limit(maxForce);
    this.acc.add(steer);
  }

  update() {
    this.prev = this.pos.copy();
    this.vel.add(this.acc).limit(maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  wrap() {
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.prev.x = width;
    } else if (this.pos.x > width) {
      this.pos.x = 0;
      this.prev.x = 0;
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.prev.y = height;
    } else if (this.pos.y > height) {
      this.pos.y = 0;
      this.prev.y = 0;
    }
  }

  draw() {
    stroke(120, 170, 255, 55);
    strokeWeight(0.6);
    line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);
  }
}

function generateField() {
  const f = [];
  noiseSeed(Math.floor(Math.random() * 1000));

  for (let x = 0; x < cols; x++) {
    f.push([]);
    for (let y = 0; y < rows; y++) {
      const angle = noise(x * scale, y * scale) * TWO_PI * 2.0;
      const v = p5.Vector.fromAngle(angle);

      v.add(2.0, 0);

      f[x].push(v.normalize());
    }
  }
  return f;
}

function generateAgents() {
  const list = [];
  for (let i = 0; i < numAgents; i++) {
    list.push(new Agent(random(0, width * 0.35), random(height)));
  }
  return list;
}

function draw() {
  for (let a of agents) {
    const cx = constrain(floor(a.pos.x / cell), 0, cols - 1);
    const cy = constrain(floor(a.pos.y / cell), 0, rows - 1);
    a.follow(field[cx][cy]);
    a.update();
    a.wrap();
    a.draw();
  }
}
