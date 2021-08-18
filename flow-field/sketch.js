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
        x: random(-200, canvasWidth + 200),
        y: random(-200, canvasHeight + 200),
        steps: 20,
        samplingStep: 20,
        seed,
      }
    )
  }
}

function setup() {
  initSpace({
    outputWidth: 800,
    outputHeight: 800,
    gridSize: 50
  });
  createCanvas(canvasWidth, canvasHeight);
  smooth();

  generateFlowField();
  generateLines(1000);
}

function draw() {
  colorMode(RGB);
  clear();
  background(0);

  drawFlowLines();
  // drawFlowAngles();
  // updateFlowField();
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
    let gridX = floor(x / grid.size);
    let gridY = floor(y / grid.size);

    const angle = flowfield[normalizedPosition(gridX, gridY)];

    x = config.samplingStep * cos(angle) + x;
    y = config.samplingStep * sin(angle) + y;

    points.push({ x, y })
  }

  return points;
}

const drawLineWithCurve = (points, config) => {
  colorMode(HSB);

  noFill();

  strokeWeight(3 * config.seed);
  stroke(
    (250 + config.seed * 50) % 360, //H
    50, //53 + 20 * config.seed,           //S
    80,//50 + 100 * (1 - config.seed),    //B
    100// * (1 - config.seed)          //A
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