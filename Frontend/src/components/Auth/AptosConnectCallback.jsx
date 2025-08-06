import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosConnectCallback = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [walletData, setWalletData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log('Processing Aptos Connect callback...');
      
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check if this is an Aptos Connect callback
      const aptosConnect = urlParams.get('aptos_connect');
      const walletAddress = urlParams.get('wallet');
      const publicKey = urlParams.get('publicKey');
      const authKey = urlParams.get('authKey');
      const provider = urlParams.get('provider');
      const error = urlParams.get('error');
      
      console.log('URL Parameters:', {
        aptosConnect,
        walletAddress,
        publicKey,
        authKey,
        provider,
        error
      });

      // Handle error from Aptos Connect
      if (error) {
        console.error('Aptos Connect error:', error);
        setError(`Connection failed: ${error}`);
        setStatus('error');
        
        if (onError) {
          onError(error);
        }
        
        toast.error(`Connection failed: ${error}`);
        return;
      }

      // Check if this is a valid callback
      if (aptosConnect !== 'true') {
        console.log('Not an Aptos Connect callback');
        setStatus('error');
        setError('Invalid callback');
        return;
      }

      // Validate wallet data
      if (!walletAddress) {
        console.error('No wallet address in callback');
        setError('No wallet data received from Aptos Connect');
        setStatus('error');
        
        if (onError) {
          onError('No wallet data received');
        }
        
        toast.error('No wallet data received from Aptos Connect');
        return;
      }

      // Create wallet data object
      const data = {
        type: 'aptos-connect',
        address: walletAddress,
        publicKey: publicKey,
        authKey: authKey,
        provider: provider || 'aptos-connect',
        timestamp: Date.now()
      };

      console.log('Wallet data received:', data);
      
      // Store wallet data
      setWalletData(data);
      setStatus('success');
      
      // Call success callback
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Show success message
      toast.success(`Connected with ${data.provider}: ${data.address}`);
      
      // Clean up URL after a short delay
      setTimeout(() => {
        const cleanUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);
      }, 2000);

    } catch (error) {
      console.error('Callback processing error:', error);
      setError(error.message || 'Failed to process callback');
      setStatus('error');
      
      if (onError) {
        onError(error.message);
      }
      
      toast.error('Failed to process connection callback');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processing Connection
            </h3>
            <p className="text-sm text-gray-600">
              Please wait while we process your wallet connection...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connection Successful!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your wallet has been connected successfully.
            </p>
            
            {walletData && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Wallet Information:</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Address:</span>
                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                      {walletData.address}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Provider:</span>
                    <span className="ml-2">{walletData.provider}</span>
                  </div>
                  {walletData.publicKey && (
                    <div>
                      <span className="font-medium">Public Key:</span>
                      <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                        {walletData.publicKey.slice(0, 20)}...
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connection Failed
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {error || 'There was an issue with your connection.'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AptosConnectCallback; 