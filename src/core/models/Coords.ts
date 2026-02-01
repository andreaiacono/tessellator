export interface Coords {
  x: number;
  y: number;
}

export const createCoords = (x: number, y: number): Coords => ({ x, y });
