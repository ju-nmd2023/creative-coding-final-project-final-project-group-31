function setup() {
  createCanvas(750, 750);
}

const size = 500;
const layers = 50;
const variance = size / 25;

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

    stroke(255);

    const s = (size / layers) * (i + 1);
    const v = variance * (i / layers);
    drawTriangle(x, y, s, v);
  }
}

function draw() {
  background(0);

  drawLayers(width / 2, height / 2, size, layers);

  noLoop();
}
