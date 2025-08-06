import React from "react";
import TokenList from "../TokenList";

const Docs = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Documentation</h1>
          
          {/* Token List Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Aptos Token List</h2>
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
              <TokenList />
            </div>
          </div>
          
          {/* Other documentation content */}
          <div className="space-y-8">
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
              <h3 className="text-xl font-bold mb-4">API Reference</h3>
              <p className="text-gray-400">
                Complete API documentation for SafeSwap integration.
              </p>
            </div>
            
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
              <h3 className="text-xl font-bold mb-4">Getting Started</h3>
              <p className="text-gray-400">
                Quick start guide for developers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
