import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosSDKTest = () => {
  const [testResults, setTestResults] = useState({
    import: { status: 'pending', message: 'Testing import...' },
    client: { status: 'pending', message: 'Testing client...' },
    account: { status: 'pending', message: 'Testing account...' },
    wallet: { status: 'pending', message: 'Testing wallet...' }
  });
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults({
      import: { status: 'pending', message: 'Testing import...' },
      client: { status: 'pending', message: 'Testing client...' },
      account: { status: 'pending', message: 'Testing account...' },
      wallet: { status: 'pending', message: 'Testing wallet...' }
    });

    try {
      // Test 1: Import
      console.log('Testing Aptos SDK import...');
      const { AptosClient, AptosAccount } = await import('aptos');
      setTestResults(prev => ({
        ...prev,
        import: { status: 'success', message: 'Import successful' }
      }));
      toast.success('Import test passed');

      // Test 2: Client
      console.log('Testing AptosClient...');
      const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com");
      setTestResults(prev => ({
        ...prev,
        client: { status: 'success', message: 'Client created successfully' }
      }));
      toast.success('Client test passed');

      // Test 3: Account
      console.log('Testing AptosAccount...');
      const account = new AptosAccount();
      const address = account.address().toString();
      const publicKey = account.pubKey().toString();
      setTestResults(prev => ({
        ...prev,
        account: { status: 'success', message: `Account created: ${address.slice(0, 6)}...${address.slice(-4)}` }
      }));
      toast.success('Account test passed');

      // Test 4: Wallet Creation
      console.log('Testing wallet creation...');
      const walletData = {
        address: address,
        publicKey: publicKey,
        privateKey: account.toPrivateKeyObject(),
        provider: 'aptos-sdk',
        createdAt: Date.now()
      };
      localStorage.setItem('aptos_sdk_test_wallet', JSON.stringify(walletData));
      setTestResults(prev => ({
        ...prev,
        wallet: { status: 'success', message: 'Wallet created and stored successfully' }
      }));
      toast.success('Wallet test passed');

    } catch (error) {
      console.error('Test failed:', error);
      const failedTest = Object.keys(testResults).find(key => 
        testResults[key].status === 'pending'
      );
      if (failedTest) {
        setTestResults(prev => ({
          ...prev,
          [failedTest]: { status: 'error', message: `Failed: ${error.message}` }
        }));
      }
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearTestWallet = () => {
    localStorage.removeItem('aptos_sdk_test_wallet');
    toast.success('Test wallet cleared');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Aptos SDK Test
        </h1>
        <p className="text-gray-600">
          Test Aptos SDK import and functionality
        </p>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Test Controls</h2>
          <div className="flex space-x-2">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Run Tests</span>
                </>
              )}
            </button>
            
            <button
              onClick={clearTestWallet}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Clear Test Wallet
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-3">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(result.status)}
                <div>
                  <h3 className="font-medium capitalize">{testName}</h3>
                  <p className={`text-sm ${getStatusColor(result.status)}`}>
                    {result.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Wallet Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Test Wallet Information</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Test Wallet Exists:</span>
            <span className={`text-sm ${localStorage.getItem('aptos_sdk_test_wallet') ? 'text-green-600' : 'text-red-600'}`}>
              {localStorage.getItem('aptos_sdk_test_wallet') ? 'Yes' : 'No'}
            </span>
          </div>
          
          {localStorage.getItem('aptos_sdk_test_wallet') && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Stored Wallet Data:</h3>
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(JSON.parse(localStorage.getItem('aptos_sdk_test_wallet')), null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Test Instructions</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click "Run Tests" to test Aptos SDK functionality</li>
          <li>Check console for detailed logs</li>
          <li>Verify all tests pass (green checkmarks)</li>
          <li>If any test fails, check the error message</li>
          <li>Use "Clear Test Wallet" to remove test data</li>
        </ol>
      </div>
    </div>
  );
};

export default AptosSDKTest; 