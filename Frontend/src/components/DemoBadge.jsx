import React from 'react';
import { DEMO_CONFIG } from '../config/demo';

const DemoBadge = () => {
  if (!DEMO_CONFIG.showDemoBadge) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          <span className="text-sm font-bold">DEMO MODE</span>
        </div>
      </div>
    </div>
  );
};

export default DemoBadge; 