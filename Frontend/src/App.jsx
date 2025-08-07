import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from '@react-oauth/google';
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
import PagePrivacy from "./components/pages/PagePrivacy";
import NotFoundPage from "./components/NotFoundPage/NotFoundPage";
import WalletAdapterDemo from "./components/WalletAdapterDemo";
import AptosKeylessAuthDemo from "./components/pages/AptosKeylessAuthDemo";
import "./index.css";

// Icons
import {
  Bot,
} from "lucide-react";
// Import pages
import Home from "./components/pages/Home";
import Wallet from "./components/pages/Wallet";
import Settings from "./components/pages/Settings";
import Pricing from "./components/pages/Pricing";
import Payment from "./components/pages/Payment";
import DemoPage from "./components/DemoPage";
import AptosConnectCallback from "./components/pages/AptosConnectCallback";

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
    <div className="min-h-screen flex flex-col background-animated">
      <Navbar />
      <main className="flex-1 relative z-10">
        <Routes>
          <Route
            path="/"
            element={<Home />}
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
          <Route path="/privacy-policy" element={<PagePrivacy />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/aptos-connect-callback" element={<AptosConnectCallback />} />
          <Route path="/wallet-adapter-demo" element={<WalletAdapterDemo />} />
          <Route path="/keyless-auth-demo" element={<AptosKeylessAuthDemo />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
          },
        }}
      />

      {/* Chatbot Avatar */}
      <ChatbotAvatar />

      {/* Demo Badge */}
      <DemoBadge />
    </div>
  );
}

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
