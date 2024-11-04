import { Rectangle } from './Rectangle';
import { Circle } from './Circle';
import { Line } from './Line';
import { Text } from './Text';

export {
    Rectangle,
    Circle,
    Line,
    Text
};

export type ShapeClass = typeof Rectangle | typeof Circle | typeof Line | typeof Text; // Update this line

export const shapeClassMap: Record<string, ShapeClass> = {
    'rectangle': Rectangle,
    'circle': Circle,
    'line': Line,
    'text': Text
};