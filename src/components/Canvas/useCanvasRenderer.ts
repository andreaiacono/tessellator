import { useEffect } from 'react';
import type { Cell, Stroke } from '../../core/models/Cell';
import type { Point } from '../../core/models/Point';
import { scalePoint } from '../../core/models/Point';
import { setNewSize } from '../../core/models/Cell';
import { floodFill } from '../../core/algorithms/floodFill';

interface RendererOptions {
  cell: Cell;
  zoom: number;
  thickness: number;
  drawGrid: boolean;
  drawColors: boolean;
  color1: string;
  color2: string;
  hoveringPoint: Point | null;
  hoveringPixel: Point | null;
  isDrawing: boolean;
  currentStroke: Point[] | null;
  drawingStartCell: { x: number; y: number } | null;
}

export const useCanvasRenderer = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: RendererOptions
) => {
  const {
    cell,
    zoom,
    thickness,
    drawGrid,
    drawColors,
    color1,
    color2,
    hoveringPoint,
    hoveringPixel,
    isDrawing,
    currentStroke,
    drawingStartCell,
  } = options;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with background color
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, width, height);

    const boxWidth = width / zoom;
    setNewSize(cell, boxWidth);

    // Draw grid
    if (drawGrid) {
      ctx.strokeStyle = '#d3d3d3'; // LIGHT_GRAY
      ctx.lineWidth = 1;
      for (let x = 0; x <= zoom; x++) {
        for (let y = 0; y <= zoom; y++) {
          ctx.strokeRect(x * boxWidth, y * boxWidth, boxWidth, boxWidth);
        }
      }
    }

    // Draw freehand strokes in each cell
    for (let x = 0; x <= zoom; x++) {
      for (let y = 0; y <= zoom; y++) {
        drawStrokes(ctx, cell, boxWidth, x * boxWidth, (y + 1) * boxWidth);
      }
    }

    // Draw current stroke preview (semi-transparent)
    if (currentStroke && currentStroke.length > 1 && drawingStartCell) {
      const previewStroke: Stroke = {
        points: currentStroke,
        thickness: thickness,
        color: color2,
      };

      // Draw preview in starting cell with transparency
      ctx.globalAlpha = 0.6;
      const { x: cellX, y: cellY } = drawingStartCell;
      drawStroke(ctx, previewStroke, boxWidth, cellX * boxWidth, (cellY + 1) * boxWidth);
      ctx.globalAlpha = 1.0;
    }

    // Draw lines for each cell in the tessellation
    for (let x = 0; x <= zoom; x++) {
      for (let y = 0; y <= zoom; y++) {
        drawCell(ctx, cell, boxWidth, x * boxWidth, y * boxWidth, thickness,
                 drawColors ? null : hoveringPoint,
                 drawColors ? null : hoveringPixel);
      }
    }

    // Color the shapes with flood fill
    if (drawColors) {
      // Get imageData AFTER lines are drawn so flood fill can see boundaries
      const imageData = ctx.getImageData(0, 0, width, height);
      for (let x = 0; x <= zoom; x++) {
        for (let y = 0; y <= zoom; y++) {
          // Checkerboard pattern
          if ((x % 2 === 0 && y % 2 === 0) || (x % 2 === 1 && y % 2 === 1)) {
            const startX = Math.floor(x * boxWidth + boxWidth / 2);
            const startY = Math.floor(y * boxWidth + boxWidth / 2);
            const maxPixels = boxWidth * boxWidth * 2;
            floodFill(ctx, imageData, { x: startX, y: startY }, color2, color1, maxPixels);
          }
        }
      }

      // Draw hover indicators on top after coloring
      if (hoveringPoint || hoveringPixel) {
        for (let x = 0; x <= zoom; x++) {
          for (let y = 0; y <= zoom; y++) {
            drawHoverIndicators(ctx, boxWidth, x * boxWidth, y * boxWidth, hoveringPoint, hoveringPixel);
          }
        }
      }
    }
  }, [
    cell,
    zoom,
    thickness,
    drawGrid,
    drawColors,
    color1,
    color2,
    hoveringPoint,
    hoveringPixel,
    isDrawing,
    currentStroke,
    drawingStartCell,
    canvasRef,
  ]);
};

const drawCell = (
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  width: number,
  left: number,
  top: number,
  thickness: number,
  hoveringPoint: Point | null,
  hoveringPixel: Point | null
) => {
  // Draw the cell lines
  ctx.strokeStyle = '#000000'; // BLACK
  ctx.lineWidth = thickness;

  const scaledPoints = cell.points.map((p) => scalePoint(p, width, width));

  for (let i = 1; i < scaledPoints.length; i++) {
    const previous = scaledPoints[i - 1];
    const current = scaledPoints[i];

    ctx.beginPath();
    ctx.moveTo(left + previous.x, top - previous.y);
    ctx.lineTo(left + current.x, top - current.y);
    ctx.stroke();
  }

  // Draw hover indicators if provided
  if (hoveringPoint || hoveringPixel) {
    drawHoverIndicators(ctx, width, left, top, hoveringPoint, hoveringPixel);
  }
};

const drawHoverIndicators = (
  ctx: CanvasRenderingContext2D,
  width: number,
  left: number,
  top: number,
  hoveringPoint: Point | null,
  hoveringPixel: Point | null
) => {
  // Draw hovering point indicator (green circle)
  if (hoveringPoint) {
    const scaledPoint = scalePoint(hoveringPoint, width, width);
    ctx.strokeStyle = '#00ff00'; // GREEN
    ctx.lineWidth = 2;
    const circleSize = Math.min(width / 5, 20);
    const radius = circleSize / 2;

    ctx.beginPath();
    ctx.arc(left + scaledPoint.x, top - scaledPoint.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (hoveringPixel) {
    // Draw hovering pixel indicator (red circle and dot)
    const scaledPoint = scalePoint(hoveringPixel, width, width);
    ctx.fillStyle = '#ff0000'; // RED
    const rectSize = 5;
    ctx.fillRect(left + scaledPoint.x - 2, top - scaledPoint.y - 2, rectSize, rectSize);

    ctx.strokeStyle = '#ff0000';
    const circleSize = Math.min(width / 10, 20);
    const radius = circleSize / 2;

    ctx.beginPath();
    ctx.arc(left + scaledPoint.x, top - scaledPoint.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
};

const drawStroke = (
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  width: number,
  left: number,
  top: number
) => {
  if (stroke.points.length < 2) return;

  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  const firstPoint = scalePoint(stroke.points[0], width, width);
  ctx.moveTo(left + firstPoint.x, top - firstPoint.y);

  for (let i = 1; i < stroke.points.length; i++) {
    const point = scalePoint(stroke.points[i], width, width);
    ctx.lineTo(left + point.x, top - point.y);
  }

  ctx.stroke();
};

const drawStrokes = (
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  width: number,
  left: number,
  top: number
) => {
  if (!cell.strokes || cell.strokes.length === 0) return;

  cell.strokes.forEach(stroke => {
    drawStroke(ctx, stroke, width, left, top);
  });
};
