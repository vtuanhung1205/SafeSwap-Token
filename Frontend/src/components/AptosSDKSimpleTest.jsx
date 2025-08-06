import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosSDKSimpleTest = () => {
  const [testStatus, setTestStatus] = useState('idle');
  const [testResult, setTestResult] = useState(null);

  const runSimpleTest = async () => {
    setTestStatus('running');
    setTestResult(null);

    try {
      console.log('Starting Aptos SDK test...');
      
      // Test 1: Import
      console.log('Testing import...');
      const { AptosClient, AptosAccount } = await import('aptos');
      console.log('Import successful');
      
      // Test 2: Create client
      console.log('Testing client creation...');
      const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com");
      console.log('Client created successfully');
      
      // Test 3: Create account
      console.log('Testing account creation...');
      const account = new AptosAccount();
      const address = account.address().toString();
      console.log('Account created:', address);
      
      // Test 4: Create wallet data
      console.log('Testing wallet data creation...');
      const walletData = {
        address: address,
        publicKey: account.pubKey().toString(),
        privateKey: account.toPrivateKeyObject(),
        provider: 'aptos-sdk',
        createdAt: Date.now()
      };
      console.log('Wallet data created:', walletData);
      
      setTestStatus('success');
      setTestResult({
        address: address,
        message: 'All tests passed successfully!'
      });
      toast.success('Aptos SDK test passed!');
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestStatus('error');
      setTestResult({
        error: error.message,
        message: 'Test failed'
      });
      toast.error(`Test failed: ${error.message}`);
    }
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'running':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (testStatus) {
      case 'success':
        return 'Test Passed';
      case 'error':
        return 'Test Failed';
      case 'running':
        return 'Running Test...';
      default:
        return 'Ready to Test';
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Aptos SDK Simple Test</h2>
          <p className="text-sm text-gray-600">
            Test basic Aptos SDK functionality
          </p>
        </div>

        <div className="space-y-4">
          {/* Test Button */}
          <button
            onClick={runSimpleTest}
            disabled={testStatus === 'running'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {testStatus === 'running' ? 'Testing...' : 'Run Test'}
          </button>

          {/* Status Display */}
          {testStatus !== 'idle' && (
            <div className="flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-lg">
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </div>
          )}

          {/* Results */}
          {testResult && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Test Results:</h3>
              <p className="text-sm text-gray-700 mb-2">{testResult.message}</p>
              
              {testResult.address && (
                <div className="text-xs">
                  <p><strong>Address:</strong> {testResult.address}</p>
                  <p><strong>Short:</strong> {testResult.address.slice(0, 6)}...{testResult.address.slice(-4)}</p>
                </div>
              )}
              
              {testResult.error && (
                <div className="text-xs text-red-600">
                  <p><strong>Error:</strong> {testResult.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500">
            <p>This test will:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Import Aptos SDK</li>
              <li>Create AptosClient</li>
              <li>Create AptosAccount</li>
              <li>Generate wallet data</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptosSDKSimpleTest; 