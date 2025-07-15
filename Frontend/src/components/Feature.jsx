import React, { useState, useEffect } from "react";
import { ShieldCheck, ArrowRightLeft, CheckCircle } from "lucide-react";

// Helper component for consistent list items
const FeatureListItem = ({ children }) => (
  <li className="flex items-start space-x-3">
    <CheckCircle className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />
    <span className="text-gray-300">{children}</span>
  </li>
);

const Feature = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Feature...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white px-4 py-20 sm:py-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Our Core Features
          </h1>
          <p className="text-lg md:text-xl text-gray-400">
            Discover the technology that makes SafeSwap the most secure and
            user-friendly platform on Aptos.
          </p>
        </div>

        {/* Features Sections */}
        <div className="space-y-24">
          {/* Feature 1: Detection */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative flex items-center justify-center p-8">
              {/* Background rings */}
              <div className="absolute w-64 h-64 bg-cyan-500/10 rounded-full animate-ping" />
              <div className="absolute w-48 h-48 bg-cyan-500/10 rounded-full animate-ping delay-200" />

              {/* Central Icon */}
              <div className="relative bg-[#18181c]/80 backdrop-blur-sm border border-[#23232a] w-56 h-56 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-28 h-28 text-cyan-400" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                AI-Powered Threat Detection
              </h2>
              <p className="text-gray-400 mb-6">
                Our system analyzes tokens before you swap, providing a
                comprehensive risk score to protect you from potential scams and
                financial losses.
              </p>
              <ul className="space-y-4 text-left">
                <FeatureListItem>
                  <strong>Real-Time Analysis:</strong> Scans contracts and
                  transaction histories for malicious code and suspicious
                  patterns.
                </FeatureListItem>
                <FeatureListItem>
                  <strong>Comprehensive Risk Score:</strong> Get clear warnings
                  on honeypots, rug pulls, and abnormal trading activity.
                </FeatureListItem>
                <FeatureListItem>
                  <strong>Continuous Learning:</strong> Our detection models are
                  constantly updated to counter the latest threats in the crypto
                  space.
                </FeatureListItem>
              </ul>
            </div>
          </div>

          {/* Feature 2: Swap Token */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left md:order-last">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Seamless & Secure Swapping
              </h2>
              <p className="text-gray-400 mb-6">
                An intuitive interface built on the high-speed Aptos blockchain,
                ensuring every transaction is fast, cheap, and transparent.
              </p>
              <ul className="space-y-4 text-left">
                <FeatureListItem>
                  <strong>Intuitive Interface:</strong> Displays real-time price
                  feeds, slippage, and fees before you confirm any transaction.
                </FeatureListItem>
                <FeatureListItem>
                  <strong>High-Speed & Low-Cost:</strong> Leverages the
                  efficiency of Aptos for near-instant execution and minimal
                  fees.
                </FeatureListItem>
                <FeatureListItem>
                  <strong>Transparent Analytics:</strong> Access a complete
                  breakdown of your swap history and performance in your
                  dashboard.
                </FeatureListItem>
              </ul>
            </div>

            {/* Visual Mockup */}
            <div className="flex items-center justify-center md:order-first">
              <div className="bg-[#18181c]/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-[#23232a] w-full max-w-sm">
                <div className="rounded-2xl bg-[#111112] p-5 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-semibold text-white/80">
                      1,000
                    </div>
                    <div className="flex items-center bg-cyan-600 text-white rounded-full px-4 py-2 font-medium text-lg">
                      APT
                    </div>
                  </div>
                </div>
                <div className="flex justify-center -my-4 z-10 relative">
                  <div className="bg-[#18181c] border-4 border-[#18181c] rounded-full w-10 h-10 flex items-center justify-center">
                    <ArrowRightLeft size={20} className="text-white" />
                  </div>
                </div>
                <div className="rounded-2xl bg-[#111112] p-5 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-semibold text-white/80">
                      3,408
                    </div>
                    <div className="flex items-center bg-pink-500 text-white rounded-full px-4 py-2 font-medium text-lg">
                      USDC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Experience the future of secure and seamless token swapping. Your
            safe journey into DeFi begins now.
          </p>
          <a
            href="/swap"
            className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 inline-block text-lg"
          >
            Try SafeSwap Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Feature;
