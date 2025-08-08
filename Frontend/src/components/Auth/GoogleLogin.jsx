import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const GoogleLogin = ({ onSuccess, className = "" }) => {
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const googleLoginHook = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        console.log('Google OAuth response:', tokenResponse);
        
        // Validate token response structure
        if (!tokenResponse || !tokenResponse.access_token) {
          throw new Error('Invalid Google OAuth response: missing access_token');
        }
        
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text();
          console.error('Google userinfo error:', errorText);
          throw new Error(`Failed to fetch user info from Google: ${userInfoResponse.status}`);
        }
        
        const userInfo = await userInfoResponse.json();
        console.log('Google user info:', userInfo);
        
        // Validate user info
        if (!userInfo.email || !userInfo.sub) {
          throw new Error('Invalid user info from Google: missing email or sub');
        }
        
        // Prepare data for backend
        const googleData = {
          access_token: tokenResponse.access_token,
          user: userInfo,
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        };
        
        console.log('Sending to backend:', googleData);
        
        // Login with Google
        const result = await googleLogin(googleData);
        console.log('Backend login result:', result);
        
        if (result.success && onSuccess) {
          onSuccess(result.user);
        }
      } catch (error) {
        console.error("Google login failed:", error);
        // Error is already handled by googleLogin function
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google OAuth error:", error);
      setIsLoading(false);
    },
  });

  return (
    <button
      onClick={() => !isLoading && googleLoginHook()}
      disabled={isLoading}
      className={`w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Signing in...</span>
        </>
      ) : (
        <>
          {/* Google Logo */}
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-lg">Continue with Google</span>
        </>
      )}
    </button>
  );
};

export default GoogleLogin; 