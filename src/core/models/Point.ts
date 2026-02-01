import type { Coords } from './Coords';

export interface Point {
  x: number;
  y: number;
  isMoving?: boolean;
}

export interface ScaledPoint {
  x: number;
  y: number;
}

export const createPoint = (x: number, y: number, isMoving: boolean = false): Point => ({
  x,
  y,
  isMoving,
});

export const createPointFromCoords = (coords: Coords, size: number): Point => ({
  x: (coords.x % size) / size,
  y: 1.0 - (coords.y % size) / size,
  isMoving: false,
});

export const updatePointPosition = (
  point: Point,
  current: Coords,
  starting: Coords,
  size: number
): void => {
  point.x = (starting.x % size) / size + (current.x - starting.x) / size;
  if (point.x > 1) {
    point.x -= 1;
  }
  if (point.x < 0) {
    point.x += 1;
  }

  point.y = 1.0 - (starting.y % size) / size - (current.y - starting.y) / size;
  if (point.y > 1) {
    point.y -= 1;
  }
  if (point.y < 0) {
    point.y += 1;
  }
};

export const scalePoint = (point: Point, width: number, height: number): ScaledPoint => ({
  x: Math.floor(point.x * width),
  y: Math.floor(point.y * height),
});
