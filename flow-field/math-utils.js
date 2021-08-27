// max exclusive
export const randomInt = max => Math.floor(Math.random() * max);

export const randomInRange = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.random() * (max - min) + min;
}

export const distanceBetweenPoints = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export const pointAtAngleInDistance = (origin, angle, distance) => {
  const x = origin.x + distance * Math.cos(angle);
  const y = origin.y + distance * Math.sin(angle)

  return { x, y };
}