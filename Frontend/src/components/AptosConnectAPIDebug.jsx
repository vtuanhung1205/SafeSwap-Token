import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosConnectAPIDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    isInitialized: false,
    aptosConnect: null,
    clientId: null,
    error: null,
    testResults: []
  });

  const [isTesting, setIsTesting] = useState(false);

  // Initialize and test Aptos Connect API
  useEffect(() => {
    initializeAptosConnect();
  }, []);

  const initializeAptosConnect = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, error: null }));
      
      // Test 1: Check if module can be imported
      console.log('Test 1: Importing @aptos-connect/wallet-api...');
      const { AptosConnect } = await import('@aptos-connect/wallet-api');
      console.log('✅ AptosConnect imported successfully');
      
      // Test 2: Get client ID
      const clientId = import.meta.env.VITE_APTOS_CONNECT_CLIENT_ID || 'safeswap-demo';
      console.log('Test 2: Client ID:', clientId);
      
      // Test 3: Initialize AptosConnect
      console.log('Test 3: Initializing AptosConnect...');
      const aptosConnect = new AptosConnect({
        clientId: clientId,
        network: 'mainnet',
        redirectUri: window.location.origin,
      });
      console.log('✅ AptosConnect initialized successfully');
      
      setDebugInfo({
        isInitialized: true,
        aptosConnect,
        clientId,
        error: null,
        testResults: [
          { test: 'Module Import', status: 'success', message: 'AptosConnect imported successfully' },
          { test: 'Client ID', status: 'success', message: `Client ID: ${clientId}` },
          { test: 'Initialization', status: 'success', message: 'AptosConnect initialized successfully' }
        ]
      });
      
    } catch (error) {
      console.error('AptosConnect initialization failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        error: error.message,
        testResults: [
          { test: 'Module Import', status: 'error', message: error.message }
        ]
      }));
    }
  };

  const testAuthentication = async () => {
    if (!debugInfo.aptosConnect) {
      toast.error('AptosConnect not initialized');
      return;
    }

    setIsTesting(true);
    try {
      console.log('Testing authentication...');
      
      const authResult = await debugInfo.aptosConnect.authenticate({
        provider: 'google',
        scope: ['email', 'profile'],
      });

      console.log('Authentication result:', authResult);
      
      setDebugInfo(prev => ({
        ...prev,
        testResults: [
          ...prev.testResults,
          { 
            test: 'Authentication', 
            status: 'success', 
            message: 'Authentication successful',
            data: authResult
          }
        ]
      }));
      
      toast.success('Authentication test successful!');
      
    } catch (error) {
      console.error('Authentication test failed:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        testResults: [
          ...prev.testResults,
          { 
            test: 'Authentication', 
            status: 'error', 
            message: error.message 
          }
        ]
      }));
      
      toast.error('Authentication test failed: ' + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const testWalletExtension = async () => {
    try {
      console.log('Testing wallet extension...');
      
      if (typeof window !== 'undefined' && window.aptos) {
        const result = await window.aptos.connect();
        console.log('Wallet extension result:', result);
        
        setDebugInfo(prev => ({
          ...prev,
          testResults: [
            ...prev.testResults,
            { 
              test: 'Wallet Extension', 
              status: 'success', 
              message: 'Wallet extension connected',
              data: result
            }
          ]
        }));
        
        toast.success('Wallet extension test successful!');
      } else {
        throw new Error('Wallet extension not available');
      }
      
    } catch (error) {
      console.error('Wallet extension test failed:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        testResults: [
          ...prev.testResults,
          { 
            test: 'Wallet Extension', 
            status: 'error', 
            message: error.message 
          }
        ]
      }));
      
      toast.error('Wallet extension test failed: ' + error.message);
    }
  };

  const clearResults = () => {
    setDebugInfo(prev => ({ ...prev, testResults: [] }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Aptos Connect API Debug
        </h1>
        <p className="text-gray-600">
          Debug and test Aptos Connect API functionality
        </p>
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Initialization Status</h2>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {debugInfo.isInitialized ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">
              AptosConnect API: {debugInfo.isInitialized ? 'Initialized' : 'Not Initialized'}
            </span>
          </div>
          
          {debugInfo.clientId && (
            <div className="text-sm text-gray-600">
              Client ID: <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.clientId}</code>
            </div>
          )}
          
          {debugInfo.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">{debugInfo.error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
        
        <div className="flex space-x-3">
          <button
            onClick={initializeAptosConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reinitialize
          </button>
          
          <button
            onClick={testAuthentication}
            disabled={!debugInfo.isInitialized || isTesting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Test Authentication
              </>
            )}
          </button>
          
          <button
            onClick={testWalletExtension}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Test Wallet Extension
          </button>
          
          <button
            onClick={clearResults}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      {debugInfo.testResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          
          <div className="space-y-3">
            {debugInfo.testResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    result.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Data
                    </summary>
                    <pre className="mt-2 bg-gray-50 p-2 rounded overflow-auto text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Environment Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Environment Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700 mb-1">User Agent</label>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              {navigator.userAgent}
            </code>
          </div>
          
          <div>
            <label className="block font-medium text-gray-700 mb-1">Current URL</label>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              {window.location.href}
            </code>
          </div>
          
          <div>
            <label className="block font-medium text-gray-700 mb-1">Window.aptos</label>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              {typeof window !== 'undefined' && window.aptos ? 'Available' : 'Not Available'}
            </code>
          </div>
          
          <div>
            <label className="block font-medium text-gray-700 mb-1">HTTPS</label>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              {window.location.protocol === 'https:' ? 'Yes' : 'No'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptosConnectAPIDebug; 