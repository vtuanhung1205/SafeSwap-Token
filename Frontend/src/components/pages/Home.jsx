import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Users, TrendingUp } from "lucide-react";
import SwapForm from "../SwapForm";
import Feature from "../Feature";
import DemoBadge from "../DemoBadge";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center">
            <DemoBadge />
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              SafeSwap
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Token
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The most secure and efficient token swapping platform on Aptos blockchain. 
              Swap tokens instantly with advanced security features and real-time price feeds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/swap"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Start Swapping
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-4 border-2 border-cyan-500 text-cyan-400 font-semibold rounded-xl hover:bg-cyan-500 hover:text-white transition-all duration-300"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-600 text-gray-300 font-semibold rounded-xl hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose SafeSwap?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built with security, speed, and user experience in mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35] hover:border-cyan-500/50 transition">
              <Shield className="text-cyan-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Advanced Security</h3>
              <p className="text-gray-400">
                Multi-layer security with AI-powered fraud detection and real-time monitoring
              </p>
            </div>
            
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35] hover:border-cyan-500/50 transition">
              <Zap className="text-purple-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Instant swaps with sub-second transaction times on Aptos blockchain
              </p>
            </div>
            
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35] hover:border-cyan-500/50 transition">
              <TrendingUp className="text-green-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Best Rates</h3>
              <p className="text-gray-400">
                Get the best rates by aggregating multiple DEXs and liquidity pools
              </p>
            </div>
            
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35] hover:border-cyan-500/50 transition">
              <Users className="text-pink-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">User Friendly</h3>
              <p className="text-gray-400">
                Intuitive interface designed for both beginners and advanced users
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Swap Form Section */}
      <section className="py-20 bg-[#111112]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Start Swapping Now
            </h2>
            <p className="text-xl text-gray-400">
              Connect your wallet and swap tokens instantly
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <SwapForm />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience the Future of Trading?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust SafeSwap for their token trading needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/swap"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center px-8 py-4 border-2 border-gray-600 text-gray-300 font-semibold rounded-xl hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 