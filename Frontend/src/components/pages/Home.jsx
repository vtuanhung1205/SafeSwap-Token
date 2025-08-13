import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, TrendingUp, Shield, Zap, Users, Star, CheckCircle } from 'lucide-react';
import WalletConnect from '../WalletConnect';
import SwapForm from '../SwapForm';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Trading",
      description: "Advanced security protocols ensure your assets are always protected"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Execute trades instantly with our optimized blockchain infrastructure"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Best Rates",
      description: "Get the best exchange rates with our advanced routing system"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              SafeSwap
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              The most secure and efficient way to swap tokens on Aptos blockchain
            </p>
            
            {/* Feature Highlight */}
            <div className="mb-12 p-6 bg-[#1c1c24] rounded-2xl border border-[#2a2a35] max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-4">
                {features[currentFeature].icon}
                <h3 className="text-xl font-semibold">{features[currentFeature].title}</h3>
              </div>
              <p className="text-gray-400">{features[currentFeature].description}</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-semibold text-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-105">
                  Get Started
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <WalletConnect />
                  <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                    View Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#0f0f11]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-[#1c1c24] rounded-2xl border border-[#2a2a35]">
              <div className="text-3xl font-bold text-cyan-400 mb-2">$50M+</div>
              <div className="text-gray-400">Total Volume</div>
            </div>
            <div className="text-center p-6 bg-[#1c1c24] rounded-2xl border border-[#2a2a35]">
              <div className="text-3xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="text-center p-6 bg-[#1c1c24] rounded-2xl border border-[#2a2a35]">
              <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose SafeSwap?</h2>
            <p className="text-xl text-gray-400">Built for the future of decentralized finance</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-[#1c1c24] rounded-2xl border border-[#2a2a35] hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Maximum Security</h3>
              <p className="text-gray-400">Advanced encryption and multi-layer security protocols protect your assets</p>
            </div>
            
            <div className="p-6 bg-[#1c1c24] rounded-2xl border border-[#2a2a35] hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-gray-400">Execute trades in milliseconds with our optimized blockchain infrastructure</p>
            </div>
            
            <div className="p-6 bg-[#1c1c24] rounded-2xl border border-[#2a2a35] hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Best Rates</h3>
              <p className="text-gray-400">Get the most competitive rates with our advanced routing system</p>
            </div>
            
            <div className="p-6 bg-[#1c1c24] rounded-2xl border border-[#2a2a35] hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">User Friendly</h3>
              <p className="text-gray-400">Intuitive interface designed for both beginners and advanced users</p>
            </div>
            
            <div className="p-6 bg-[#1c1c24] rounded-2xl border border-[#2a2a35] hover:border-yellow-500/50 transition-all">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Support</h3>
              <p className="text-gray-400">24/7 customer support to help you with any questions</p>
            </div>
            
            <div className="p-6 bg-[#1c1c24] rounded-2xl border border-[#2a2a35] hover:border-red-500/50 transition-all">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Audited & Safe</h3>
              <p className="text-gray-400">Regular security audits ensure the highest level of safety</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of users already trading on SafeSwap</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated ? (
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-semibold text-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-105">
                Connect Wallet
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <WalletConnect />
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                  View Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 