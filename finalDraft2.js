
let params = {
    w: 900,
    h: 600,
  
    animate: true,
    noiseZSpeed: 0.003,

    beamAngleRange: 0.35,
  
    // Change this to adjust the prism-rainbow trail
    rainbowLength: 1900,
    rainbowSpread: 0.22,
    rainbowSteps: 120,
    rainbowExp: 11.0,
    rainbowNoiseAmt: 0.012,
  
    // Textur & rörelse
    stripes: 140,
    baseStroke: 1.45,
    widthJitter: 0.18,
    microRuffleAmp: 0.8,
    microRuffleFreq: 8.0,
    highlightOffset: 0.6,
    highlightAlpha: 110,
  };
  
  let tri, beam = { start:null, dir:null, hit:null, endFar:null, ttl:0 };
  let palette;
  let tNoise = 0, timePhase = 0;
  
  // BG
  const BG = {
    cellSize: 30,
    layers: 10,
    swirlScale: 0.5,
    starScale: 0.3,
    jitter(cell) { return cell / 8; },
    bgColor: [11, 6, 19],
    skyColors: [
      [25, 10, 35],
      [46, 18, 64],
      [72, 27, 110],
      [110, 58, 166],
    ],
    starColors: [
      [146, 116, 206],
      [170, 140, 230],
      [200, 180, 255],
    ],
    starThreshold: 0.67,
  };
  
  let bgG, fgG;
  let bgReady = false;
  
  function setup() {
    createCanvas(900, 600);
    pixelDensity(1);
  
    bgG = createGraphics(900, 600);
    fgG = createGraphics(900, 600);
  
    colorMode(RGB, 255, 255, 255, 255);
    initPalette();
    initScene();
    reseedBeam();
  }
  
  // Color for the background
  function initPalette() {
    palette = {
      bg: color(10, 8, 18),
  
      // beam colors
      beamCore: color(255, 36, 36),
      beamRim:  color(255, 120, 40, 220),
  
      outline: color(220),
  
      // RÖR inte, om man laddar om för mycket så kraschar skiten, vet inte varför
      contour: [
        color(160, 120, 200),
        color(120, 90, 180),
        color(80, 70, 160),
        color(60, 55, 140),
        color(70, 110, 180),
        color(60, 140, 170),
        color(40, 170, 160),
        color(60, 180, 120),
        color(220, 160, 50),
        color(220, 120, 60),
        color(210, 80, 80),
        color(190, 60, 120),
      ],
    };
  }
  
  // triangle, beam and rainbow, aka foreground stuff below here.
  function initScene() {
    tri = {
      size: 150,
      pos: { x: width * 0.58, y: height * 0.48 },
      rot: 0,
    };
    tri.pts = buildTriangle(tri.pos.x, tri.pos.y, tri.size, tri.rot);
  }
  
  function buildTriangle(cx, cy, size, rot) {
    const r = size / Math.sqrt(3);
    let pts = [];
    for (let i = 0; i < 3; i++) {
      const a = rot + (i * TWO_PI) / 3 - HALF_PI;
      pts.push({ x: cx + r * cos(a), y: cy + r * sin(a) });
    }
    return pts;
  }
  
  // beam function
  function reseedBeam() {
    const start = { x: 0, y: height / 2 };
    const ang = random(-params.beamAngleRange, params.beamAngleRange);
    const dir = { x: cos(ang), y: sin(ang) };
  
    const far = { x: start.x + dir.x * (width * 2), y: start.y + dir.y * (width * 2) };
    const hit = triangleIntersection(start, far, tri.pts);
  
    beam.start = start;
    beam.dir = dir;
    beam.endFar = far;
    beam.hit = hit;
    beam.ttl = params.beamDurationFrames;
  }
  
  // debug function, not necissarily to be used within the artwork, but it could be nice to showcase how
  //we decided to test the beam hitting the target in an easy
  function keyPressed() {
    if (key === 'r' || key === 'R' || keyCode === 32) reseedBeam();
  }
  
  //renders foreground on top of background, also used chatGPT for help here.
  function draw() {
    if (!bgReady) { renderCurrentsBackground(bgG); bgReady = true; }
    fgG.clear();
    drawPrismRainbow(fgG);
    image(bgG, 0, 0);
    image(fgG, 0, 0);
    if (params.animate) { tNoise += params.noiseZSpeed; timePhase += 0.02; }
  
    if (params.beamAutoReseed) {
      beam.ttl--;
      if (beam.ttl <= 0) reseedBeam();
    }
  }
  
  function renderCurrentsBackground(pg) {
    pg.push();
    pg.colorMode(RGB, 255, 255, 255, 255);
    pg.background(...BG.bgColor);
  
    const cellSize = BG.cellSize;
    const layers = BG.layers;
    const jitter = BG.jitter(cellSize);
    const swirlScale = BG.swirlScale;
    const starScale = BG.starScale;
  
    const skyCols = BG.skyColors.map(c => pg.color(...c));
    const starCols = BG.starColors.map(c => pg.color(...c));
  
    for (let y = 0; y < pg.height; y += cellSize) {
      for (let x = 0; x < pg.width; x += cellSize) {
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
  
        const rot = noise(cx * swirlScale, cy * swirlScale) * TWO_PI;
  
        const starMask = noise(cx * starScale + 1000, cy * starScale - 500);
        const isStar = starMask > BG.starThreshold;
        const pal = isStar ? starCols : skyCols;
  
        const r = Math.random();
        const shape = r < 0.3 ? "circle" : r < 0.75 ? "square" : "triangle";
  
        bgDrawStack(pg, cx, cy, cellSize * 0.9, layers, jitter, rot, pal, shape);
      }
    }
    pg.pop();
  }
  
  function bgDrawStack(pg, cx, cy, size, layersCount, jitterAmt, rot, pal, shape) {
    pg.noFill();
    pg.push();
    pg.translate(cx, cy);
    pg.rotate(rot);
  
    for (let i = 0; i < layersCount; i++) {
      if (Math.random() > 0.75) continue;
  
      const c = pal[Math.floor(Math.random() * pal.length)];
      const strokeCol = pg.color(pg.red(c), pg.green(c), pg.blue(c), 210 - i * 8);
      pg.stroke(strokeCol);
      pg.strokeWeight(1);
  
      const s = (size / layersCount) * (i + 1);
      const v = BG.jitter(BG.cellSize) * (1.5 + i / layersCount);
  
      if (shape === "circle") {
        const dx = j(0, v * 0.3);
        const dy = j(0, v * 0.3);
        const d = s + map(Math.random(), 0, 1, -v, v);
        pg.ellipse(dx, dy, d, d);
      } else if (shape === "square") {
        const half = s / 2;
        pg.beginShape();
        pg.vertex(j(-half, v), j( half, v));
        pg.vertex(j(-half, v), j(-half, v));
        pg.vertex(j( half, v), j(-half, v));
        pg.vertex(j( half, v), j( half, v));
        pg.endShape(CLOSE);
      } else {
        const h = (sqrt(3) / 2) * s;
        pg.beginShape();
        pg.vertex(j(0, v),        j(-h / 2, v));
        pg.vertex(j(-s / 2, v),   j( h / 2, v));
        pg.vertex(j( s / 2, v),   j( h / 2, v));
        pg.endShape(CLOSE);
      }
    }
    pg.pop();
  }
  
  function j(pos, amount) { return pos + map(Math.random(), 0, 1, -amount, amount); }
  
  // animation for the prism efect, aka the rainbow
  function drawPrismRainbow(pg) {
    pg.push();
    pg.colorMode(RGB, 255, 255, 255, 255);
  
    //values for the triangle, so just change the stroke here to get the desired effect
    pg.noFill();
    pg.stroke(palette.outline);
    pg.strokeWeight(2.2);
    drawTriangle(pg, tri.pts);
  
    //used chatGPT to get a good idea on how to handle the beam and triangle interaction. 
    let endPt;
    if (beam.hit) endPt = beam.hit.p;
    else {
      const endX = width + 40;
      const t = (endX - beam.start.x) / (beam.endFar.x - beam.start.x);
      const endY = beam.start.y + (beam.endFar.y - beam.start.y) * t;
      endPt = { x: endX, y: endY };
    }
  
    pg.stroke(palette.beamRim);  pg.strokeWeight(6);
    pg.line(beam.start.x, beam.start.y, endPt.x, endPt.y);
    pg.stroke(palette.beamCore); pg.strokeWeight(3);
    pg.line(beam.start.x, beam.start.y, endPt.x, endPt.y);
  
    if (!beam.hit) { pg.pop(); return; }
  
  
    // chat GPT helped here too
    const c = centroid(tri.pts[0], tri.pts[1], tri.pts[2]);
    const rails = buildOuterRails(
      c, params.rainbowLength, params.rainbowSpread, params.rainbowSteps, params.rainbowExp, params.rainbowNoiseAmt
    );
    drawContourRibbons(pg, rails.left, rails.right, params.rainbowSteps);
  
    pg.pop();
  }
  
  function drawTriangle(pg, pts) {
    pg.beginShape();
    for (let i = 0; i < 3; i++) pg.vertex(pts[i].x, pts[i].y);
    pg.endShape(CLOSE);
  }
  
  function buildOuterRails(c, L, spread, steps, expFactor, noiseAmount) {
    let left = [], right = [];
    for (let j = 0; j <= steps; j++) {
      const k = j / steps;
      const baseLen = L * k;
      const growth  = pow(k, expFactor);
      const angL = -spread * (1 + growth);
      const angR =  spread * (1 + growth);
  
      // Tweak values here to change animation of the rainbow trail coming off the prism, but I feel like we can leave it like this for now. Looks good!
      const nVal = noise(baseLen * 0.002, tNoise * 4);
      const baseWiggle = (nVal - 0.5) * noiseAmount * L * k * 0.35;
  
      const waveFreq  = 3.2;
      const waveAmp   = 120 * pow(k, 2);
      const wavePhase = timePhase * 3;
      const wave      = sin(k * PI * waveFreq + wavePhase) * waveAmp;
  
      const wiggle = baseWiggle + wave;
  
      const xl = c.x + cos(angL) * baseLen + cos(angL + HALF_PI) * wiggle;
      const yl = c.y + sin(angL) * baseLen + sin(angL + HALF_PI) * wiggle;
      left.push({ x: xl, y: yl, k });
  
      const xr = c.x + cos(angR) * baseLen + cos(angR + HALF_PI) * wiggle;
      const yr = c.y + sin(angR) * baseLen + sin(angR + HALF_PI) * wiggle;
      right.push({ x: xr, y: yr, k });
    }
    return { left, right };
  }
  
  function drawContourRibbons(pg, left, right, steps) {
    const stripes = params.stripes;
    const colorN  = palette.contour.length;
  
    // ChatGPT for math and such
    const normals = [];
    for (let j = 0; j <= steps; j++) {
      const pL = left[j], pR = right[j];
      const dir = atan2(pR.y - pL.y, pR.x - pL.x);
      normals.push({ nx: cos(dir + HALF_PI), ny: sin(dir + HALF_PI) });
    }
  
    for (let i = 0; i < stripes; i++) {
      const t = i / (stripes - 1);
      const colIdx = floor(map(i, 0, stripes - 1, 0, colorN)) % colorN;
  
      const baseCol = tintMul(palette.contour[colIdx], 0.92);
      pg.stroke(baseCol);
      pg.noFill();
  
      const wMod = 1.0 + params.widthJitter * 0.5 * sin(timePhase * 1.2 + i * 0.37);
      const baseW = params.baseStroke * wMod;
      pg.strokeWeight(baseW);
  
      pg.beginShape();
      for (let j = 0; j <= steps; j++) {
        const pL = left[j], pR = right[j];
        const k  = pL.k;
        let x = lerp(pL.x, pR.x, t);
        let y = lerp(pL.y, pR.y, t);
  
        const freq = 2.6 + 0.35 * (i % 7);
        const phase = timePhase * 2.0 + i * 0.17;
        const wobble = sin(k * PI * freq + phase) * (3.0 * pow(k, 2.2));
        x += normals[j].nx * wobble;
        y += normals[j].ny * wobble;
  
        const microK = params.microRuffleAmp * pow(k, 2.0);
        const micro  = microK * sin(timePhase * 3.4 + j * (params.microRuffleFreq * 0.17) + i * 0.11);
        const tangent = { tx: normals[j].ny, ty: -normals[j].nx };
        x += normals[j].nx * micro * 0.6 + tangent.tx * micro * 0.4;
        y += normals[j].ny * micro * 0.6 + tangent.ty * micro * 0.4;
  
        pg.vertex(x, y);
      }
      pg.endShape();
  
      // Dont touch it will break.
      const base = palette.contour[colIdx];
      const hlCol = color(red(base), green(base), blue(base), params.highlightAlpha);
      pg.push();
      pg.blendMode(SCREEN);
      pg.stroke(hlCol);
      pg.strokeWeight(max(1, baseW * 0.55));
      pg.beginShape();
      for (let j = 0; j <= steps; j++) {
        const pL = left[j], pR = right[j];
        const k  = pL.k;
        let x = lerp(pL.x, pR.x, t);
        let y = lerp(pL.y, pR.y, t);
  
        const freq = 2.6 + 0.35 * (i % 7);
        const phase = timePhase * 2.0 + i * 0.17;
        const wobble = sin(k * PI * freq + phase) * (3.0 * pow(k, 2.2));
        x += normals[j].nx * wobble;
        y += normals[j].ny * wobble;
  
        const microK = params.microRuffleAmp * pow(k, 2.0);
        const micro  = microK * sin(timePhase * 3.4 + j * (params.microRuffleFreq * 0.17) + i * 0.11);
        const tangent = { tx: normals[j].ny, ty: -normals[j].nx };
        x += normals[j].nx * micro * 0.6 + tangent.tx * micro * 0.4;
        y += normals[j].ny * micro * 0.6 + tangent.ty * micro * 0.4;
  
        x += normals[j].nx * params.highlightOffset;
        y += normals[j].ny * params.highlightOffset;
  
        pg.vertex(x, y);
      }
      pg.endShape();
      pg.pop();
    }
  }
  
  // Again ChatGPT had to help here, mostly with math stuff, also applies to the code following the segment below. 
  function triangleIntersection(p0, p1, pts) {
    let best = null, bestT = 1e9;
    for (let i = 0; i < 3; i++) {
      const a = pts[i], b = pts[(i + 1) % 3];
      const res = segmentIntersection(p0, p1, a, b);
      if (res && res.t < bestT) { bestT = res.t; best = { p: res.p }; }
    }
    return best;
  }
  
  function segmentIntersection(p, p2, q, q2) {
    const r = { x: p2.x - p.x, y: p2.y - p.y };
    const s = { x: q2.x - q.x, y: q2.y - q.y };
    const denom = cross(r, s);
    if (abs(denom) < 1e-6) return null;
    const qp = { x: q.x - p.x, y: q.y - p.y };
    const t = cross(qp, s) / denom;
    const u = cross(qp, r) / denom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1)
      return { p: { x: p.x + t * r.x, y: p.y + t * r.y }, t };
    return null;
  }
  
  function centroid(a, b, c) { return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 }; }
  function cross(a, b) { return a.x * b.y - a.y * b.x; }
  function tintMul(c, mul) { return color(red(c)*mul, green(c)*mul, blue(c)*mul, alpha(c)); }
  