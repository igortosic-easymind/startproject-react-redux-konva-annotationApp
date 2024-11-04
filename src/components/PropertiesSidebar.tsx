import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { updateShape } from '../store/shapesSlice';
import { ShapeProps } from '../types';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PropertiesSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const selectedShapeId = useSelector((state: RootState) => state.shapes.selectedShapeId);
  const shapes = useSelector((state: RootState) => state.shapes.shapes);
  const selectedShape = shapes.find(shape => shape.id === selectedShapeId);

  const [fillColor, setFillColor] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [isTransparent, setIsTransparent] = useState(false);

  useEffect(() => {
    if (selectedShape) {
      const isTransparentFill = selectedShape.style.fill === 'transparent' || selectedShape.style.fill === '#00000000';
      setIsTransparent(isTransparentFill);
      setFillColor(isTransparentFill ? '#00000000' : selectedShape.style.fill as string);
      setStrokeColor(selectedShape.style.stroke || '#000000');
      setStrokeWidth(selectedShape.style.strokeWidth || 1);
    }
  }, [selectedShape]);

  const handlePropertyChange = (property: string, value: string | number) => {
    if (selectedShape) {
      let updatedShape: ShapeProps;
      if (property === 'fill' || property === 'stroke' || property === 'strokeWidth') {
        let newValue: string | number;
        if (property === 'fill') {
          newValue = value === '#00000000' ? 'transparent' : value as string;
          setIsTransparent(value === '#00000000');
          setFillColor(value as string);
        } else if (property === 'stroke') {
          newValue = value as string;
          setStrokeColor(value as string);
        } else {
          newValue = Number(value);
          setStrokeWidth(newValue);
        }
        updatedShape = {
          ...selectedShape,
          style: {
            ...selectedShape.style,
            [property]: newValue,
          },
        };
      } else {
        updatedShape = {
          ...selectedShape,
          properties: {
            ...selectedShape.properties,
            [property]: value,
          },
        };
      }
      dispatch(updateShape(updatedShape));
    }
  };

  const renderProperties = () => {
    if (!selectedShape) return null;

    switch (selectedShape.shape_type) {
      case 'rectangle':
      case 'circle':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={selectedShape.properties.width || 0}
                onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={selectedShape.properties.height || 0}
                onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="fill">
                Fill Color: {isTransparent ? 'Transparent' : fillColor}
              </Label>
              <Input
                id="fill"
                type="color"
                value={fillColor}
                onChange={(e) => handlePropertyChange('fill', e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="stroke">
                Stroke Color: {strokeColor}
              </Label>
              <Input
                id="stroke"
                type="color"
                value={strokeColor}
                onChange={(e) => handlePropertyChange('stroke', e.target.value)}
              />
            </div>
          </>
        );
      case 'line':
        return (
          <div className="mb-4">
              <Label htmlFor="strokeWidth">Stroke Width</Label>
              <Input
                id="strokeWidth"
                type="number"
                value={strokeWidth}
                onChange={(e) => handlePropertyChange('strokeWidth', Number(e.target.value))}
              />
            </div>
        );
      case 'text':
        return (
          <>
            <div className="mb-4">
              <Label htmlFor="text">Text</Label>
              <Input
                id="text"
                type="text"
                value={selectedShape.properties.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={selectedShape.properties.fontSize || 16}
                onChange={(e) => handlePropertyChange('fontSize', Number(e.target.value))}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed right-4 top-[60px] w-64 h-auto py-4 px-4 bg-white border border-gray-300 rounded-md shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      {selectedShape ? (
        renderProperties()
      ) : (
        <p>Select a shape to edit its properties</p>
      )}
      {selectedShape && (
        <Button
          className="w-full"
          onClick={() => dispatch(updateShape(selectedShape))}
        >
          Apply Changes
        </Button>
      )}
    </div>
  );
};

export default PropertiesSidebar;