import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Konva from 'konva';
import { RootState } from '../../store/store';
import {
    selectShape,
    setTextInputVisible,
    setTextInputPosition,
    setCurrentTextShape,
  } from '../../store/shapesSlice';
import { createNewShape, updateShapeProperties } from './canvasUtils';
import { ShapeType, ShapeProps } from '../../types';

export const useCanvasEvents = (handleShapeAdd: (shape: ShapeProps) => void, handleShapeUpdate: (shape: ShapeProps) => void) => {
  const dispatch = useDispatch();
  const shapes = useSelector((state: RootState) => state.shapes.shapes);
  const isDrawing = useRef(false);
  const activeTool = useSelector((state: RootState) => state.shapes.activeTool);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnShape = e.target instanceof Konva.Shape;
    const clickedOnStage = e.target instanceof Konva.Stage;
    
    if (clickedOnShape) {
      const shapeId = e.target.id();
      dispatch(selectShape(shapeId));
      dispatch(setTextInputVisible(false));
      return;
    }

    if (clickedOnStage) {
      dispatch(setTextInputVisible(false));
      dispatch(selectShape(null));
    }

    if (!activeTool) return;

    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const newShape = createNewShape(activeTool as ShapeType, pos.x, pos.y);
    handleShapeAdd(newShape);

    if (activeTool === 'text') {
        dispatch(setTextInputVisible(true));
        dispatch(setTextInputPosition({ x: pos.x, y: pos.y }));
        dispatch(setCurrentTextShape(newShape));
    }

  }, [dispatch, activeTool, handleShapeAdd]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || !activeTool) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    const lastShape = shapes[shapes.length - 1];
    if (lastShape) {
      const updatedShape = updateShapeProperties(lastShape, pos.x, pos.y);
      handleShapeUpdate(updatedShape);
    }
  }, [shapes, activeTool, handleShapeUpdate]);

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
    
    const lastShape = shapes[shapes.length - 1];
    dispatch(selectShape(lastShape.id));
    if (lastShape && lastShape.shape_type === 'text') {
        dispatch(setTextInputVisible(true));
        dispatch(setTextInputPosition({ x: lastShape.x, y: lastShape.y }));
        dispatch(setCurrentTextShape(lastShape));
    }
  }, [shapes, dispatch]);

  const handleDoubleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target;
    if (target instanceof Konva.Text) {
      const shape = shapes.find(s => s.id === target.attrs.id);
      if (shape && shape.shape_type === 'text') {
        dispatch(setTextInputVisible(true));
        dispatch(setTextInputPosition({ x: shape.x, y: shape.y }));
        dispatch(setCurrentTextShape(shape));
      }
    }
  }, [shapes, dispatch]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick
  };
};