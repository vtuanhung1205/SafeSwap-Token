import React from 'react';
import { X } from 'lucide-react';
import AptosConnectLogin from './AptosConnectLogin';

const AptosConnectModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const handleSuccess = (walletData) => {
    if (onSuccess) {
      onSuccess(walletData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-6 w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* Aptos Connect Login Component */}
        <AptosConnectLogin onSuccess={handleSuccess} onClose={onClose} />
      </div>
    </div>
  );
};

export default AptosConnectModal; 