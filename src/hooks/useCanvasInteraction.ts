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

  const setHoveringPoint = useTessellatorStore((state) => state.setHoveringPoint);
  const setHoveringPixel = useTessellatorStore((state) => state.setHoveringPixel);
  const setDragging = useTessellatorStore((state) => state.setDragging);
  const addPoint = useTessellatorStore((state) => state.addPoint);
  const removePoint = useTessellatorStore((state) => state.removePoint);

  const canvasSize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      canvasSize.current = { width: canvas.width, height: canvas.height };
    };

    updateCanvasSize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const size = canvas.width / zoom;
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
        }
      }
    };

    const handleMouseUp = () => {
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

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [
    canvasRef,
    cell,
    zoom,
    isDragging,
    draggingPoint,
    startingCoords,
    setHoveringPoint,
    setHoveringPixel,
    setDragging,
    addPoint,
    removePoint,
  ]);
};
