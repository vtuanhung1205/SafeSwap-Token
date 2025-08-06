import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AptosConnectCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing connection...');
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        const error = urlParams.get('error');
        
        if (error) {
          setStatus('error');
          setMessage('Connection failed. Please try again.');
          toast.error('Connection failed');
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }
        
        if (data) {
          try {
            const walletData = JSON.parse(atob(data));
            console.log('Aptos Connect callback data:', walletData);
            
            if (walletData.address) {
              // Store wallet data
              const walletInfo = {
                address: walletData.address,
                publicKey: walletData.publicKey,
                provider: 'aptos-connect',
                createdAt: Date.now()
              };
              
              localStorage.setItem('aptos_connect_wallet', JSON.stringify(walletInfo));
              
              setStatus('success');
              setMessage('Wallet connected successfully!');
              toast.success(`Connected: ${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`);
              
              setTimeout(() => {
                navigate('/');
              }, 2000);
            } else {
              throw new Error('Invalid wallet data');
            }
          } catch (parseError) {
            console.error('Failed to parse callback data:', parseError);
            setStatus('error');
            setMessage('Failed to process connection data');
            toast.error('Failed to connect wallet');
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage('No connection data received');
          toast.error('No connection data received');
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        toast.error('Connection failed');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    processCallback();
  }, [navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {getStatusIcon()}
          
          <h2 className={`text-xl font-semibold mt-4 ${getStatusColor()}`}>
            {status === 'success' ? 'Connection Successful' : 
             status === 'error' ? 'Connection Failed' : 
             'Processing Connection'}
          </h2>
          
          <p className="text-gray-600 mt-2">
            {message}
          </p>
          
          {status === 'processing' && (
            <div className="mt-4">
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Return to SafeSwap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptosConnectCallback; 