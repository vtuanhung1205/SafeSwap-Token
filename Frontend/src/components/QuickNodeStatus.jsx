import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';
import { APTOS_CONFIG, QUICKNODE_UTILS } from '../config/aptos';

const QuickNodeStatus = () => {
  const [status, setStatus] = useState('checking');
  const [endpointInfo, setEndpointInfo] = useState(null);

  useEffect(() => {
    const checkQuickNodeStatus = async () => {
      try {
        const info = QUICKNODE_UTILS.getEndpointInfo();
        setEndpointInfo(info);
        
        if (info.isQuickNode) {
          // Test QuickNode connection
          const { AptosClient } = await import('aptos');
          const client = new AptosClient(info.url);
          
          // Test with a simple request
          await client.getLedgerInfo();
          setStatus('connected');
        } else {
          setStatus('using_public');
        }
      } catch (error) {
        console.error('QuickNode status check failed:', error);
        setStatus('error');
      }
    };

    checkQuickNodeStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'using_public':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'QuickNode Connected';
      case 'using_public':
        return 'Using Public Node';
      case 'error':
        return 'Connection Error';
      default:
        return 'Checking Status...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'using_public':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  if (!endpointInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </h3>
            <p className="text-sm text-gray-500">
              {endpointInfo.isQuickNode ? 'Enhanced Performance' : 'Standard Performance'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-400">
            {endpointInfo.isQuickNode ? 'QuickNode' : 'Public'}
          </div>
          <div className="text-xs text-gray-500">
            {endpointInfo.network}
          </div>
        </div>
      </div>
      
      {endpointInfo.isQuickNode && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          <strong>QuickNode Benefits:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Higher rate limits</li>
            <li>• Better performance</li>
            <li>• Priority support</li>
            <li>• Enhanced reliability</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuickNodeStatus; 