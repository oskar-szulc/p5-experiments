// pomysly
// - morph z jednego flow field do drugiego

let flowfield = {};
let canvasWidth = 600;
let canvasHeight = 600;
let grid = {
  width: 0,
  height: 0,
  size: 0,
};
let t = 0;
let linesConfig = [];
let poissonPoints = []

import { poissonSampling } from "./poisson.js";

p5.disableFriendlyErrors = true;

function lineAtAngle(startx, starty, length, angle) {
  let endx = length * cos(angle) + startx;
  let endy = length * sin(angle) + starty;

  line(startx, starty, endx, endy);
}

function initSpace({ outputWidth, outputHeight, gridSize }) {
  canvasWidth = outputWidth;
  canvasHeight = outputHeight;

  grid.size = gridSize;
  grid.width = ceil(canvasWidth / gridSize);
  grid.height = ceil(canvasHeight / gridSize);
}

const logBypass = (val, label) => { console.log(label, val); return val; }
const normalizedPosition = (x, y) => x * grid.width + y;

function generateFlowField() {
  let startAngle = random(0, 360);
  let t = 0;
  for (let x = -grid.width / 2; x < 2 * grid.width; x++) {
    t++;
    for (let y = -grid.height / 2; y < 2 * grid.height; y++) {
      flowfield[normalizedPosition(x, y)] = radians(startAngle + t);
    }
  }
}

function generateFlowFieldPerlin() {
  for (let x = -grid.width / 2; x < 1.5 * grid.width; x++) {
    for (let y = -grid.height / 2; y < 1.5 * grid.height; y++) {
      const scaled_x = x * 0.05
      const scaled_y = y * 0.05

      let noise_val = noise(scaled_x, scaled_y)
      flowfield[normalizedPosition(x, y)] = map(noise_val, 0.0, 1.0, 0.0, 2 * PI);
    }
  }
}

function updateFlowField() {
  const step = millis() * 0.00001;
  for (let x = 0; x < grid.width; x++) {
    for (let y = 0; y < grid.height; y++) {
      let previousAngle = flowfield[normalizedPosition(x, y, grid.width)];
      flowfield[normalizedPosition(x, y, grid.width)] = previousAngle + PI * 0.01 * sin(step);
    }
  }
}

function generateLines(numOfLines) {
  for (let i = 0; i < numOfLines; i++) {
    let seed = random();
    linesConfig.push(
      {
        x: random(0, canvasWidth),
        y: random(0, canvasHeight),
        steps: 15,// 50 + random(0, 20),
        samplingStep: 100,
        seed,
      }
    )
  }
}

function generateLinesForPoissonSamples(samples, limit = 0) {
  const maxLines = limit > 0 ? Math.min(limit, samples.length) : samples.length;


  for (let i = 0; i < maxLines; i++) {
    let seed = random();
    linesConfig.push(
      {
        x: samples[i].x,
        y: samples[i].y,
        steps: 15,// 50 + random(0, 20),
        samplingStep: 100,
        seed,
      }
    )
  }
}

window.setup = function () {
  initSpace({
    outputWidth: 800,
    outputHeight: 800,
    gridSize: 10
  });
  createCanvas(canvasWidth, canvasHeight);
  smooth();

  poissonPoints = poissonSampling(canvasWidth, canvasHeight, 2 * grid.size);

  generateFlowFieldPerlin();
  generateLinesForPoissonSamples(poissonPoints);
}

window.draw = function () {
  colorMode(RGB);
  clear();
  background(0);

  drawFlowLines();
  // drawPoissonPoints();
  // drawFlowAngles();
  // updateFlowField();
}

const drawPoissonPoints = () => {
  poissonPoints.forEach(p => {
    circle(p.x, p.y, 4);
  })
}

const drawFlowLines = () => linesConfig.forEach(
  lineConfig => drawLineWithCurve(curveThroughField(lineConfig), lineConfig)
)

function curveThroughField(config) {
  const points = [
    { x: config.x, y: config.y }
  ];

  let x = config.x;
  let y = config.y;

  for (let i = 0; i < config.steps; i++) {
    let gridX = Math.floor(x / grid.size);
    let gridY = Math.floor(y / grid.size);

    const angle = flowfield[normalizedPosition(gridX, gridY)];

    x = config.samplingStep * Math.cos(angle) + x;
    y = config.samplingStep * Math.sin(angle) + y;

    points.push({ x, y })
  }

  return points;
}

const drawLineWithCurve = (points, config) => {
  colorMode(HSB);

  noFill();

  strokeWeight(2 * config.seed);
  stroke(
    (config.seed * 50),// * Math.sin((millis() * 0.001)), //H
    53 + 20 * config.seed,           //S
    80,//50 + 100 * (1 - config.seed),    //B
    1 - config.seed //A
  );

  beginShape();
  points.forEach(point => {
    curveVertex(point.x, point.y);
  })
  endShape();
}

function drawFlowAngles() {
  for (let x = -grid.width; x < 2 * grid.width; x++) {
    for (let y = -grid.height; y < 2 * grid.height; y++) {
      let screenX = x * grid.size;
      let screenY = y * grid.size;

      // strokeWeight(3);
      // stroke(0);
      // circle(screenX, screenY, 2);

      strokeWeight(1);
      // stroke(225 - (x + y), 21 + (x * 3), 23 + (y * 7));
      stroke(200);

      const dynamicLineSize = grid.size;// grid.size * (sin(t * 0.1) + 1) * 0.5;

      lineAtAngle(screenX, screenY, dynamicLineSize, flowfield[normalizedPosition(x, y)]);
    }
  }

}