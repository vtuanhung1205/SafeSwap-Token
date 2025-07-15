import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer";
import SwapForm from "./components/SwapForm";
import Dashboard from "./components/Dashboard/Dashboard";
import DemoBadge from "./components/DemoBadge";
import OurStory from "./components/pages/OurStory";
import Feature from "./components/Feature";
import About from "../src/components/pages/About";
import Docs from "./components/pages/Docs";
import APIReference from "./components/pages/APIReference";
import Community from "./components/pages/Community";
import HelpCenter from "./components/pages/HelpCenter";
import ContactUs from "./components/pages/ContactUs";
import TermsOfUse from "./components/pages/TermsOfUse";
import PrivacyPolicy from "./components/pages/PrivacyPolicy";
import "./index.css";
// Icons
import {
  ShieldCheck,
  Lock,
  Zap,
  BarChart2,
  Smartphone,
  History,
  ArrowUpDown,
  CheckCircle,
} from "lucide-react";

// --- Custom Hook to Track Mouse Position ---
const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return position;
};

// --- Main App Component ---
function App() {
  const mousePosition = useMousePosition();

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col background-animated">
          <Navbar />

          <main className="flex-1 relative z-10">
            <Routes>
              <Route
                path="/"
                element={<HomePage mousePosition={mousePosition} />}
              />
              <Route path="/swap" element={<SwapPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/feature" element={<Feature />} />
              <Route path="/about" element={<About />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/api-reference" element={<APIReference />} />
              <Route path="/community" element={<Community />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
          <DemoBadge />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#18181c",
                color: "#fff",
                border: "1px solid #23232a",
              },
              success: { iconTheme: { primary: "#06b6d4", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// --- Redesigned Home Page with Spotlight Effect ---
const HomePage = ({ mousePosition }) => {
  return (
    <div className="bg-transparent text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-6">
        {/* Interactive Spotlight Effect */}
        <div
          className="pointer-events-none fixed inset-0 z-0 transition duration-300"
          style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
          }}
        />

        <div className="relative z-10 container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              SafeSwap
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
              The smartest way to swap tokens on Aptos with real-time scam
              detection and institutional-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/swap"
                className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                Launch App
              </a>
              <a
                href="/feature"
                className="px-8 py-4 border border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white font-bold rounded-2xl transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Visual Mockup of the SwapForm */}
          <div className="hidden lg:block bg-[#18181c]/50 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-[#23232a] scale-90">
            <div className="rounded-2xl bg-[#111112] p-5 mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Sell</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-semibold text-white/50">
                  1,000.0
                </div>
                <div className="flex items-center bg-cyan-600 text-white rounded-full px-4 py-2 ml-2 font-medium text-lg">
                  <img
                    src="https://s2.coinmarketcap.com/static/img/coins/200x200/21794.png"
                    alt="APT"
                    className="w-6 h-6 mr-2"
                  />{" "}
                  APT
                </div>
              </div>
            </div>
            <div className="flex justify-center -my-4 z-10 relative">
              <div className="bg-[#18181c] border border-[#23232a] rounded-full w-10 h-10 flex items-center justify-center">
                <ArrowUpDown size={20} className="text-white" />
              </div>
            </div>
            <div className="rounded-2xl bg-[#111112] p-5 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Buy</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-semibold text-white/50">
                  3,408.12
                </div>
                <div className="flex items-center bg-pink-500 text-white rounded-full px-4 py-2 ml-2 font-medium text-lg">
                  <img
                    src="https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png"
                    alt="USDC"
                    className="w-6 h-6 mr-2"
                  />{" "}
                  USDC
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-2xl flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-green-400 text-sm font-medium">
                Token appears safe
              </span>
            </div>
            <div className="w-full mt-4 py-3 rounded-2xl bg-gray-600 text-white font-bold text-lg text-center">
              Swap
            </div>
          </div>
        </div>
      </section>

      {/* Other sections remain the same, but will now render on top of the new background */}
      {/* ... (Features, How It Works, CTA sections) ... */}
    </div>
  );
};

// --- Page Components (Wrappers) ---
const SwapPage = () => (
  <div className="min-h-screen bg-transparent">
    <SwapForm />
  </div>
);
const DashboardPage = () => (
  <div className="min-h-screen bg-transparent text-white">
    <Dashboard />
  </div>
);

// --- Redesigned Feature Card Component ---
const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-[#18181c] border border-[#23232a] rounded-2xl p-6 flex flex-col items-center text-center shadow-lg transition-all duration-300 hover:border-cyan-500/50 hover:scale-105">
      <div className="bg-gray-800 p-4 rounded-full text-3xl mb-4">
        <Icon />
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

export default App;
