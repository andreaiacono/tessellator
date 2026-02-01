import type { ScaledPoint } from '../models/Point';

const NEIGHBOR_OFFSETS = [
  { x: 0, y: -1 },  // UP
  { x: 0, y: 1 },   // DOWN
  { x: -1, y: 0 },  // LEFT
  { x: 1, y: 0 },   // RIGHT
];

export const floodFill = (
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  startPoint: ScaledPoint,
  fillColor: string,
  backgroundColor: string,
  maxPixels: number
): void => {
  const queue: ScaledPoint[] = [startPoint];
  const visited = new Set<string>();

  const pointKey = (p: ScaledPoint) => `${p.x},${p.y}`;
  visited.add(pointKey(startPoint));

  const getRGB = (x: number, y: number): { r: number; g: number; b: number } => {
    const index = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
    };
  };

  const colorMatches = (x: number, y: number, targetColor: string): boolean => {
    const rgb = getRGB(x, y);

    // Parse hex colors
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const target = hexToRgb(targetColor);
    if (!target) return false;

    return rgb.r === target.r && rgb.g === target.g && rgb.b === target.b;
  };

  ctx.fillStyle = fillColor;

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Draw pixel
    ctx.fillRect(current.x, current.y, 1, 1);

    if (visited.size > maxPixels) {
      return;
    }

    for (const neighbor of Object.values(NEIGHBOR_OFFSETS)) {
      const nextPoint: ScaledPoint = {
        x: current.x + neighbor.x,
        y: current.y + neighbor.y,
      };

      const key = pointKey(nextPoint);
      if (
        !visited.has(key) &&
        nextPoint.y >= 0 &&
        nextPoint.y < imageData.height &&
        nextPoint.x >= 0 &&
        nextPoint.x < imageData.width
      ) {
        // Check if pixel is fillable (background or grid color)
        if (
          colorMatches(nextPoint.x, nextPoint.y, backgroundColor) ||
          colorMatches(nextPoint.x, nextPoint.y, '#d3d3d3') // LIGHT_GRAY
        ) {
          visited.add(key);
          queue.push(nextPoint);
        }
      }
    }
  }
};
