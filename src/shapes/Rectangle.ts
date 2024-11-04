import Konva from 'konva';
import { Shape } from './Shape';
import {  ShapeProps } from '../types';

export class Rectangle extends Shape {
  constructor(data: Omit<ShapeProps, 'shape_type'>) {
    super({
      ...data,
      shape_type: 'rectangle'
    });
  }

  createKonvaShape(): Konva.Shape {
    return new Konva.Rect({
      x: this.data.x,
      y: this.data.y,
      width: this.data.properties.width || 0,
      height: this.data.properties.height || 0,
      fill: this.data.style.fill,
      stroke: this.data.style.stroke,
      draggable: true,
    });
  }

  toObject(): ShapeProps {
    return {
      ...this.data,
      shape_type: 'rectangle',
    };
  }
}