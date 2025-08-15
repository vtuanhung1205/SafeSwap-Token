import React, { useState } from 'react';
import { X, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';



const LoginModal = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { googleLogin } = useAuth();

  const googleLoginHook = useGoogleLogin({
    onSuccess: async (response) => {
      setIsSubmitting(true);
      try {
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        }).then(res => res.json());

        const googleData = {
          access_token: response.access_token,
          user: {
            sub: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture
          },
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        };
        
        console.log('Sending Google data to backend:', googleData);
        await googleLogin(googleData);
        onClose();
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Google login failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      toast.error('Google login failed. Please try again.');
      setIsSubmitting(false);
    },
    flow: 'implicit' // Use implicit flow to get id_token
  });

  const handleGoogleLogin = () => {
    googleLoginHook();
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-6 w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to SafeSwap</h2>
          <p className="text-gray-400">Sign in with your Google account</p>
        </div>

        {/* Login Options */}
        <div className="space-y-4">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full bg-white text-gray-900 rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>


          {/* Authentication Note */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Sign in with Google
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <a href="/terms-of-use" className="text-cyan-500 hover:text-cyan-400">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" className="text-cyan-500 hover:text-cyan-400">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>


    </div>
  );
};

export default LoginModal; 