import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Konva from 'konva';
import { RootState } from '../../store/store';
import { updateShape, selectShape } from '../../store/shapesSlice';
import { ShapeProps } from '../../types';
import { shapeClassMap } from '../../shapes';

export const useShapeRenderer = (layerRef: React.RefObject<Konva.Layer>, handleDoubleClick: (e: Konva.KonvaEventObject<MouseEvent>) => void) => {
  const dispatch = useDispatch();
  const shapes = useSelector((state: RootState) => state.shapes.shapes);

  const renderShapes = useCallback(() => {
    if (layerRef.current) {
      layerRef.current.destroyChildren();
      shapes.forEach(shapeData => {
        const ShapeClass = shapeClassMap[shapeData.shape_type];
        if (!ShapeClass) {
          console.error(`Unsupported shape type: ${shapeData.shape_type}`);
          return;
        }

        const shape = new ShapeClass(shapeData);
        const konvaShape = shape.createKonvaShape();

        konvaShape.on('transform dragend', () => {
          let updatedShape: ShapeProps;
          if (shapeData.shape_type === 'line') {
            const line = konvaShape as Konva.Line;
            const points = line.points();
            updatedShape = {
              ...shapeData,
              x: line.x(),
              y: line.y(),
              properties: {
                ...shapeData.properties,
                points: points,
              },
              style: {
                ...shapeData.style,
                strokeWidth: shapeData.style.strokeWidth || 2,
              }
            };
          } else if (shapeData.shape_type === 'text') {
            const group = konvaShape as Konva.Group;
            const text = group.findOne('Text') as Konva.Text;
            const rect = group.findOne('Rect') as Konva.Rect;
            updatedShape = {
              ...shapeData,
              x: group.x(),
              y: group.y(),
              properties: {
                ...shapeData.properties,
                width: rect.width(),
                height: rect.height(),
                text: text.text(),
                fontSize: text.fontSize(),
              },
              style: {
                ...shapeData.style,
                fill: text.fill(),
                padding: text.padding(),
              }
            };
          } else {
            const shape = konvaShape as Konva.Shape;
            updatedShape = {
              ...shapeData,
              x: shape.x(),
              y: shape.y(),
              properties: {
                ...shapeData.properties,
                width: shape.width() * shape.scaleX(),
                height: shape.height() * shape.scaleY(),
              }
            };
          }
          dispatch(updateShape(updatedShape));
        });

        konvaShape.on('click tap', () => {
          dispatch(selectShape(shapeData.id));
        });

        if (shapeData.shape_type === 'text') {
          konvaShape.on('dblclick', handleDoubleClick);
        }

        layerRef.current!.add(konvaShape);
      });
      layerRef.current.batchDraw();
    }
  }, [shapes, dispatch, handleDoubleClick,layerRef]);

  return renderShapes;
};