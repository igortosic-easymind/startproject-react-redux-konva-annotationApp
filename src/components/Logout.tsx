import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { AppDispatch } from '../store/store';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await dispatch(logout()).unwrap();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // Still redirect to login even if logout fails
        navigate('/login');
      }
    };

    handleLogout();
  }, [dispatch, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p className="text-gray-600">Logging out...</p>
    </div>
  );
};

export default Logout;