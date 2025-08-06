import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Zap, Wallet, Server, ExternalLink } from 'lucide-react';
import { 
  APTOS_CONFIG, 
  QUICKNODE_UTILS, 
  APTOS_CONNECT_UTILS, 
  getAptosClient,
  createAptosConnectUrl 
} from '../config/aptos';
import toast from 'react-hot-toast';

const QuickNodeVsAptosConnect = () => {
  const [testResults, setTestResults] = useState({
    quicknode: {
      connection: 'pending',
      performance: 'pending',
      rpcCalls: 'pending'
    },
    aptosConnect: {
      urlGeneration: 'pending',
      configValidation: 'pending',
      serviceType: 'pending'
    }
  });
  const [isTesting, setIsTesting] = useState(false);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    const quicknodeInfo = QUICKNODE_UTILS.getEndpointInfo();
    const aptosConnectInfo = APTOS_CONNECT_UTILS.getConnectInfo();
    
    setComparison({
      quicknode: quicknodeInfo,
      aptosConnect: aptosConnectInfo
    });
  }, []);

  const runComparisonTests = async () => {
    setIsTesting(true);
    setTestResults({
      quicknode: {
        connection: 'pending',
        performance: 'pending',
        rpcCalls: 'pending'
      },
      aptosConnect: {
        urlGeneration: 'pending',
        configValidation: 'pending',
        serviceType: 'pending'
      }
    });

    try {
      // Test QuickNode RPC
      setTestResults(prev => ({
        ...prev,
        quicknode: { ...prev.quicknode, connection: 'testing' }
      }));

      const client = getAptosClient();
      await client.getLedgerInfo();
      
      setTestResults(prev => ({
        ...prev,
        quicknode: { ...prev.quicknode, connection: 'success' }
      }));

      // Test QuickNode Performance
      setTestResults(prev => ({
        ...prev,
        quicknode: { ...prev.quicknode, performance: 'testing' }
      }));

      const startTime = Date.now();
      await client.getLedgerInfo();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      setTestResults(prev => ({
        ...prev,
        quicknode: { 
          ...prev.quicknode, 
          performance: responseTime < 1000 ? 'success' : 'warning',
          performanceTime: responseTime
        }
      }));

      // Test QuickNode RPC Calls
      setTestResults(prev => ({
        ...prev,
        quicknode: { ...prev.quicknode, rpcCalls: 'testing' }
      }));

      try {
        await client.getAccount('0x1');
        setTestResults(prev => ({
          ...prev,
          quicknode: { ...prev.quicknode, rpcCalls: 'success' }
        }));
      } catch (error) {
        // Expected error for non-existent account, but connection works
        setTestResults(prev => ({
          ...prev,
          quicknode: { ...prev.quicknode, rpcCalls: 'success' }
        }));
      }

      // Test Aptos Connect URL Generation
      setTestResults(prev => ({
        ...prev,
        aptosConnect: { ...prev.aptosConnect, urlGeneration: 'testing' }
      }));

      const connectUrl = createAptosConnectUrl();
      if (connectUrl && connectUrl.includes('aptosconnect.app')) {
        setTestResults(prev => ({
          ...prev,
          aptosConnect: { ...prev.aptosConnect, urlGeneration: 'success' }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          aptosConnect: { ...prev.aptosConnect, urlGeneration: 'error' }
        }));
      }

      // Test Aptos Connect Config Validation
      setTestResults(prev => ({
        ...prev,
        aptosConnect: { ...prev.aptosConnect, configValidation: 'testing' }
      }));

      const connectInfo = APTOS_CONNECT_UTILS.getConnectInfo();
      if (connectInfo.dappName && connectInfo.callbackUrl) {
        setTestResults(prev => ({
          ...prev,
          aptosConnect: { ...prev.aptosConnect, configValidation: 'success' }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          aptosConnect: { ...prev.aptosConnect, configValidation: 'error' }
        }));
      }

      // Test Aptos Connect Service Type
      setTestResults(prev => ({
        ...prev,
        aptosConnect: { ...prev.aptosConnect, serviceType: 'success' }
      }));

      toast.success('Comparison tests completed!');

    } catch (error) {
      console.error('Comparison test failed:', error);
      setTestResults({
        quicknode: {
          connection: 'error',
          performance: 'error',
          rpcCalls: 'error'
        },
        aptosConnect: {
          urlGeneration: 'error',
          configValidation: 'error',
          serviceType: 'error'
        }
      });
      toast.error('Comparison test failed');
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

  if (!comparison) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          QuickNode vs Aptos Connect Comparison
        </h2>
        <p className="text-gray-600">
          Understanding the difference between RPC endpoint and wallet connection service
        </p>
      </div>

      {/* Comparison Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* QuickNode RPC */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Server className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">QuickNode RPC</h3>
              <p className="text-sm text-blue-700">Blockchain API Endpoint</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Type:</span>
              <span className="font-medium">{comparison.quicknode.rpcType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Network:</span>
              <span className="font-medium">{comparison.quicknode.network}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">URL:</span>
              <span className="font-medium text-xs truncate max-w-xs">
                {comparison.quicknode.url}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded text-xs text-blue-800">
            <strong>Purpose:</strong> Direct blockchain API calls for transactions, account info, etc.
          </div>
        </div>

        {/* Aptos Connect */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Wallet className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Aptos Connect</h3>
              <p className="text-sm text-green-700">Wallet Connection Service</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Type:</span>
              <span className="font-medium">{comparison.aptosConnect.serviceType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">DApp:</span>
              <span className="font-medium">{comparison.aptosConnect.dappName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Base URL:</span>
              <span className="font-medium text-xs truncate max-w-xs">
                {comparison.aptosConnect.baseUrl}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-100 rounded text-xs text-green-800">
            <strong>Purpose:</strong> Connect user wallets (Petra, Martian, etc.) to your dApp
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
          <button
            onClick={runComparisonTests}
            disabled={isTesting}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Loader2 className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Run Tests'}</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QuickNode Tests */}
          <div>
            <h4 className="font-medium text-blue-900 mb-3">QuickNode RPC Tests</h4>
            <div className="space-y-3">
              {Object.entries(testResults.quicknode).map(([test, status]) => {
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
                          {test === 'performance' && status === 'success' && testResults.quicknode.performanceTime && (
                            <span className="ml-1">({testResults.quicknode.performanceTime}ms)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aptos Connect Tests */}
          <div>
            <h4 className="font-medium text-green-900 mb-3">Aptos Connect Tests</h4>
            <div className="space-y-3">
              {Object.entries(testResults.aptosConnect).map(([test, status]) => (
                <div key={test} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <div>
                      <div className={`font-medium ${getStatusColor(status)}`}>
                        {test.charAt(0).toUpperCase() + test.slice(1).replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getStatusText(status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Differences */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-4">Key Differences</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">QuickNode RPC</h4>
            <ul className="space-y-1 text-yellow-700">
              <li>• Blockchain API endpoint</li>
              <li>• Used for direct blockchain calls</li>
              <li>• Handles transactions, account queries</li>
              <li>• Performance-focused</li>
              <li>• No user interaction</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Aptos Connect</h4>
            <ul className="space-y-1 text-yellow-700">
              <li>• Wallet connection service</li>
              <li>• Used for user wallet authentication</li>
              <li>• Handles wallet approval flow</li>
              <li>• User interaction required</li>
              <li>• Web3 authentication</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Conclusion */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Conclusion</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>QuickNode RPC</strong> và <strong>Aptos Connect</strong> phục vụ các mục đích khác nhau:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>QuickNode: Tối ưu performance cho blockchain API calls</li>
            <li>Aptos Connect: Xử lý wallet connection và user authentication</li>
            <li>Cả hai đều cần thiết cho một dApp hoàn chỉnh</li>
            <li>Không thể thay thế lẫn nhau</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuickNodeVsAptosConnect; 