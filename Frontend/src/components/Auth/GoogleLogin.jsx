import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { Mail } from 'lucide-react';

const GoogleLogin = ({ onSuccess, className = "" }) => {
  const { googleLogin } = useAuth();

  const googleLoginHook = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoResponse.json();
        
        // Prepare data for backend
        const googleData = {
          access_token: tokenResponse.access_token,
          user: userInfo,
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        };
        
        // Login with Google
        const result = await googleLogin(googleData);
        
        if (result.success && onSuccess) {
          onSuccess(result.user);
        }
      } catch (error) {
        console.error("Google login failed:", error);
      }
    },
    onError: () => {
      console.error("Google login failed");
    },
  });

  const handleGoogleLogin = () => {
    googleLoginHook();
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className={`w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3 ${className}`}
    >
      <Mail className="w-5 h-5" />
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleLogin; 