import type { Point, ScaledPoint } from './Point';
import { scalePoint } from './Point';

export interface Stroke {
  points: Point[];        // Normalized coordinates (0-1 range)
  thickness: number;      // Line thickness when drawn
  color: string;          // Color when drawn (hex format)
}

export interface Cell {
  size: number;
  epsilon: number;
  points: Point[];
  strokes?: Stroke[];     // Optional for backward compatibility
}

export const createCell = (): Cell => ({
  size: 1,
  epsilon: 0.1,
  points: [
    { x: 0.0, y: 0.0, isMoving: false },
    { x: 1.0, y: 0.0, isMoving: false },
    { x: 1.0, y: 1.0, isMoving: false },
  ],
  strokes: [],
});

export const createCellFromData = (points: Point[], size: number = 1, epsilon: number = 0.1): Cell => ({
  size,
  epsilon,
  points,
});

export const setNewSize = (cell: Cell, size: number): void => {
  cell.size = size;
  cell.epsilon = 12 / size;
};

export const findExistingPoint = (cell: Cell, searchedPoint: Point): Point | null => {
  return (
    cell.points.find(
      (p) => Math.abs(p.x - searchedPoint.x) < cell.epsilon && Math.abs(p.y - searchedPoint.y) < cell.epsilon
    ) || null
  );
};

export const distance = (a: ScaledPoint, b: ScaledPoint): number => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

const areEqual = (a: number, b: number, epsilon: number): boolean => {
  return Math.abs(a - b) < epsilon;
};

export const areInline = (
  a: ScaledPoint,
  b: ScaledPoint,
  c: ScaledPoint,
  epsilon: number
): boolean => {
  return areEqual(distance(a, b) + distance(b, c), distance(a, c), epsilon);
};

export const findNewPointIndex = (cell: Cell, point: ScaledPoint, width: number): number | null => {
  for (let i = 1; i < cell.points.length; i++) {
    const previousPoint = scalePoint(cell.points[i - 1], width, width);
    const currentPoint = scalePoint(cell.points[i], width, width);

    if (areInline(previousPoint, point, currentPoint, cell.epsilon)) {
      console.log('FOUND', previousPoint, point, currentPoint);
      return i;
    } else if (areInline(previousPoint, { x: point.x, y: point.y - width - 1 }, currentPoint, cell.epsilon)) {
      console.log('FOUND COPY Y', previousPoint, { x: point.x, y: point.y - width - 1 }, currentPoint);
      return i;
    } else if (areInline(previousPoint, { x: point.x + width - 1, y: point.y }, currentPoint, cell.epsilon)) {
      console.log('FOUND COPY X', previousPoint, { x: point.x + width - 1, y: point.y }, currentPoint);
      return i;
    }
  }
  return null;
};

export const addHorizontalPoint = (cell: Cell, newPoint: Point, width: number): void => {
  const scaledPoint = scalePoint(newPoint, width, width);
  const index = findNewPointIndex(cell, scaledPoint, width);
  if (index === null) {
    throw new Error('Trying to add a new point not part of a line');
  }
  cell.points.splice(index, 0, newPoint);
};

export const deletePoint = (cell: Cell, point: Point): void => {
  const index = cell.points.findIndex(
    (p) => Math.abs(p.x - point.x) < cell.epsilon && Math.abs(p.y - point.y) < cell.epsilon
  );
  if (index !== -1) {
    cell.points.splice(index, 1);
  }
};

export const addStroke = (cell: Cell, stroke: Stroke): void => {
  if (!cell.strokes) {
    cell.strokes = [];
  }
  cell.strokes.push(stroke);
};

export const clearStrokes = (cell: Cell): void => {
  cell.strokes = [];
};
