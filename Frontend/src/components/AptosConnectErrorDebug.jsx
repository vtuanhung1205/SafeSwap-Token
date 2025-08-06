import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosConnectErrorDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    url: '',
    params: {},
    error: null,
    suggestions: []
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzeCurrentPage();
  }, []);

  const analyzeCurrentPage = () => {
    setIsAnalyzing(true);
    
    try {
      const currentUrl = window.location.href;
      const urlParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlParams.entries());
      
      console.log('Current URL:', currentUrl);
      console.log('URL Parameters:', params);
      
      // Analyze potential issues
      const suggestions = [];
      
      // Check if this is an Aptos Connect callback
      if (params.aptos_connect === 'true') {
        suggestions.push({
          type: 'info',
          message: 'This appears to be an Aptos Connect callback',
          action: 'Process callback data'
        });
      }
      
      // Check for error parameters
      if (params.error) {
        suggestions.push({
          type: 'error',
          message: `Aptos Connect error: ${params.error}`,
          action: 'Handle error appropriately'
        });
      }
      
      // Check for missing wallet data
      if (!params.wallet && params.aptos_connect === 'true') {
        suggestions.push({
          type: 'warning',
          message: 'No wallet data received from Aptos Connect',
          action: 'Check if user completed authentication'
        });
      }
      
      // Check URL structure
      if (!currentUrl.includes('aptos_connect=true') && !currentUrl.includes('wallet=')) {
        suggestions.push({
          type: 'info',
          message: 'This is not an Aptos Connect callback page',
          action: 'Navigate to connection flow'
        });
      }
      
      setDebugInfo({
        url: currentUrl,
        params,
        error: null,
        suggestions
      });
      
    } catch (error) {
      console.error('Error analyzing page:', error);
      setDebugInfo(prev => ({
        ...prev,
        error: error.message
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testAptosConnectUrl = () => {
    try {
      // Create a test URL
      const callbackUrl = new URL(window.location.href);
      callbackUrl.searchParams.set('aptos_connect', 'true');
      callbackUrl.searchParams.set('timestamp', Date.now().toString());
      
      const request = {
        connect: {
          url: callbackUrl.toString(),
          name: 'SafeSwap',
          icon: 'https://your-app-icon.com/icon.png',
          description: 'Connect your Aptos wallet to SafeSwap'
        }
      };
      
      const encodedRequest = btoa(JSON.stringify(request));
      const aptosConnectUrl = `https://aptosconnect.app/prompt/?request=${encodeURIComponent(encodedRequest)}`;
      
      console.log('Test Aptos Connect URL:', aptosConnectUrl);
      console.log('Request object:', request);
      
      // Open in new tab for testing
      window.open(aptosConnectUrl, '_blank');
      
      toast.success('Test URL opened in new tab');
      
    } catch (error) {
      console.error('Error creating test URL:', error);
      toast.error('Failed to create test URL');
    }
  };

  const simulateCallback = () => {
    try {
      // Simulate a successful callback
      const testParams = new URLSearchParams();
      testParams.set('aptos_connect', 'true');
      testParams.set('wallet', '0x1234567890abcdef');
      testParams.set('publicKey', '0xabcdef1234567890');
      testParams.set('provider', 'martian');
      
      const testUrl = `${window.location.origin}${window.location.pathname}?${testParams.toString()}`;
      
      console.log('Simulating callback URL:', testUrl);
      
      // Navigate to test URL
      window.location.href = testUrl;
      
    } catch (error) {
      console.error('Error simulating callback:', error);
      toast.error('Failed to simulate callback');
    }
  };

  const clearUrlParams = () => {
    try {
      const cleanUrl = window.location.href.split('?')[0];
      window.history.replaceState({}, document.title, cleanUrl);
      
      toast.success('URL parameters cleared');
      
      // Re-analyze after clearing
      setTimeout(analyzeCurrentPage, 100);
      
    } catch (error) {
      console.error('Error clearing URL params:', error);
      toast.error('Failed to clear URL parameters');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Aptos Connect Error Debug
        </h1>
        <p className="text-gray-600">
          Debug PromptMissingConnectionError and connection issues
        </p>
      </div>

      {/* Current Page Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Current Page Analysis</h2>
          <button
            onClick={analyzeCurrentPage}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-analyze
              </>
            )}
          </button>
        </div>

        {/* URL Information */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Current URL</label>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
              {debugInfo.url}
            </code>
          </div>

          {/* URL Parameters */}
          {Object.keys(debugInfo.params).length > 0 && (
            <div>
              <label className="block font-medium text-gray-700 mb-1">URL Parameters</label>
              <div className="bg-gray-50 rounded-lg p-3">
                {Object.entries(debugInfo.params).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium">{key}:</span>
                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                      {value}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
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

      {/* Suggestions */}
      {debugInfo.suggestions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Analysis & Suggestions</h2>
          
          <div className="space-y-3">
            {debugInfo.suggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {suggestion.type === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : suggestion.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  <span className="font-medium">{suggestion.message}</span>
                </div>
                <p className="text-sm text-gray-600">{suggestion.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={testAptosConnectUrl}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Test Aptos Connect URL
          </button>
          
          <button
            onClick={simulateCallback}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Simulate Callback
          </button>
          
          <button
            onClick={clearUrlParams}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear URL Params
          </button>
        </div>
      </div>

      {/* Error Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">PromptMissingConnectionError Info</h2>
        
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">What is this error?</h3>
            <p className="text-gray-600">
              PromptMissingConnectionError: missing_connection occurs when Aptos Connect cannot establish a connection with the wallet or when the connection parameters are invalid.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Common Causes</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Invalid or malformed request URL</li>
              <li>Missing or incorrect callback URL</li>
              <li>Browser compatibility issues</li>
              <li>Wallet extension conflicts</li>
              <li>Network connectivity problems</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Solutions</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Ensure proper URL encoding</li>
              <li>Verify callback URL is accessible</li>
              <li>Check browser console for additional errors</li>
              <li>Try different wallet or browser</li>
              <li>Clear browser cache and cookies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptosConnectErrorDebug; 