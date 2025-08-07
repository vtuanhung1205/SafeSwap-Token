import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Wallet, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SimpleLogin = () => {
  const { googleLogin, aptosConnectLogin, emailLogin, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Google Login
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsConnecting(true);
        await googleLogin({
          access_token: response.access_token,
          user: {
            email: response.email,
            name: response.name,
            picture: response.picture
          }
        });
      } catch (error) {
        console.error('Google login error:', error);
      } finally {
        setIsConnecting(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error('Google đăng nhập thất bại');
    }
  });

  // Aptos Connect Login
  const handleAptosConnect = async () => {
    try {
      setIsConnecting(true);
      // Redirect to Aptos Connect
      const connectUrl = `https://aptosconnect.app/prompt/?client_id=${process.env.VITE_APTOS_CONNECT_CLIENT_ID || 'demo-client-id'}&dapp_name=SafeSwap&dapp_url=${process.env.VITE_DAPP_URL || 'https://safeswap-frontend.onrender.com'}&redirect_url=${process.env.VITE_CALLBACK_URL || 'https://safeswap-frontend.onrender.com/aptos-connect-callback'}`;
      window.location.href = connectUrl;
    } catch (error) {
      console.error('Aptos Connect error:', error);
      toast.error('Aptos Connect thất bại');
    } finally {
      setIsConnecting(false);
    }
  };

  // Email Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      await emailLogin(email, password);
    } catch (error) {
      console.error('Email login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chào mừng đến SafeSwap
          </h1>
          <p className="text-gray-600">
            Đăng nhập để bắt đầu giao dịch
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading || isConnecting}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3 hover:border-gray-400 disabled:opacity-50"
          >
            {loading || isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Đăng nhập với Google</span>
              </>
            )}
          </button>

          {/* Aptos Connect */}
          <button
            onClick={handleAptosConnect}
            disabled={loading || isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            {loading || isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Đăng nhập với Aptos Connect</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">hoặc</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu của bạn"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isConnecting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {loading || isConnecting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Bằng cách đăng nhập, bạn đồng ý với</p>
          <p className="mt-1">
            <a href="/terms" className="text-blue-600 hover:underline">Điều khoản sử dụng</a>
            {' '}và{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
