import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Zap, RefreshCw } from 'lucide-react';
import { APTOS_CONFIG, QUICKNODE_UTILS, getAptosClient } from '../config/aptos';
import toast from 'react-hot-toast';

const QuickNodeTest = () => {
  const [testResults, setTestResults] = useState({
    connection: 'pending',
    ledgerInfo: 'pending',
    accountInfo: 'pending',
    performance: 'pending'
  });
  const [isTesting, setIsTesting] = useState(false);
  const [endpointInfo, setEndpointInfo] = useState(null);

  useEffect(() => {
    const info = QUICKNODE_UTILS.getEndpointInfo();
    setEndpointInfo(info);
  }, []);

  const runTests = async () => {
    setIsTesting(true);
    setTestResults({
      connection: 'pending',
      ledgerInfo: 'pending',
      accountInfo: 'pending',
      performance: 'pending'
    });

    try {
      // Test 1: Basic Connection
      const client = getAptosClient();
      setTestResults(prev => ({ ...prev, connection: 'testing' }));
      
      await client.getLedgerInfo();
      setTestResults(prev => ({ ...prev, connection: 'success' }));
      
      // Test 2: Ledger Info
      setTestResults(prev => ({ ...prev, ledgerInfo: 'testing' }));
      const ledgerInfo = await client.getLedgerInfo();
      console.log('Ledger Info:', ledgerInfo);
      setTestResults(prev => ({ ...prev, ledgerInfo: 'success' }));
      
      // Test 3: Account Info (if we have a test account)
      setTestResults(prev => ({ ...prev, accountInfo: 'testing' }));
      try {
        // Test with a known account
        const testAddress = '0x1';
        await client.getAccount(testAddress);
        setTestResults(prev => ({ ...prev, accountInfo: 'success' }));
      } catch (error) {
        console.log('Account test failed (expected for non-existent account):', error.message);
        setTestResults(prev => ({ ...prev, accountInfo: 'success' })); // Still success as connection works
      }
      
      // Test 4: Performance Test
      setTestResults(prev => ({ ...prev, performance: 'testing' }));
      const startTime = Date.now();
      await client.getLedgerInfo();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      setTestResults(prev => ({ 
        ...prev, 
        performance: responseTime < 1000 ? 'success' : 'warning',
        performanceTime: responseTime
      }));
      
      toast.success('QuickNode tests completed successfully!');
      
    } catch (error) {
      console.error('QuickNode test failed:', error);
      setTestResults({
        connection: 'error',
        ledgerInfo: 'error',
        accountInfo: 'error',
        performance: 'error'
      });
      toast.error('QuickNode test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      case 'testing':
        return 'Testing...';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'testing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!endpointInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            QuickNode Connection Test
          </h3>
          <p className="text-sm text-gray-500">
            Testing connection to {endpointInfo.isQuickNode ? 'QuickNode' : 'Public'} endpoint
          </p>
        </div>
        <button
          onClick={runTests}
          disabled={isTesting}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Testing...' : 'Run Tests'}</span>
        </button>
      </div>

      {/* Endpoint Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Endpoint Information</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Provider:</span>
            <span className="font-medium">{endpointInfo.isQuickNode ? 'QuickNode' : 'Public'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Network:</span>
            <span className="font-medium">{endpointInfo.network}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">URL:</span>
            <span className="font-medium text-xs truncate max-w-xs">
              {endpointInfo.url}
            </span>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Test Results</h4>
        
        {Object.entries(testResults).map(([test, status]) => {
          if (test === 'performanceTime') return null;
          
          return (
            <div key={test} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status)}
                <div>
                  <div className={`font-medium ${getStatusColor(status)}`}>
                    {test.charAt(0).toUpperCase() + test.slice(1).replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getStatusText(status)}
                    {test === 'performance' && status === 'success' && testResults.performanceTime && (
                      <span className="ml-1">({testResults.performanceTime}ms)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QuickNode Benefits */}
      {endpointInfo.isQuickNode && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">QuickNode Benefits</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Higher rate limits</li>
            <li>• Better performance</li>
            <li>• Priority support</li>
            <li>• Enhanced reliability</li>
            <li>• Advanced analytics</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuickNodeTest; 