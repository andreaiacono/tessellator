import type { ScaledPoint } from '../models/Point';

export const distance = (a: ScaledPoint, b: ScaledPoint): number => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

export const areEqual = (a: number, b: number, epsilon: number = 0.1): boolean => {
  return Math.abs(a - b) < epsilon;
};

export const areInline = (
  a: ScaledPoint,
  b: ScaledPoint,
  c: ScaledPoint,
  epsilon: number = 0.1
): boolean => {
  const dist = distance(a, b) + distance(b, c);
  const directDist = distance(a, c);
  return areEqual(dist, directDist, epsilon);
};
