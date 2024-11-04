import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from '../store/authSlice';
import { RootState, AppDispatch } from '../store/store';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get error and loading states from Redux
  const { error, loading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If user is already authenticated, redirect to canvas
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/canvas');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const resultAction = await dispatch(login({ username, password }));
      
      if (login.fulfilled.match(resultAction)) {
        navigate('/canvas');
      } else if (login.rejected.match(resultAction)) {
        // Clear password field on error
        setPassword('');
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-10 bg-white rounded shadow-xl">
        <h2 className="text-2xl font-bold mb-5">Login</h2>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            className="mt-1"
          />
        </div>
        
        <div className="mb-6">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="mt-1"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="mr-2">Logging in...</span>
              {/* Optional: Add a loading spinner here */}
            </span>
          ) : (
            'Login'
          )}
        </Button>
      </form>
    </div>
  );
};

export default Login;