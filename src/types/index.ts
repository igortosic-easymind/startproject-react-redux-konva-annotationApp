// Existing Shape Types
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'text';

// Backend shape response type matching ShapeOut schema
export interface ShapeResponse {
  id: number;
  shape_type: ShapeType;
  x: number;
  y: number;
  properties: Record<string, unknown>;
  style: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by_id: number;
  order: number;
  project_id: number;
}

// Existing Shape Props (Frontend representation)
export interface ShapeProps {
  id: string;
  shape_type: ShapeType;
  x: number;
  y: number;
  properties: {
    width?: number;
    height?: number;
    radius?: number;
    endX?: number;
    endY?: number;
    text?: string;
    fontSize?: number;
    points?: number[];
    [key: string]: unknown;
  };
  style: {
    fill?: string | CanvasGradient;
    stroke?: string;
    strokeWidth?: number;
    padding?: number;
    [key: string]: unknown;
  };
  order?: number;
  isNew?: boolean;        // Added for change tracking
  isModified?: boolean;   // Added for change tracking
  isDeleted?: boolean;    // Added for change tracking
}

// Existing Project types
export interface ProjectOut {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
  is_public: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  shapes: ShapeProps[];
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
}

export interface ProjectInput {
  title: string;
  description?: string;
  is_public?: boolean;
}

// Existing API Error type
export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

// New types for shape management
export interface ShapeChanges {
  added: string[];
  updated: string[];
  deleted: string[];
}

export interface ShapeState extends Pick<Project, 'shapes'> {
  savedShapes: ShapeProps[];
  isDirty: boolean;
  selectedShapeId: string | null;
  activeTool: ShapeType | string | null;
  textInputVisible: boolean;
  textInputPosition: { x: number; y: number };
  currentTextShape: ShapeProps | null;
  isLoading: boolean;
  error: string | null;
}

export interface ShapeBatchOperation {
  projectId: number;
  added: Omit<ShapeProps, 'id' | 'isNew' | 'isModified' | 'isDeleted'>[];
  updated: Array<Pick<ShapeProps, 'id'> & Partial<ShapeProps>>;
  deleted: string[];
}

export interface ShapeSaveStatus {
  isSaving: boolean;
  lastSaved: string | null;
  error: string | null;
}