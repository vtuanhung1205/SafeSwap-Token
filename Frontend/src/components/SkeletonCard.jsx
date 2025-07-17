// components/SkeletonCard.js
import React from "react";
import { BarChart3 } from "lucide-react";

const SkeletonCard = () => (
  <div className="flex-1 bg-[#18181c] border border-[#23232a] rounded-2xl p-8 animate-pulse">
    <div className="flex flex-col items-center mb-6">
      <div className="bg-gray-700 p-4 rounded-full w-20 h-20 mb-4"></div>
      <div className="h-6 bg-gray-700 rounded w-2/5 mb-3"></div>
      <div className="h-8 bg-gray-700 rounded w-3/5"></div>
    </div>
    <div className="space-y-3 mb-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
        </div>
      ))}
    </div>
    <div className="h-12 bg-gray-700 rounded-xl w-full"></div>
  </div>
);

export default SkeletonCard;