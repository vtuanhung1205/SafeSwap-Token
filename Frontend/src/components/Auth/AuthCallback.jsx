import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          await checkAuthStatus();
          
          toast.success('Successfully logged in with Google!');
          navigate('/dashboard');
        } else {
          toast.error('Authentication failed. Missing tokens.');
          navigate('/');
        }
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('An error occurred during authentication.');
        navigate('/');
      }
    };

    handleCallback();
  }, [location, navigate, checkAuthStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111112]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
        <p className="text-gray-400">Please wait while we complete your login.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
