import React from "react";

const LoadingScreen = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <span className="text-white text-xl font-bold">Đang chuyển trang...</span>
    </div>
  </div>
);

export default LoadingScreen;
