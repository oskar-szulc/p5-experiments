import { randomInt, randomInRange, pointAtAngleInDistance, distanceBetweenPoints } from "./math-utils.js";

const setup = {
  radius: 30,
  maxTries: 10,
  N: 2,
}

const point = (x, y) => ({ x, y })

const init = (radius, maxTries, dimensions) => {
  setup.radius = radius;
  setup.maxTries = maxTries;
  setup.N = dimensions;
  setup.cellsize = Math.floor(radius / Math.sqrt(dimensions));
}

const initGrid = (width, height) => {
  const grid = [];

  for (let x = 0; x < width; x++) {
    grid.push([]);
    for (let y = 0; y < height; y++) {
      grid[x].push(null)
    }
  }

  return grid;
}

const insertPoint = (grid, point) => {
  const gridX = gridPosition(point.x);
  const gridY = gridPosition(point.y);

  grid[gridX][gridY] = point;
}

const gridPosition = position => Math.floor(position / setup.cellsize);

const isInViewport = (point, viewportWidth, viewportHeight) => {
  return point.x >= 0 && point.x < viewportWidth && point.y >= 0 && point.y < viewportHeight;
}

const isValidPoint = (grid, gridWidth, gridHeight, point, radius) => {
  const xPos = gridPosition(point.x);
  const yPos = gridPosition(point.y);

  const startX = Math.max(xPos - 1, 0);
  const endX = Math.min(xPos + 1, gridWidth - 1);

  const startY = Math.max(yPos - 1, 0);
  const endY = Math.min(yPos + 1, gridHeight - 1);

  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      if (grid[x][y]) {
        const pointInGrid = grid[x][y];
        if (distanceBetweenPoints(pointInGrid, point) < radius)
          return false;
      }
    }
  }

  return true;
}

export const poissonSampling = (canvasWidth, canvasHeight, radius = 30, maxTries = 10) => {
  init(radius, maxTries, 2);
  const gridWidth = gridPosition(canvasWidth) + 1;
  const gridHeight = gridPosition(canvasHeight) + 1;
  const grid = initGrid(gridWidth, gridHeight);

  const active = [];
  const points = [];

  const initialPoint = point(
    randomInt(canvasWidth),
    randomInt(canvasHeight)
  )

  insertPoint(grid, initialPoint)
  points.push(initialPoint)
  active.push(initialPoint)

  while (active.length > 0) {
    const testPointAt = randomInt(active.length);
    const randomPoint = active[testPointAt];
    let found = false;

    for (let i = 0; i < maxTries; i++) {
      //1
      const theta = Math.random() * Math.PI * 2;
      const testRadius = randomInRange(setup.radius, 2 * setup.radius);
      const testPoint = pointAtAngleInDistance(randomPoint, theta, testRadius);

      //2
      if (!isInViewport(testPoint, canvasWidth, canvasHeight) ||
        !isValidPoint(grid, gridWidth, gridHeight, testPoint, radius)) {
        continue;
      }
      else {
        points.push(testPoint);
        active.push(testPoint);
        insertPoint(grid, testPoint);
        found = true;
        break;
      }
    }

    if (!found) {
      active.splice(testPointAt, 1);
    }
  }

  return points;
}
