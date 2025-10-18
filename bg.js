function setup() {
  createCanvas(1200, 750);
  noLoop();
}

const size = 30;
const layers = 10;
const variance = size / 8;
const rotationScale = 1.5;
const accentScale = 0.5;

const baseColors = [
  color(25, 10, 35),
  color(46, 18, 64),
  color(72, 27, 110),
  color(110, 58, 166),
];

const accentColors = [
  color(146, 116, 206),
  color(170, 140, 230),
  color(200, 180, 255),
];

function getRandomValue(pos, amount) {
  return pos + map(Math.random(), 0, 1, -amount, amount);
}

function draw() {
  background(11, 6, 19);

  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      const cx = x + size / 2;
      const cy = y + size / 2;

      const rot = noise(cx * rotationScale, cy * rotationScale) * TWO_PI;

      const accentMask = noise(cx * accentScale + 1000, cy * accentScale - 500);
      const isAccent = accentMask > 0.6;
      const palette = isAccent ? accentColors : baseColors;

      const r = Math.random();
      const shape = r < 0.3 ? "circle" : r < 0.75 ? "square" : "triangle";

      drawStack(cx, cy, size * 0.9, layers, variance, rot, palette, shape);
    }
  }
}

function drawStack(
  cx,
  cy,
  size,
  layersCount,
  varianceAmt,
  rot,
  palette,
  shape
) {
  noFill();
  push();
  translate(cx, cy);
  rotate(rot);

  for (let i = 0; i < layersCount; i++) {
    if (Math.random() > 0.75) continue;

    stroke(palette[Math.floor(Math.random() * palette.length)]);
    strokeWeight(1);

    const s = (size / layersCount) * (i + 1);
    const v = varianceAmt * (1.5 + i / layersCount);

    if (shape === "circle") {
      const dx = getRandomValue(0, v * 0.3);
      const dy = getRandomValue(0, v * 0.3);
      const d = s + map(Math.random(), 0, 1, -v, v);
      ellipse(dx, dy, d, d);
    } else if (shape === "square") {
      const half = s / 2;
      beginShape();
      vertex(getRandomValue(-half, v), getRandomValue(half, v));
      vertex(getRandomValue(-half, v), getRandomValue(-half, v));
      vertex(getRandomValue(half, v), getRandomValue(-half, v));
      vertex(getRandomValue(half, v), getRandomValue(half, v));
      endShape(CLOSE);
    } else {
      const h = (sqrt(3) / 2) * s;
      beginShape();
      vertex(getRandomValue(0, v), getRandomValue(-h / 2, v));
      vertex(getRandomValue(-s / 2, v), getRandomValue(h / 2, v));
      vertex(getRandomValue(s / 2, v), getRandomValue(h / 2, v));
      endShape(CLOSE);
    }
  }
  pop();
}
