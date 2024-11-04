import Konva from 'konva';
import { ShapeProps } from '../types';

export const createKonvaRectangle = (props: ShapeProps): Konva.Rect => {
  return new Konva.Rect({
    x: props.x,
    y: props.y,
    width: props.properties.width || 0,
    height: props.properties.height || 0,
    fill: props.style.fill,
    stroke: props.style.stroke,
    draggable: true,
  });
};

export const updateKonvaShape = (shape: Konva.Shape, props: Partial<ShapeProps>): void => {
  shape.setAttrs(props);
};

export const getShapeClientRect = (shape: Konva.Shape): { x: number; y: number; width: number; height: number } => {
  const clientRect = shape.getClientRect();
  return {
    x: clientRect.x,
    y: clientRect.y,
    width: clientRect.width,
    height: clientRect.height,
  };
};

// Add more utility functions as needed