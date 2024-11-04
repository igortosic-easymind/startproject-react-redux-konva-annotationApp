import Konva from 'konva';
import { Shape } from './Shape';
import { ShapeProps } from '../types';

export class Text extends Shape {
  private rect: Konva.Rect | null = null;
  private text: Konva.Text | null = null;

  constructor(data: Omit<ShapeProps, 'shape_type'>) {
    super({
      ...data,
      shape_type: 'text'
    });
  }

  private createRectangle(): Konva.Rect {
    return new Konva.Rect({
      x: 0,
      y: 0,
      width: this.data.properties.width || 100,
      height: this.data.properties.height || 20,
      fill: 'transparent',
      stroke: this.data.style.stroke || 'black',
      strokeWidth: 1,
    });
  }

  private createText(): Konva.Text {
    return new Konva.Text({
      id: this.id,
      x: 0,
      y: 0,
      text: this.data.properties.text || '',
      fontSize: this.data.properties.fontSize || 16,
      fill: this.data.style.fill || 'black',
      padding: this.data.style.padding || 5,
      width: this.data.properties.width || 100,
      height: this.data.properties.height || 20,
    });
  }

  createKonvaShape(): Konva.Group {
    const group = new Konva.Group({
      x: this.data.x,
      y: this.data.y,
      draggable: true,
    });

    this.rect = this.createRectangle();
    this.text = this.createText();

    group.add(this.rect);
    group.add(this.text);

    return group;
  }

  updateText(newText: string): void {
    if (this.text) {
      this.text.text(newText);
      this.data.properties.text = newText;
      this.adjustRectSize();
    }
  }

  private adjustRectSize(): void {
    if (this.text && this.rect) {
      const textWidth = this.text.width();
      const textHeight = this.text.height();
      this.rect.width(textWidth);
      this.rect.height(textHeight);
    }
  }

  toObject(): ShapeProps {
    return {
      ...this.data,
      shape_type: 'text',
    };
  }
}