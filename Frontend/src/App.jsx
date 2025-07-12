import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer';
import SwapForm from './components/SwapForm';
import Dashboard from './components/Dashboard/Dashboard';
import DemoBadge from './components/DemoBadge';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/swap" element={<SwapPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Demo Badge */}
          <DemoBadge />
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#18181c',
                color: '#fff',
                border: '1px solid #23232a',
              },
              success: {
                iconTheme: {
                  primary: '#06b6d4',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Home Page Component
const HomePage = () => {
  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-pink-900/20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            SafeSwap
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The safest way to swap tokens on Aptos with real-time scam detection and secure authentication
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/swap"
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Swapping
            </a>
            <a
              href="#features"
              className="px-8 py-4 border border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white font-bold rounded-2xl transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose SafeSwap?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🛡️"
              title="Real-time Scam Detection"
              description="Advanced AI-powered analysis to detect and warn about potentially dangerous tokens before you swap."
            />
            <FeatureCard
              icon="🔐"
              title="Secure Authentication"
              description="Multiple authentication options including Google OAuth and JWT for maximum security."
            />
            <FeatureCard
              icon="⚡"
              title="Lightning Fast"
              description="Built on Aptos blockchain for ultra-fast transactions with minimal fees."
            />
            <FeatureCard
              icon="📊"
              title="Live Price Data"
              description="Real-time price feeds and market data to help you make informed decisions."
            />
            <FeatureCard
              icon="📱"
              title="User-Friendly"
              description="Intuitive interface designed for both beginners and experienced traders."
            />
            <FeatureCard
              icon="📈"
              title="Swap History"
              description="Complete transaction history and analytics to track your trading performance."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// Swap Page Component
const SwapPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <SwapForm />
    </div>
  );
};

// Dashboard Page Component
const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Dashboard />
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-[#18181c] border border-[#23232a] rounded-2xl p-6 hover:border-cyan-600 transition-colors duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default App;
