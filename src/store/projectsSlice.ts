import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectInput, ApiError } from '../types';
import { apiService } from '../services/api';
import { clearShapes } from './shapesSlice'; // Add this import
import { AppDispatch } from './store';

interface ProjectsState {
  projects: Project[];
  currentProjectId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProjectId: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>('projects/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    return await apiService.getProjects();
  } catch (err) {
    const error = err as ApiError;
    return rejectWithValue(error.message || 'Failed to fetch projects');
  }
});

export const createProject = createAsyncThunk<
  Project,
  ProjectInput,
  { rejectValue: string }
>('projects/createProject', async (projectData, { rejectWithValue }) => {
  try {
    return await apiService.createProject(projectData.title, projectData.description);
  } catch (err) {
    const error = err as ApiError;
    return rejectWithValue(error.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk<
  Project,
  { projectId: string; data: Partial<ProjectInput> },
  { rejectValue: string }
>('projects/updateProject', async ({ projectId, data }, { rejectWithValue }) => {
  try {
    return await apiService.updateProject(projectId, data);
  } catch (err) {
    const error = err as ApiError;
    return rejectWithValue(error.message || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk<
  string,
  string,
  { 
    rejectValue: string,
    dispatch: AppDispatch,
    state: { projects: ProjectsState }
  }
>('projects/deleteProject', async (projectId, { rejectWithValue, dispatch, getState }) => {
  try {
    await apiService.deleteProject(projectId);
    const { projects } = getState();
    if (projects.projects.length <= 1) {
      // If this is the last project being deleted, clear the shapes
      dispatch(clearShapes());
    }
    return projectId;
  } catch (err) {
    const error = err as ApiError;
    return rejectWithValue(error.message || 'Failed to delete project');
  }
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<string>) => {
      state.currentProjectId = action.payload;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
    updateProjectShapes: (state, action: PayloadAction<{ projectId: string; shapes: Project['shapes'] }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.shapes = action.payload.shapes;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        // Set current project to first project if none selected
        if (!state.currentProjectId && action.payload.length > 0) {
          state.currentProjectId = action.payload[0].id;
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while fetching projects';
      })

    // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.currentProjectId = action.payload.id;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while creating the project';
      })

    // Add Update Project cases
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          // Preserve shapes when updating project
          const existingShapes = state.projects[index].shapes;
          state.projects[index] = {
            ...action.payload,
            shapes: existingShapes,
          };
        }
      })
    .addCase(updateProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'An error occurred while updating the project';
    })

    // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project.id !== action.payload);
        if (state.currentProjectId === action.payload) {
             // If we just deleted the current project
             if (state.projects.length === 0) {
              state.currentProjectId = null;
            } else {
              state.currentProjectId = state.projects[0]?.id || null;
            }
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while deleting the project';
      });
  },
});

// Export actions
export const {
  setCurrentProject,
  clearProjectError,
  updateProjectShapes,
} = projectsSlice.actions;

// Selectors
export const selectAllProjects = (state: { projects: ProjectsState }) => state.projects.projects;
export const selectCurrentProject = (state: { projects: ProjectsState }) => 
  state.projects.projects.find(project => project.id === state.projects.currentProjectId);
export const selectProjectsLoading = (state: { projects: ProjectsState }) => state.projects.loading;
export const selectProjectsError = (state: { projects: ProjectsState }) => state.projects.error;

export default projectsSlice.reducer;