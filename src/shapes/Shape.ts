import Konva from 'konva';
import { ShapeProps, ShapeType } from '../types';

export abstract class Shape {
  protected konvaShape: Konva.Shape | Konva.Group;
  protected data: ShapeProps;

  constructor(data: ShapeProps) {
    this.data = data;
    this.konvaShape = this.createKonvaShape();
  }

  abstract createKonvaShape(): Konva.Shape | Konva.Group;

  public getKonvaShape(): Konva.Shape | Konva.Group {
    return this.konvaShape;
  }

  public update(newData: Partial<ShapeProps>): void {
    Object.assign(this.data, newData);
    this.konvaShape.setAttrs(newData);
  }

  public toObject(): ShapeProps {
    return { ...this.data };
  }

  get id(): string {
    return this.data.id;
  }

  get x(): number {
    return this.data.x;
  }

  get y(): number {
    return this.data.y;
  }

  get width(): number {
    return this.data.properties.width || 0;
  }

  get height(): number {
    return this.data.properties.height || 0;
  }

  get fill(): string | CanvasGradient {
    return this.data.style.fill || '';
  }

  get stroke(): string {
    return this.data.style.stroke || '';
  }

  get shapeType(): ShapeType {
    return this.data.shape_type;
  }
}
