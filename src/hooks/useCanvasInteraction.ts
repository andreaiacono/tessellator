import { useEffect, useRef } from 'react';
import { useTessellatorStore } from '../store/useTessellatorStore';
import { createPointFromCoords, updatePointPosition } from '../core/models/Point';
import { findExistingPoint, findNewPointIndex } from '../core/models/Cell';
import { scalePoint } from '../core/models/Point';

export const useCanvasInteraction = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const cell = useTessellatorStore((state) => state.cell);
  const zoom = useTessellatorStore((state) => state.zoom);
  const isDragging = useTessellatorStore((state) => state.isDragging);
  const draggingPoint = useTessellatorStore((state) => state.draggingPoint);
  const startingCoords = useTessellatorStore((state) => state.startingCoords);
  const isDrawing = useTessellatorStore((state) => state.isDrawing);
  const currentStroke = useTessellatorStore((state) => state.currentStroke);
  const drawingStartCell = useTessellatorStore((state) => state.drawingStartCell);

  const setHoveringPoint = useTessellatorStore((state) => state.setHoveringPoint);
  const setHoveringPixel = useTessellatorStore((state) => state.setHoveringPixel);
  const setDragging = useTessellatorStore((state) => state.setDragging);
  const addPoint = useTessellatorStore((state) => state.addPoint);
  const removePoint = useTessellatorStore((state) => state.removePoint);
  const startStroke = useTessellatorStore((state) => state.startStroke);
  const addStrokePoint = useTessellatorStore((state) => state.addStrokePoint);
  const endStroke = useTessellatorStore((state) => state.endStroke);
  const updateZoom = useTessellatorStore((state) => state.updateZoom);

  const canvasSize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      canvasSize.current = { width: canvas.width, height: canvas.height };
    };

    updateCanvasSize();

    // Helper functions for freehand drawing
    const getCellIndices = (x: number, y: number, canvasWidth: number, zoom: number) => {
      const boxWidth = canvasWidth / zoom;
      return {
        cellX: Math.floor(x / boxWidth),
        cellY: Math.floor(y / boxWidth),
      };
    };

    const isInSameCell = (current: { cellX: number; cellY: number }, start: { x: number; y: number }) => {
      return current.cellX === start.x && current.cellY === start.y;
    };

    const shouldCapturePoint = (lastPoint: { x: number; y: number } | null, currentPoint: { x: number; y: number }): boolean => {
      if (!lastPoint) return true;
      const dx = currentPoint.x - lastPoint.x;
      const dy = currentPoint.y - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance >= 0.02; // Minimum 2% of cell size between points
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const size = canvas.width / zoom;

      // Handle freehand drawing
      if (isDrawing && drawingStartCell) {
        const currentCell = getCellIndices(x, y, canvas.width, zoom);

        if (!isInSameCell(currentCell, drawingStartCell)) {
          // Exited cell - end stroke
          endStroke();
          return;
        }

        // Convert to cell-relative coordinates
        const cellRelativeX = x - (drawingStartCell.x * size);
        const cellRelativeY = y - (drawingStartCell.y * size);
        const currentPoint = createPointFromCoords({ x: cellRelativeX, y: cellRelativeY }, size);

        // Still in same cell - capture point if distance threshold met
        const lastPoint = currentStroke && currentStroke.length > 0
          ? currentStroke[currentStroke.length - 1]
          : null;

        if (shouldCapturePoint(lastPoint, currentPoint)) {
          addStrokePoint(currentPoint);
        }
        return;
      }

      const currentPoint = createPointFromCoords({ x, y }, size);

      if (isDragging && draggingPoint && startingCoords) {
        // Calculate new position during drag
        const tempPoint = { ...draggingPoint };
        updatePointPosition(tempPoint, { x, y }, startingCoords, size);

        // Update the store with new position
        const updatePoint = useTessellatorStore.getState().updatePointPosition;
        updatePoint(draggingPoint, tempPoint.x, tempPoint.y);
        return;
      }

      // Check for existing point
      const existingPoint = findExistingPoint(cell, currentPoint);
      if (existingPoint) {
        setHoveringPoint(existingPoint);
        setHoveringPixel(null);
        canvas.style.cursor = 'move';
      } else {
        setHoveringPoint(null);
        // Check if point can be inserted on a line
        const scaledPoint = scalePoint(currentPoint, size, size);
        const insertIndex = findNewPointIndex(cell, scaledPoint, size);
        if (insertIndex !== null) {
          setHoveringPixel(currentPoint);
          canvas.style.cursor = 'pointer';
        } else {
          setHoveringPixel(null);
          canvas.style.cursor = 'default';
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only handle left click

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const size = canvas.width / zoom;
      const currentPoint = createPointFromCoords({ x, y }, size);
      const existingPoint = findExistingPoint(cell, currentPoint);

      if (existingPoint) {
        // Start dragging existing point
        setDragging(true, existingPoint, { x, y });
      } else {
        // Try to add new point
        const scaledPoint = scalePoint(currentPoint, size, size);
        const insertIndex = findNewPointIndex(cell, scaledPoint, size);
        if (insertIndex !== null) {
          currentPoint.isMoving = true;
          addPoint(currentPoint, size);
          setDragging(true, currentPoint, { x, y });
        } else {
          // Start freehand drawing
          const { cellX, cellY } = getCellIndices(x, y, canvas.width, zoom);
          startStroke(cellX, cellY);

          // Convert to cell-relative coordinates
          const cellRelativeX = x - (cellX * size);
          const cellRelativeY = y - (cellY * size);
          const strokePoint = createPointFromCoords({ x: cellRelativeX, y: cellRelativeY }, size);
          addStrokePoint(strokePoint);
        }
      }
    };

    const handleMouseUp = () => {
      if (isDrawing) {
        endStroke();
        return;
      }

      if (isDragging) {
        setDragging(false, null, null);
        if (draggingPoint) {
          draggingPoint.isMoving = false;
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const size = canvas.width / zoom;
      const currentPoint = createPointFromCoords({ x, y }, size);
      const existingPoint = findExistingPoint(cell, currentPoint);

      if (existingPoint) {
        removePoint(existingPoint);
      }
    };

    const handleMouseLeave = () => {
      if (isDrawing) {
        endStroke();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Determine zoom direction: positive deltaY = scroll down = zoom in
      const delta = e.deltaY > 0 ? 1 : -1;
      const newZoom = Math.max(2, Math.min(20, zoom + delta));

      if (newZoom !== zoom) {
        updateZoom(newZoom);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [
    canvasRef,
    cell,
    zoom,
    isDragging,
    draggingPoint,
    startingCoords,
    isDrawing,
    currentStroke,
    drawingStartCell,
    setHoveringPoint,
    setHoveringPixel,
    setDragging,
    addPoint,
    removePoint,
    startStroke,
    addStrokePoint,
    endStroke,
    updateZoom,
  ]);
};
