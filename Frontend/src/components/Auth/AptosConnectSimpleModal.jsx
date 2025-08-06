import React from 'react';
import { X } from 'lucide-react';
import AptosConnectSimple from './AptosConnectSimple';

const AptosConnectSimpleModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const handleSuccess = (walletData) => {
    if (onSuccess) {
      onSuccess(walletData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Connect Aptos Wallet
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <AptosConnectSimple 
            onSuccess={handleSuccess}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default AptosConnectSimpleModal; 