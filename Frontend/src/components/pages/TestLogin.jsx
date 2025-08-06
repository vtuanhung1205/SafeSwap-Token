import React, { useState } from 'react';
import ConnectModal from '../Auth/ConnectModal';
import AptosSDKSimpleTest from '../AptosSDKSimpleTest';

const TestLogin = () => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);

  const handleConnectionSuccess = (result) => {
    console.log('Connection success:', result);
    setConnectionResult(result);
    setShowConnectModal(false);
  };

  const clearResult = () => {
    setConnectionResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Login Test Page
          </h1>
          <p className="text-gray-600">
            Test the new Aptos SDK login functionality
          </p>
        </div>

        {/* Test Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Connect Modal Test */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Connect Modal Test</h2>
            <p className="text-sm text-gray-600 mb-4">
              Test the main Connect Modal with Aptos SDK and Google OAuth
            </p>
            
            <button
              onClick={() => setShowConnectModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Open Connect Modal
            </button>

            {connectionResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Connection Result:</h3>
                <div className="text-sm text-green-700">
                  <p><strong>Type:</strong> {connectionResult.type}</p>
                  {connectionResult.data && (
                    <div className="mt-2">
                      <p><strong>Data:</strong></p>
                      <pre className="text-xs bg-green-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(connectionResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
                <button
                  onClick={clearResult}
                  className="mt-2 text-xs text-green-600 hover:text-green-800"
                >
                  Clear Result
                </button>
              </div>
            )}
          </div>

          {/* SDK Test */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Aptos SDK Test</h2>
            <p className="text-sm text-gray-600 mb-4">
              Test basic Aptos SDK functionality
            </p>
            
            <AptosSDKSimpleTest />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">Test Instructions</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Click "Open Connect Modal" to test the main login flow</li>
            <li>Try both "Connect Aptos Wallet" and "Continue with Google" options</li>
            <li>Use the SDK test to verify basic Aptos SDK functionality</li>
            <li>Check browser console for detailed logs</li>
            <li>Verify that wallet data is stored in localStorage</li>
          </ol>
        </div>

        {/* Connection Modal */}
        <ConnectModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onSuccess={handleConnectionSuccess}
        />
      </div>
    </div>
  );
};

export default TestLogin; 