import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosConnectCallback = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [walletData, setWalletData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const walletAddress = urlParams.get('wallet');
        const publicKey = urlParams.get('publicKey');
        const authKey = urlParams.get('authKey');
        const provider = urlParams.get('provider');

        // Check if we have wallet data
        if (walletAddress) {
          const data = {
            type: 'aptos-connect',
            address: walletAddress,
            publicKey: publicKey,
            authKey: authKey,
            provider: provider || 'aptos-connect'
          };

          setWalletData(data);
          setStatus('success');

          // Store wallet data
          localStorage.setItem('aptos_connect_wallet', JSON.stringify(data));

          // Show success message
          toast.success(`Connected with ${data.provider}: ${data.address}`);

          // Redirect back to app after a short delay
          setTimeout(() => {
            // Remove callback parameters from URL
            const cleanUrl = window.location.href.split('?')[0];
            window.history.replaceState({}, document.title, cleanUrl);
            
            // You can redirect to a specific page or just close the modal
            window.location.href = '/dashboard'; // or wherever you want to redirect
          }, 2000);

        } else {
          // Check for error parameters
          const errorMsg = urlParams.get('error');
          if (errorMsg) {
            setError(errorMsg);
            setStatus('error');
            toast.error(`Connection failed: ${errorMsg}`);
          } else {
            setError('No wallet data received');
            setStatus('error');
            toast.error('No wallet data received');
          }
        }
      } catch (err) {
        console.error('Error handling Aptos Connect callback:', err);
        setError(err.message);
        setStatus('error');
        toast.error('Failed to process wallet connection');
      }
    };

    handleCallback();
  }, []);

  const handleRetry = () => {
    // Redirect back to Aptos Connect
    const currentUrl = encodeURIComponent(window.location.href);
    const aptosConnectUrl = `https://aptosconnect.app/prompt/?request=${btoa(JSON.stringify({
      connect: {
        url: currentUrl,
        name: 'SafeSwap',
        icon: 'https://your-app-icon.com/icon.png'
      }
    }))}`;
    
    window.location.href = aptosConnectUrl;
  };

  const handleClose = () => {
    // Remove callback parameters and go back
    const cleanUrl = window.location.href.split('?')[0];
    window.history.replaceState({}, document.title, cleanUrl);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center p-4">
      <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-8 w-full max-w-md">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 size={32} className="text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connecting Wallet</h2>
              <p className="text-gray-400">Processing your wallet connection...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Wallet Connected!</h2>
              <p className="text-gray-400 mb-4">Your wallet has been successfully connected.</p>
              
              {walletData && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-4">
                  <div className="text-sm text-gray-400 mb-2">Wallet Address:</div>
                  <div className="font-mono text-xs text-white break-all">
                    {walletData.address}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Provider: {walletData.provider}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500">Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connection Failed</h2>
              <p className="text-gray-400 mb-4">
                {error || 'Failed to connect your wallet'}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 font-semibold transition-colors"
                >
                  Try Again
                </button>
                
                <button
                  onClick={handleClose}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-3 px-4 font-semibold transition-colors"
                >
                  Go Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AptosConnectCallback; 