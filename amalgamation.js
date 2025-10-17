function setup() {
    createCanvas(600, 600);
    noLoop();
  }
  
  function draw() {
    background(240);
  
    let horizonY = -58;
    let numLines = 280;
    let spread = 3900;
    let perspectiveFactor = 0.1;
    let lineWidth = 30;
    let leftOffset = -120; 
  
    noStroke();
  
    let middleIndex = floor(numLines / 2);
  
    for (let i = 0; i < numLines; i++) {
      let worldX = map(i, 0, numLines, 0, spread);
  
      let xTop = leftOffset + worldX * perspectiveFactor;
      let yTop = horizonY;
      let xBottom = leftOffset + worldX;
      let yBottom = height;
  
      let currentLineWidth = lineWidth;
      let baseColor;
  
      if (i === middleIndex - 92) {
        baseColor = color('#f4d35e'); 
        currentLineWidth = 30;        
      } else  if (i === middleIndex - 93) {
        baseColor = color('#f4d35e'); 
        currentLineWidth = 30;        
      } else {
        
        if (i % 2 === 0) {
          baseColor = color('#4c6394'); 
        } else {
          baseColor = color('#29251d'); 
        }
      }
  
      
      let noiseAmount = 6;
      let r = constrain(red(baseColor) + random(-noiseAmount, noiseAmount), 0, 255);
      let g = constrain(green(baseColor) + random(-noiseAmount, noiseAmount), 0, 255);
      let b = constrain(blue(baseColor) + random(-noiseAmount, noiseAmount), 0, 255);
      fill(r, g, b);
  
      beginShape();
      vertex(xTop, yTop);
      vertex(xTop + currentLineWidth * perspectiveFactor, yTop);
      vertex(xBottom + currentLineWidth, yBottom);
      vertex(xBottom, yBottom);
      endShape(CLOSE);
    }
  }
  