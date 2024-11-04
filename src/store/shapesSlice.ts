import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ShapeProps, ShapeState, ShapeType, ShapeResponse } from '../types';
import { apiService } from '../services/api';

// Helper function to compare shapes for equality
const areShapesEqual = (shape1: ShapeProps, shape2: ShapeProps): boolean => {
  // Compare essential properties
  return shape1.x === shape2.x &&
    shape1.y === shape2.y &&
    shape1.shape_type === shape2.shape_type &&
    JSON.stringify(shape1.properties) === JSON.stringify(shape2.properties) &&
    JSON.stringify(shape1.style) === JSON.stringify(shape2.style);
};

// Helper to check if shapes array has unsaved changes
const hasUnsavedChanges = (currentShapes: ShapeProps[], savedShapes: ShapeProps[]): boolean => {
  if (currentShapes.length !== savedShapes.length) return true;
  
  return currentShapes.some((shape, index) => !areShapesEqual(shape, savedShapes[index]));
};

const initialState: ShapeState = {
  shapes: [],
  savedShapes: [], // Reference point for tracking changes
  isDirty: false,
  selectedShapeId: null,
  activeTool: null,
  textInputVisible: false,
  textInputPosition: { x: 0, y: 0 },
  currentTextShape: null,
  isLoading: false,
  error: null,
};

// Async thunk for saving shapes
export const saveShapes = createAsyncThunk(
  'shapes/saveShapes',
  async (projectId: string, { getState, rejectWithValue }) => {
    const state = getState() as { shapes: ShapeState };
    const { shapes, savedShapes } = state.shapes;
    
    try {
      // Determine which shapes are new, modified, or deleted
      const added = shapes.filter(shape => !savedShapes.find(s => s.id === shape.id));
      const deleted = savedShapes.filter(shape => !shapes.find(s => s.id === shape.id)).map(s => s.id);
      const updated = shapes.filter(shape => {
        const savedShape = savedShapes.find(s => s.id === shape.id);
        return savedShape && !areShapesEqual(shape, savedShape);
      });

      // If no changes, return early
      if (!added.length && !updated.length && !deleted.length) {
        return { shapes, savedShapes: shapes };
      }

      // Prepare batch operation payload
      const batchOperation = {
        projectId: Number(projectId),
        added: added.map(shape => ({
          shape_type: shape.shape_type,
          x: shape.x,
          y: shape.y,
          properties: shape.properties,
          style: shape.style
        })), // Only include necessary properties for new shapes
        updated,
        deleted
      };

      const response = await apiService.saveShapes(batchOperation);
      
      // Create a map of existing shapes for quick lookup
      const existingShapesMap = new Map(
        shapes
          .filter(s => !deleted.includes(s.id))
          .filter(s => !added.map(a => a.id).includes(s.id))
          .map(s => [s.id, s])
      );

      // Process added shapes
      const addedShapes = response.added.map(convertApiShapeToProps);

      // Process updated shapes and merge with existing
      response.updated.forEach(updatedShape => {
        const convertedShape = convertApiShapeToProps(updatedShape);
        existingShapesMap.set(convertedShape.id, convertedShape);
      });

      // Combine all shapes maintaining order
      const processedShapes = [
        ...Array.from(existingShapesMap.values()),
        ...addedShapes
      ].sort((a, b) => (a.order || 0) - (b.order || 0));

      return {
        shapes: processedShapes,
        savedShapes: processedShapes
      };
      } catch (error) {
      return rejectWithValue((error as Error).message);
      }
    }
);

// Helper to convert API shape response to frontend props
const convertApiShapeToProps = (shape: ShapeResponse): ShapeProps => ({
  id: String(shape.id),
  shape_type: shape.shape_type,
  x: shape.x,
  y: shape.y,
  properties: shape.properties,
  style: shape.style,
  order: shape.order
});

const shapesSlice = createSlice({
  name: 'shapes',
  initialState,
  reducers: {
    addShape: (state, action: PayloadAction<ShapeProps>) => {
      state.shapes.push(action.payload);
      state.isDirty = hasUnsavedChanges(state.shapes, state.savedShapes);
    },
    updateShape: (state, action: PayloadAction<ShapeProps>) => {
      const index = state.shapes.findIndex(shape => shape.id === action.payload.id);
      if (index !== -1) {
        state.shapes[index] = action.payload;
        state.isDirty = hasUnsavedChanges(state.shapes, state.savedShapes);
      }
    },
    deleteShape: (state, action: PayloadAction<string>) => {
      state.shapes = state.shapes.filter(shape => shape.id !== action.payload);
      state.isDirty = hasUnsavedChanges(state.shapes, state.savedShapes);
    },
    selectShape: (state, action: PayloadAction<string | null>) => {
      state.selectedShapeId = action.payload;
      // No need to set isDirty as this doesn't modify shapes
    },
    setActiveTool: (state, action: PayloadAction<ShapeType | string | null>) => {
      state.activeTool = action.payload;
      // No need to set isDirty as this doesn't modify shapes
    },
    setTextInputVisible: (state, action: PayloadAction<boolean>) => {
      state.textInputVisible = action.payload;
      // No need to set isDirty as this doesn't modify shapes
    },
    setTextInputPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.textInputPosition = action.payload;
      // No need to set isDirty as this doesn't modify shapes
    },
    setCurrentTextShape: (state, action: PayloadAction<ShapeProps | null>) => {
      state.currentTextShape = action.payload;
      // No need to set isDirty as this doesn't modify shapes
    },
    markAsClean: (state) => {
      state.isDirty = false;
      state.savedShapes = [...state.shapes];
    },
    initializeSavedShapes: (state, action: PayloadAction<ShapeProps[]>) => {
      state.shapes = action.payload;
      state.savedShapes = action.payload;
      state.isDirty = false;
    },
    reorderShapes: (state, action: PayloadAction<{ sourceIndex: number; targetIndex: number }>) => {
      const { sourceIndex, targetIndex } = action.payload;
      const [removed] = state.shapes.splice(sourceIndex, 1);
      state.shapes.splice(targetIndex, 0, removed);
      state.isDirty = hasUnsavedChanges(state.shapes, state.savedShapes);
    },
    clearShapes: (state) => {
      state.shapes = [];
      state.savedShapes = [];
      state.isDirty = false;
      state.selectedShapeId = null;
      state.textInputVisible = false;
      state.currentTextShape = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveShapes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveShapes.fulfilled, (state, action) => {
        state.shapes = action.payload.shapes;
        state.savedShapes = action.payload.savedShapes;
        state.isDirty = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(saveShapes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  addShape,
  updateShape,
  deleteShape,
  selectShape,
  setActiveTool,
  setTextInputVisible,
  setTextInputPosition,
  setCurrentTextShape,
  markAsClean,
  initializeSavedShapes,
  reorderShapes,
  clearShapes
} = shapesSlice.actions;

// Selectors
export const selectShapes = (state: { shapes: ShapeState }) => state.shapes.shapes;
export const selectIsDirty = (state: { shapes: ShapeState }) => state.shapes.isDirty;
export const selectIsLoading = (state: { shapes: ShapeState }) => state.shapes.isLoading;
export const selectError = (state: { shapes: ShapeState }) => state.shapes.error;
export const selectSelectedShape = (state: { shapes: ShapeState }) => 
  state.shapes.shapes.find(shape => shape.id === state.shapes.selectedShapeId);

export default shapesSlice.reducer;