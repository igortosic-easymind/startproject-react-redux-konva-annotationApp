import Konva from 'konva';
import { Shape } from './Shape';
import {  ShapeProps } from '../types';

export class Circle extends Shape {
  constructor(data: Omit<ShapeProps, 'shape_type'>) {
    super({
      ...data,
      shape_type: 'circle'
    });
  }

  createKonvaShape(): Konva.Shape {
    return new Konva.Circle({
      x: this.data.x,
      y: this.data.y,
      radius: Math.max(0, this.data.properties.radius || 0),
      fill: this.data.style.fill,
      stroke: this.data.style.stroke,
      draggable: true,
    });
  }

  toObject(): ShapeProps {
    return {
      ...this.data,
      shape_type: 'circle',
    };
  }
}