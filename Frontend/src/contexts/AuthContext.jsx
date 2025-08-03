import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, handleApiError, walletAPI } from '../utils/api';
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
    if (state.isAuthenticated) {
      checkWalletStatus();
    }
  }, [state.isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getAuthStatus();
      if (response.data.success && response.data.data.isAuthenticated) {
        dispatch({ type: 'SET_USER', payload: response.data.data.user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const checkWalletStatus = async () => {
    try {
      if (!state.isAuthenticated) return;
      
      const response = await walletAPI.getInfo();
      if (response.data.success && response.data.data.wallet) {
        dispatch({ type: 'SET_WALLET', payload: response.data.data.wallet });
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
        dispatch({ type: 'SET_USER', payload: response.data.data.user });
        toast.success('Successfully logged in with Google!');
        
        // Check session after login
        setTimeout(async () => {
          try {
            const statusResponse = await authAPI.getAuthStatus();
            console.log('Auth status after login:', statusResponse.data);
          } catch (error) {
            console.error('Failed to check auth status after login:', error);
          }
        }, 1000);
        
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

  const logout = async () => {
    try {
      await authAPI.logout();
      dispatch({ type: 'LOGOUT' });
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      if (response.data.success) {
        dispatch({ type: 'SET_USER', payload: response.data.data.user });
        toast.success('Profile updated successfully!');
        return response.data.data;
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw error;
    }
  };

  const connectWallet = async (walletData) => {
    try {
      const response = await walletAPI.connect(walletData.address, walletData.publicKey);
      if (response.data.success) {
        dispatch({ type: 'SET_WALLET', payload: response.data.data.wallet });
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
      await walletAPI.disconnect();
      dispatch({ type: 'SET_WALLET', payload: null });
      toast.success('Wallet disconnected successfully!');
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
      // Even if API fails, clear local state
      dispatch({ type: 'SET_WALLET', payload: null });
    }
  };

  const value = {
    ...state,
    googleLogin,
    logout,
    updateProfile,
    connectWallet,
    disconnectWallet,
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