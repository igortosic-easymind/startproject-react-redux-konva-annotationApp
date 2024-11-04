import Konva from 'konva';
import { Shape } from './Shape';
import { ShapeProps } from '../types';

export class Line extends Shape {
  constructor(data: Omit<ShapeProps, 'shape_type'>) {
    super({
      ...data,
      shape_type: 'line'
    });
  }

  createKonvaShape(): Konva.Line {
    return new Konva.Line({
      points: this.data.properties.points || [
        0, 0, 
        this.data.properties.endX || 0, 
        this.data.properties.endY || 0
      ],
      x: this.data.x,
      y: this.data.y,
      stroke: this.data.style.stroke,
      strokeWidth: this.data.style.strokeWidth || 2,
      draggable: true,
    });
  }

  toObject(): ShapeProps {
    return {
      ...this.data,
      shape_type: 'line',
    };
  }
}