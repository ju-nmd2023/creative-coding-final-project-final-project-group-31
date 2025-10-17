function setup() {
  createCanvas(750, 750);
  frameRate(5);
}

const size = 500;
const layers = 50;
const variance = size / 25;

const palette = [
  color(204, 16, 45),
  color(232, 133, 20),
  color(255, 255, 40),
  color(125, 198, 44),
  color(113, 192, 222),
  color(99, 76, 138),
];

function getRandomValue(pos, variance) {
  return pos + map(Math.random(), 0, 1, -variance, variance);
}

function drawTriangle(x, y, size, variance) {
  noFill();
  beginShape();

  const h = (sqrt(3) / 2) * size;
  const pts = [
    [x, y - h / 2],
    [x - size / 2, y + h / 3],
    [x + size / 2, y + h / 3],
  ];

  for (let [px, py] of pts) {
    vertex(getRandomValue(px, variance), getRandomValue(py, variance));
  }

  endShape(CLOSE);
}

function drawLayers(x, y, size, layers) {
  for (let i = 0; i < layers; i++) {
    if (Math.random() > 0.8) continue;

    stroke(random(palette));
    strokeWeight(1.5);

    const s = (size / layers) * (i + 1);
    const v = variance * (i / layers);
    drawTriangle(x, y, s, v);
  }
}

function draw() {
  background(0);

  drawLayers(width / 2, height / 2, size, layers);
}
