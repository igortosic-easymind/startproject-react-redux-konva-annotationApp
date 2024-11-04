import { configureStore } from '@reduxjs/toolkit';
import shapesReducer from './shapesSlice';
import projectsReducer from './projectsSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    shapes: shapesReducer,
    projects: projectsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;