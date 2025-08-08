import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import { walletAPI, handleApiError } from '../utils/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  wallet: null,
  isWalletConnected: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_WALLET: 'SET_WALLET',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ACTIONS.SET_USER:
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        loading: false 
      };
    case AUTH_ACTIONS.SET_WALLET:
      return { 
        ...state, 
        wallet: action.payload, 
        isWalletConnected: !!action.payload,
        loading: false 
      };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return { 
        ...state, 
        user: action.payload.user, 
        isAuthenticated: true, 
        loading: false,
        error: null 
      };
    case AUTH_ACTIONS.LOGOUT:
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false, 
        loading: false,
        error: null 
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Google Login
  const googleLogin = async (googleData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const result = await authService.googleLogin(googleData);
      
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.data });
        toast.success('Login successfully!');
        
        // Check wallet status after login
        await checkWalletStatus();
        
        return result;
      } else {
        throw new Error(result.error || 'Google login failed');
      }
    } catch (error) {
      const errorMessage = error.error || 'Login Google failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Aptos Connect Login
  const aptosConnectLogin = async (aptosData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const result = await authService.aptosConnectLogin(aptosData);
      
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.data });
        toast.success('Đăng nhập Aptos Connect thành công!');
        return result;
      } else {
        throw new Error(result.error || 'Aptos Connect login failed');
      }
    } catch (error) {
      const errorMessage = error.error || 'Đăng nhập Aptos Connect thất bại';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Email Login
  const emailLogin = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const result = await authService.emailLogin(email, password);
      
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.data });
        toast.success('Đăng nhập thành công!');
        return result;
      } else {
        throw new Error(result.error || 'Email login failed');
      }
    } catch (error) {
      const errorMessage = error.error || 'Đăng nhập thất bại';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Register
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const result = await authService.register(userData);
      
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.data });
        toast.success('Đăng ký thành công!');
        return result;
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.error || 'Đăng ký thất bại';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Wallet Login
  const walletLogin = async (walletData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const result = await authService.walletLogin(walletData);
      
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.data });
        toast.success('Đăng nhập ví thành công!');
        return result;
      } else {
        throw new Error(result.error || 'Wallet login failed');
      }
    } catch (error) {
      const errorMessage = error.error || 'Đăng nhập ví thất bại';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Connect Wallet
  const connectWallet = async (walletData) => {
    try {
      if (!state.isAuthenticated) {
        toast.error('Please login before connecting your wallet');
        return { success: false, error: 'Authentication required' };
      }
      
      const response = await walletAPI.connect(walletData.address, walletData.publicKey);
      
      if (response.data.success) {
        dispatch({ type: 'SET_WALLET', payload: response.data.data.wallet });
        toast.success('Wallet connected successfully');
        return { success: true, wallet: response.data.data.wallet };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Check Wallet Status
  const checkWalletStatus = async () => {
    try {
      if (!state.isAuthenticated) return;
      
      const response = await walletAPI.getInfo();
      
      if (response.data.success) {
        dispatch({ type: 'SET_WALLET', payload: response.data.data.wallet });
      }
    } catch (error) {
      console.error('Wallet status check failed:', error);
    }
  };

  // Disconnect Wallet
  const disconnectWallet = async () => {
    try {
      if (!state.isWalletConnected) return { success: true };
      
      const response = await walletAPI.disconnect();
      
      if (response.data.success) {
        dispatch({ type: 'SET_WALLET', payload: null });
        toast.success('Wallet disconnected successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Đăng xuất thành công!');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Clear Error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const result = await authService.updateProfile(profileData);
      
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: result.data });
        toast.success('Cập nhật thông tin thành công!');
        return result;
      } else {
        throw new Error(result.error || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error.error || 'Cập nhật thông tin thất bại';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = {
    ...state,
    googleLogin,
    aptosConnectLogin,
    emailLogin,
    register,
    walletLogin,
    connectWallet,
    disconnectWallet,
    checkWalletStatus,
    logout,
    clearError,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 