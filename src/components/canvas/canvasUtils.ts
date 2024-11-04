import { ShapeProps, ShapeType } from '../../types';

// Function to create a new shape
export const createNewShape = (type: ShapeType, x: number, y: number): ShapeProps => {
    const baseShape: ShapeProps = {
      id: Date.now().toString(), // We'll set this after creating the Konva shape
      shape_type: type,
      x,
      y,
      properties: {},
      style: {
        fill: type === 'text' ? 'black' : 'transparent',
        stroke: 'black',
      },
    };
  
    switch (type) {
      case 'rectangle':
        return {
          ...baseShape,
          properties: { width: 0, height: 0 },
        };
      case 'circle':
        return {
          ...baseShape,
          properties: { radius: 0 },
        };
      case 'line':
        return {
          ...baseShape,
          properties: { points: [0, 0] },
        };
      case 'text':
        return {
          ...baseShape,
          properties: { text: '', fontSize: 16 },
        };
      default:
        throw new Error(`Unsupported shape type: ${type}`);
    }
  };

export const updateShapeProperties = (shape: ShapeProps, currentX: number, currentY: number): ShapeProps => {
  let updatedProperties;

  if (shape.shape_type === 'circle') {
    const dx = currentX - shape.x;
    const dy = currentY - shape.y;
    const radius = Math.sqrt(dx * dx + dy * dy);
    updatedProperties = {
      ...shape.properties,
      radius: Math.max(0, radius),
    };
  } else if (shape.shape_type === 'line') {
    updatedProperties = {
      ...shape.properties,
      points: [0, 0, currentX - shape.x, currentY - shape.y],
    };
  } else {
    updatedProperties = {
      ...shape.properties,
      width: Math.abs(currentX - shape.x),
      height: Math.abs(currentY - shape.y),
    };
  }

  return {
    ...shape,
    properties: updatedProperties,
  };
};