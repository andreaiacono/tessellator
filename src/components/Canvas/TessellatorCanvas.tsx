import { useEffect } from 'react';
import { useTessellatorStore } from '../../store/useTessellatorStore';
import { useCanvasRenderer } from './useCanvasRenderer';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import styles from './TessellatorCanvas.module.scss';

interface TessellatorCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const TessellatorCanvas = ({ canvasRef }: TessellatorCanvasProps) => {

  const cell = useTessellatorStore((state) => state.cell);
  const zoom = useTessellatorStore((state) => state.zoom);
  const thickness = useTessellatorStore((state) => state.thickness);
  const drawGrid = useTessellatorStore((state) => state.drawGrid);
  const drawColors = useTessellatorStore((state) => state.drawColors);
  const color1 = useTessellatorStore((state) => state.color1);
  const color2 = useTessellatorStore((state) => state.color2);
  const hoveringPoint = useTessellatorStore((state) => state.hoveringPoint);
  const hoveringPixel = useTessellatorStore((state) => state.hoveringPixel);
  const isDrawing = useTessellatorStore((state) => state.isDrawing);
  const currentStroke = useTessellatorStore((state) => state.currentStroke);
  const drawingStartCell = useTessellatorStore((state) => state.drawingStartCell);

  // Use the renderer hook
  useCanvasRenderer(canvasRef, {
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
  });

  // Use the interaction hook
  useCanvasInteraction(canvasRef);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};
