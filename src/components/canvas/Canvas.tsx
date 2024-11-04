import React, { useRef, useEffect, useCallback } from 'react';
import Konva from 'konva';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { 
  addShape, 
  updateShape, 
  deleteShape, 
  selectShape,
  setTextInputVisible,
  setCurrentTextShape,
  initializeSavedShapes
} from '../../store/shapesSlice';
import { ShapeProps } from '../../types';
import { useCanvasEvents } from './useCanvasEvents';
import { useKeyboardEvents } from './useKeyboardEvents';
import TextInput from './TextInput';
import { useShapeRenderer } from './useShapeRenderer';
import { apiService } from '../../services/api';

const Canvas: React.FC = () => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const shapes = useSelector((state: RootState) => state.shapes.shapes);
  const currentProjectId = useSelector((state: RootState) => state.projects.currentProjectId);
  const textInputVisible = useSelector((state: RootState) => state.shapes.textInputVisible);
  const textInputPosition = useSelector((state: RootState) => state.shapes.textInputPosition);
  const currentTextShape = useSelector((state: RootState) => state.shapes.currentTextShape);
  const activeTool = useSelector((state: RootState) => state.shapes.activeTool);

  // Load shapes when project changes
  useEffect(() => {
    const loadProjectShapes = async () => {
      if (currentProjectId) {
        try {
          const shapes = await apiService.getProjectShapes(currentProjectId);
          // Convert API shapes to frontend format
          const frontendShapes = shapes.map(shape => ({
            id: String(shape.id),
            shape_type: shape.shape_type,
            x: shape.x,
            y: shape.y,
            properties: shape.properties,
            style: shape.style,
            order: shape.order
          }));
          dispatch(initializeSavedShapes(frontendShapes));
        } catch (error) {
          console.error('Failed to load shapes:', error);
        }
      }
    };

    loadProjectShapes();
  }, [currentProjectId, dispatch]);

  // Shape management handlers
  const handleShapeAdd = useCallback((newShape: ShapeProps) => {
    dispatch(addShape(newShape));
  }, [dispatch]);

  const handleShapeUpdate = useCallback((updatedShape: ShapeProps) => {
    dispatch(updateShape(updatedShape));
  }, [dispatch]);

  const handleShapeDelete = useCallback(async (shapeId: string) => {
    dispatch(deleteShape(shapeId));
    dispatch(selectShape(null));
  }, [dispatch]);

  // Event handlers setup
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleDoubleClick } = 
    useCanvasEvents(handleShapeAdd, handleShapeUpdate);
  const renderShapes = useShapeRenderer(layerRef, handleDoubleClick);
  
  // Keyboard events setup
  useKeyboardEvents(handleShapeDelete);

  // Initialize canvas
  useEffect(() => {
    const stage = new Konva.Stage({
      container: 'canvas-container',
      width: window.innerWidth,
      height: window.innerHeight - 60,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    stageRef.current = stage;
    layerRef.current = layer;

    stage.on('mousedown touchstart', handleMouseDown);
    stage.on('mousemove touchmove', handleMouseMove);
    stage.on('mouseup touchend', handleMouseUp);

    const handleResize = () => {
      stage.width(window.innerWidth);
      stage.height(window.innerHeight - 60);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      stage.off('mousedown touchstart');
      stage.off('mousemove touchmove');
      stage.off('mouseup touchend');
      window.removeEventListener('resize', handleResize);
      stage.destroy();
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Render shapes when they change
  useEffect(() => {
    renderShapes();
  }, [renderShapes, shapes, activeTool]);

  // Clean up text input when changing projects
  useEffect(() => {
    dispatch(setTextInputVisible(false));
    dispatch(setCurrentTextShape(null));
  }, [currentProjectId, dispatch]);

  return (
    <div className="relative h-[calc(100vh-60px)] bg-slate-100">
      <div 
        id="canvas-container" 
        className="w-full h-full"
        style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
      />
      {textInputVisible && currentTextShape && (
        <TextInput
          position={textInputPosition}
          shape={currentTextShape}
        />
      )}
    </div>
  );
};

export default Canvas;