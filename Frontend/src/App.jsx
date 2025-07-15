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
  Bot,
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
  const [showChatbot, setShowChatbot] = useState(false);

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
          {/* Floating Chatbot Button */}
          <button
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-cyan-500 to-pink-500 text-white rounded-full shadow-2xl p-3 flex items-center justify-center transition-all duration-300 focus:outline-none hover:scale-110 border-4 border-white/10"
            onClick={() => setShowChatbot((prev) => !prev)}
            aria-label="Open Chatbot"
          >
            <Bot size={22} />
          </button>
          {/* Chatbot Popup */}
          {showChatbot && (
            <div className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-md bg-[#18181c] border border-[#23232a] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#23232a] bg-gradient-to-r from-cyan-700/80 to-pink-700/80">
                <div className="flex items-center gap-3">
                  <ChatbotAvatar />
                  <span className="font-bold text-lg text-white">
                    SafeSwap AI Chatbot
                  </span>
                </div>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#23232a] text-gray-400 hover:text-red-400 hover:bg-[#23232a]/80 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                  onClick={() => setShowChatbot(false)}
                  aria-label="Close Chatbot"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="block mx-auto"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {/* Chat History Placeholder */}
              <div className="flex-1 px-5 py-4 bg-[#18181c] overflow-y-auto max-h-96 custom-scrollbar">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <ChatbotAvatar />
                    <div className="bg-[#23232a] rounded-2xl px-4 py-2 text-gray-200 text-sm shadow">
                      Hi 👋! This is a placeholder for the future AI-powered
                      assistant.
                      <br />
                      You will be able to chat with SafeSwap AI here soon.
                    </div>
                  </div>
                  {/* Example user message */}
                  <div className="flex items-end gap-3 justify-end">
                    <div className="bg-cyan-600 rounded-2xl px-4 py-2 text-white text-sm shadow self-end">
                      How can you help me?
                    </div>
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                      U
                    </div>
                  </div>
                </div>
              </div>
              {/* Input */}
              <form className="px-5 py-3 border-t border-[#23232a] bg-[#18181c] flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-xl bg-[#23232a] border border-[#23232a] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition disabled:opacity-60"
                  placeholder="Type your message... (coming soon)"
                  disabled
                />
                <button
                  type="button"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl font-semibold transition disabled:opacity-60"
                  disabled
                >
                  Send
                </button>
              </form>
            </div>
          )}
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

// Chatbot Avatar SVG
const ChatbotAvatar = () => (
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-pink-400 flex items-center justify-center shadow-lg">
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 15s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  </div>
);

export default App;
