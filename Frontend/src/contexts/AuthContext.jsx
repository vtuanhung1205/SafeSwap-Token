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

  const logout = async () => {
    try {
      // Disconnect wallet if connected
      if (state.isWalletConnected) {
        try {
          await walletAPI.disconnect();
        } catch (error) {
          console.error('Wallet disconnect error:', error);
        }
        dispatch({ type: 'SET_WALLET', payload: null });
      }
      
      await authAPI.logout();
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

  const googleLogin = async (googleData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('Sending Google data to backend:', googleData);
      
      const response = await authAPI.googleAuth(googleData);
      console.log('Backend response:', response.data);
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Handle different token structures
        if (tokens) {
          if (tokens.accessToken) {
            localStorage.setItem('accessToken', tokens.accessToken);
          } else if (tokens.access_token) {
            localStorage.setItem('accessToken', tokens.access_token);
          }
          
          if (tokens.refreshToken) {
            localStorage.setItem('refreshToken', tokens.refreshToken);
          } else if (tokens.refresh_token) {
            localStorage.setItem('refreshToken', tokens.refresh_token);
          }
        } else {
          // If tokens are directly in the response
          if (response.data.data.accessToken) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
          } else if (response.data.data.access_token) {
            localStorage.setItem('accessToken', response.data.data.access_token);
          }
          
          if (response.data.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
          } else if (response.data.data.refresh_token) {
            localStorage.setItem('refreshToken', response.data.data.refresh_token);
          }
        }
        
        dispatch({ type: 'SET_USER', payload: user });
        toast.success('Google login successful!');
        
        // Check wallet status after login
        await checkWalletStatus();
        
        return { success: true, user };
      } else {
        throw new Error(response.data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

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

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    wallet: state.wallet,
    isWalletConnected: state.isWalletConnected,
    logout,
    updateProfile,
    checkAuthStatus,
    connectWallet,
    disconnectWallet,
    checkWalletStatus,
    googleLogin,
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