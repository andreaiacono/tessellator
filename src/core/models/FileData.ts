import type { Cell } from './Cell';

export interface FileData {
  cell: Cell;
  zoom: number;
  lineThickness?: number;
  drawGrid: boolean;
  drawColor: boolean;
  color1?: number;
  color2?: number;
}

export const createDefaultFileData = (cell: Cell): FileData => ({
  cell,
  zoom: 10,
  lineThickness: 1,
  drawGrid: true,
  drawColor: true,
  color1: 0xffffff, // white
  color2: 0x000000, // black
});

export const serializeFileData = (data: FileData): string => {
  return JSON.stringify(data);
};

export const deserializeFileData = (json: string): FileData => {
  return JSON.parse(json);
};

// Convert Java-style signed int color to hex string
export const intColorToHex = (color: number): string => {
  // Handle signed int (negative numbers)
  const unsigned = color >>> 0;
  const hex = (unsigned & 0xffffff).toString(16).padStart(6, '0');
  return `#${hex}`;
};

// Convert hex string to Java-style signed int
export const hexToIntColor = (hex: string): number => {
  const cleaned = hex.replace('#', '');
  const value = parseInt(cleaned, 16);
  // Convert to signed 32-bit int like Java
  return value | 0xff000000;
};
