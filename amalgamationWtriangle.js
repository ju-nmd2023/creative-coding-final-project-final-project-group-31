
let horizonY = -50;
let numLines = 260;
let spread = 4365;
let perspectiveFactor = 0.1;
let leftOffset = -120;

let noiseScale = 0.002;
let yStep = 8;
let timeSpeed = 0.003;

// triangel specs
const triSize = 250;
const layers = 50;
const variance = triSize / 21;

const palette = [
  color(204, 16, 45),
  color(232, 133, 20),
  color(255, 255, 40),
  color(125, 198, 44),
  color(113, 192, 222),
  color(99, 76, 138),
];

const triCenterX = 400;
const triCenterY = 350;

// rita triangle
function getRandomValue(pos, variance) {
  return pos + map(Math.random(), 0, 1, -variance, variance);
}

function drawTriangle(x, y, size, layers) {
  for (let i = 0; i < layers; i++) {
    if (Math.random() > 0.8) continue;
    stroke(random(palette));
    strokeWeight(4);
    const s = (size / layers) * (i + 1);
    const v = variance * (i / layers);

    noFill();
    beginShape();
    const h = (sqrt(3) / 2) * s;
    const pts = [
      [x, y - h / 2],
      [x - s / 2, y + h / 3],
      [x + s / 2, y + h / 3],
    ];
    for (let [px, py] of pts) {
      vertex(getRandomValue(px, v), getRandomValue(py, v));
    }
    endShape(CLOSE);
  }
}

function setup() {
  createCanvas(600, 600);
  noFill();
  frameRate(30);
}


function draw() {
  background(240);

  const middleIndex = floor(numLines / 2);
  const highlightedLines = [middleIndex - 86, middleIndex - 85];

  // strecken som går verticalt, 
  strokeWeight(22);
  for (let i = 0; i < numLines; i++) {
    let worldX = map(i, 0, numLines, 0, spread);
    let xTop = leftOffset + worldX * perspectiveFactor;
    let xBottom = leftOffset + worldX;

    let baseColor = (i % 2 === 0) ? color('#4c6394') : color('#29251d');

    let isHighlighted = highlightedLines.includes(i);
    if (isHighlighted) baseColor = color('#f4d35e');

    stroke(baseColor);
    beginShape();
    for (let y = horizonY; y <= height; y += yStep) {
      let t = map(y, horizonY, height, 0, 1);
      let baseX = lerp(xTop, xBottom, t);

      // sway (ändra snarast)
      let angle = noise(i * noiseScale, y * noiseScale, frameCount * timeSpeed) * TWO_PI;
      let sway = sin(angle) * pow(t, 2) * 30;

      let x = baseX + sway;

      // Triangel effekt på animationen
      let dx = baseX - triCenterX;
      let dy = y - triCenterY;
      let dist = sqrt(dx * dx + dy * dy);
      let swirlRadius = 200; // horizontal influence
      if (dist < swirlRadius) {
        let swirlFactor = pow(1 - dist / swirlRadius, 2);
        let swirlAngle = atan2(dy, dx) + frameCount * 0.05;
        x += cos(swirlAngle) * 50 * swirlFactor;
      }

      if (isHighlighted) {
        let bottomSway = sin(frameCount * 0.0 + i) * pow(t, 2) * 60;
        x += bottomSway;
      }

      vertex(x, y);
    }
    endShape();
  }

  drawTriangle(triCenterX, triCenterY, triSize, layers);
}
