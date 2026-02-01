import { saveAs } from 'file-saver';
import type { FileData } from '../models/FileData';
import { hexToIntColor } from './colorUtils';

export const saveFile = (
  cell: any,
  zoom: number,
  thickness: number,
  drawGrid: boolean,
  drawColors: boolean,
  color1: string,
  color2: string
): void => {
  const fileData: FileData = {
    cell,
    zoom,
    lineThickness: thickness,
    drawGrid,
    drawColor: drawColors,
    color1: hexToIntColor(color1),
    color2: hexToIntColor(color2),
  };

  const json = JSON.stringify(fileData);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, 'tessellator.tile');
};

export const loadFile = (file: File): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data: FileData = JSON.parse(json);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid file format'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

export const exportPNG = (canvas: HTMLCanvasElement): void => {
  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, 'tessellator.png');
    }
  });
};
