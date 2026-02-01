import { create } from 'zustand';
import type { Cell } from '../core/models/Cell';
import type { Point } from '../core/models/Point';
import { createCell, findExistingPoint, addHorizontalPoint, deletePoint } from '../core/models/Cell';
import type { FileData } from '../core/models/FileData';
import { intColorToHex } from '../core/utils/colorUtils';

interface TessellatorState {
  // Core data
  cell: Cell;

  // View settings
  zoom: number;
  thickness: number;
  drawGrid: boolean;
  drawColors: boolean;
  color1: string;
  color2: string;

  // Interaction state
  hoveringPoint: Point | null;
  hoveringPixel: Point | null;
  isDragging: boolean;
  draggingPoint: Point | null;
  startingCoords: { x: number; y: number } | null;

  // Actions
  setCell: (cell: Cell) => void;
  updateZoom: (zoom: number) => void;
  updateThickness: (thickness: number) => void;
  toggleGrid: () => void;
  toggleColors: () => void;
  setColor1: (color: string) => void;
  setColor2: (color: string) => void;
  setHoveringPoint: (point: Point | null) => void;
  setHoveringPixel: (point: Point | null) => void;
  setDragging: (dragging: boolean, point: Point | null, coords: { x: number; y: number } | null) => void;
  addPoint: (point: Point, size: number) => void;
  removePoint: (point: Point) => void;
  updatePointPosition: (point: Point, x: number, y: number) => void;
  resetCanvas: () => void;
  loadFromFile: (data: FileData) => void;
}

export const useTessellatorStore = create<TessellatorState>((set, get) => ({
  // Initial state
  cell: createCell(),
  zoom: 10,
  thickness: 1,
  drawGrid: true,
  drawColors: true,
  color1: '#ffffff',
  color2: '#000000',
  hoveringPoint: null,
  hoveringPixel: null,
  isDragging: false,
  draggingPoint: null,
  startingCoords: null,

  // Actions
  setCell: (cell) => set({ cell }),

  updateZoom: (zoom) => set({ zoom }),

  updateThickness: (thickness) => set({ thickness }),

  toggleGrid: () => set((state) => ({ drawGrid: !state.drawGrid })),

  toggleColors: () => set((state) => ({ drawColors: !state.drawColors })),

  setColor1: (color) => set({ color1: color }),

  setColor2: (color) => set({ color2: color }),

  setHoveringPoint: (point) => set({ hoveringPoint: point }),

  setHoveringPixel: (point) => set({ hoveringPixel: point }),

  setDragging: (dragging, point, coords) =>
    set({ isDragging: dragging, draggingPoint: point, startingCoords: coords }),

  addPoint: (point, size) => {
    const state = get();
    const newCell = { ...state.cell, points: [...state.cell.points] };
    addHorizontalPoint(newCell, point, size);
    set({ cell: newCell });
  },

  removePoint: (point) => {
    const state = get();
    const newCell = { ...state.cell, points: [...state.cell.points] };
    deletePoint(newCell, point);
    set({ cell: newCell });
  },

  updatePointPosition: (point, x, y) => {
    const state = get();
    const newCell = { ...state.cell, points: [...state.cell.points] };
    const targetPoint = findExistingPoint(newCell, point);
    if (targetPoint) {
      targetPoint.x = x;
      targetPoint.y = y;
    }
    set({ cell: newCell });
  },

  resetCanvas: () => {
    set({
      cell: createCell(),
      zoom: 10,
      thickness: 1,
      drawGrid: true,
      drawColors: true,
      color1: '#ffffff',
      color2: '#000000',
      hoveringPoint: null,
      hoveringPixel: null,
      isDragging: false,
      draggingPoint: null,
      startingCoords: null,
    });
  },

  loadFromFile: (data) => {
    set({
      cell: data.cell,
      zoom: data.zoom,
      thickness: data.lineThickness || 1,
      drawGrid: data.drawGrid,
      drawColors: data.drawColor,
      color1: data.color1 !== undefined ? intColorToHex(data.color1) : '#ffffff',
      color2: data.color2 !== undefined ? intColorToHex(data.color2) : '#000000',
    });
  },
}));
