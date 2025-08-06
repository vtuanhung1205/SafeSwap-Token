import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, walletAPI, handleApiError } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  wallet: null,
  isWalletConnected: false,
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
    case 'SET_WALLET':
      return {
        ...state,
        wallet: action.payload,
        isWalletConnected: !!action.payload,
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

  // Check wallet status when user is authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.user?.walletAddress) {
      checkWalletStatus();
    }
  }, [state.isAuthenticated, state.user?.walletAddress]);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const response = await authAPI.getProfile();
      if (response.data.success) {
        dispatch({ type: 'SET_USER', payload: response.data.data });
      } else {
        localStorage.removeItem('authToken');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Only remove token on 401 errors, not on network errors
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const checkWalletStatus = async () => {
    try {
      if (!state.isAuthenticated || !state.user?.walletAddress) return;
      
      const response = await walletAPI.checkConnection(state.user.walletAddress);
      if (response.data.success && response.data.data.connected) {
        dispatch({ type: 'SET_WALLET', payload: response.data.data });
      }
    } catch (error) {
      console.error('Wallet check failed:', error);
      // Don't show error notification for wallet check
    }
  };

  const googleLogin = async (googleData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('Google login attempt with data:', googleData);
      
      const response = await authAPI.googleAuth(googleData);
      
      console.log('Google auth response:', response.data);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ type: 'SET_USER', payload: user });
        toast.success('Successfully logged in with Google!');
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ type: 'SET_USER', payload: user });
        toast.success('Account created successfully!');
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ type: 'SET_USER', payload: user });
        toast.success('Successfully logged in!');
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      toast.success('Successfully logged out!');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      if (response.data.success) {
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'SET_USER', payload: updatedUser });
        toast.success('Profile updated successfully!');
        return response.data.data;
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      if (response.data.success) {
        toast.success('Password changed successfully!');
        return response.data.data;
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw error;
    }
  };

  const connectWallet = async (walletAddress, walletType = 'other') => {
    try {
      const response = await authAPI.connectWallet(walletAddress, walletType);
      if (response.data.success) {
        const updatedUser = { ...state.user, walletAddress, walletType };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'SET_USER', payload: updatedUser });
        toast.success('Wallet connected successfully!');
        return response.data.data;
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await authAPI.disconnectWallet();
      const updatedUser = { ...state.user, walletAddress: null, walletType: 'other' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'SET_USER', payload: updatedUser });
      dispatch({ type: 'SET_WALLET', payload: null });
      toast.success('Wallet disconnected successfully!');
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
      // Even if API fails, clear local state
      const updatedUser = { ...state.user, walletAddress: null, walletType: 'other' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'SET_USER', payload: updatedUser });
      dispatch({ type: 'SET_WALLET', payload: null });
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem('authToken', token);
        return token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.data.success) {
        toast.success('Password reset instructions sent to your email!');
        return response.data.data;
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = {
    ...state,
    googleLogin,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    connectWallet,
    disconnectWallet,
    refreshToken,
    forgotPassword,
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