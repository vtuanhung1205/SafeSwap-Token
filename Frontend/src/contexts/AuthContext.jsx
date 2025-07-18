import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, handleApiError } from '../utils/api';
import { mockUser } from '../utils/mockData';
import toast from 'react-hot-toast';
import { DEMO_MODE } from '../config/demo';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (DEMO_MODE) {
        // Auto-login with mock user for demo
        dispatch({ type: 'SET_USER', payload: mockUser });
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const response = await authAPI.validateToken();
      if (response.data.success) {
        dispatch({ type: 'SET_USER', payload: response.data.data.user });
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (DEMO_MODE) {
        // Simulate login for demo mode
        if (email === 'demo@example.com' && password === 'password123') {
          dispatch({ type: 'SET_USER', payload: mockUser });
          toast.success('Demo login successful!');
          return { success: true, user: mockUser };
        } else {
          throw new Error('Invalid credentials');
        }
      }
      
      const response = await authAPI.login(email, password);
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        dispatch({ type: 'SET_USER', payload: user });
        toast.success('Login successful!');
        
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, name, password, avatar) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (DEMO_MODE) {
        // Simulate registration for demo mode
        dispatch({ type: 'SET_USER', payload: { ...mockUser, email, name } });
        toast.success('Demo registration successful!');
        return { success: true, user: { ...mockUser, email, name } };
      }
      
      const response = await authAPI.register(email, name, password, avatar);
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        dispatch({ type: 'SET_USER', payload: user });
        toast.success('Registration successful!');
        
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      if (!DEMO_MODE) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data) => {
    try {
      if (DEMO_MODE) {
        // Simulate profile update for demo mode
        const updatedUser = { ...state.user, ...data };
        dispatch({ type: 'SET_USER', payload: updatedUser });
        toast.success('Profile updated successfully');
        return { success: true };
      }
      
      const response = await authAPI.updateProfile(data);
      
      if (response.data.success) {
        dispatch({ type: 'SET_USER', payload: response.data.data.user });
        toast.success('Profile updated successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 