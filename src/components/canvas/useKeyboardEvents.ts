import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export const useKeyboardEvents = (
  handleShapeDelete: (shapeId: string) => Promise<void>
) => {
  const selectedShapeId = useSelector((state: RootState) => state.shapes.selectedShapeId);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
      handleShapeDelete(selectedShapeId);
    }
    // Add more keyboard event handlers here in the future
  }, [selectedShapeId, handleShapeDelete]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};