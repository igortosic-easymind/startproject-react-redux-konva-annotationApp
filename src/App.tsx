import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { store } from './store/store';
import { Provider } from 'react-redux';
import { checkAuthState } from './store/authSlice';
import CanvasApp from './CanvasApp';
import Login from './components/Login';
import Logout from './components/Logout';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/canvas" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route 
        path="/canvas" 
        element={
          <ProtectedRoute>
            <CanvasApp />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;