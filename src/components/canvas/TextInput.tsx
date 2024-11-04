import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateShape, setTextInputVisible, setCurrentTextShape } from '../../store/shapesSlice';
import { ShapeProps } from '../../types';

interface TextInputProps {
  position: { x: number; y: number };
  shape: ShapeProps | null;
}

const TextInput: React.FC<TextInputProps> = ({ position, shape }) => {
    const dispatch = useDispatch();
    const [text, setText] = useState(shape?.properties.text || '');
  
    useEffect(() => {
      setText(shape?.properties.text || '');
    }, [shape]);
  
    const handleTextInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);
      if (shape) {
        const updatedShape: ShapeProps = {
          ...shape,
          properties: {
            ...shape.properties,
            text: newText,
          },
        };
        dispatch(updateShape(updatedShape));
      }
    }, [shape, dispatch]);
  
    const handleTextInputBlur = useCallback(() => {
      dispatch(setTextInputVisible(false));
      dispatch(setCurrentTextShape(null));
    }, [dispatch]);

  if (!shape) return null;

  return (
    <textarea
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${shape.properties.width}px`,
        height: `${shape.properties.height}px`,
        border: 'none',
        padding: '5px',
        resize: 'none',
        fontSize: `${shape.properties.fontSize || 16}px`,
      }}
      value={text}
      onChange={handleTextInput}
      onBlur={handleTextInputBlur}
      autoFocus
    />
  );
};

export default TextInput;