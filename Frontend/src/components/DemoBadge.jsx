import React from 'react';
import { Sparkles } from 'lucide-react';

const DemoBadge = ({ isDemoMode = false }) => {
  if (!isDemoMode) return null;

  return (
    <div className="inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full">
      <Sparkles size={12} />
      <span>DEMO MODE</span>
    </div>
  );
};

export default DemoBadge; 