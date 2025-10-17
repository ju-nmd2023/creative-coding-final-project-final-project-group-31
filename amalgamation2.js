function setup() {
    createCanvas(600, 600);
    noFill();
    strokeWeight(18);
  }
  
  function draw() {
    background(240);
  
    let horizonY = -50;
    let numLines = 260;
    let spread = 4365;
    let perspectiveFactor = 0.1;
    let leftOffset = -120;
  
    // ställ in flow field
    let noiseScale = 0.002;     
    let flowStrength = 1.5;    
    let yStep = 8;             
    let timeSpeed = 0.003;      
    for (let i = 0; i < numLines; i++) {
      let worldX = map(i, 0, numLines, 0, spread);
      let xTop = leftOffset + worldX * perspectiveFactor;
      let xBottom = leftOffset + worldX;
  
      // färgbyte nedan, ändra ej
      let baseColor;
      if (i % 2 === 0) {
        baseColor = color('#4c6394'); 
      } else {
        baseColor = color('#29251d');
      }
  
      // mittlinjen, pille inte
      let middleIndex = floor(numLines / 2);
      if (i === middleIndex - 86|| i === middleIndex - 85) {
        baseColor = color('#f4d35e');
      }
  
      stroke(baseColor);
  
      beginShape();
      for (let y = horizonY; y <= height; y += yStep) {
        let t = map(y, horizonY, height, 0, 1);
        let baseX = lerp(xTop, xBottom, t);
        let angle = noise(i * noiseScale, y * noiseScale, frameCount * timeSpeed) * TWO_PI;
        let sway = sin(angle) * pow(t, 2) * 90;
  
        let x = baseX + sway;
        let yPos = y;
  
        vertex(x, yPos);
      }
      endShape();
    }
  }
  