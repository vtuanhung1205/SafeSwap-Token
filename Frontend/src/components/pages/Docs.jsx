import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Code2, Shield, Rocket, Terminal, Copy, Check, ChevronRight, Zap, Lock } from "lucide-react";
import SEO from "../SEO";

const sections = [
  {
    id: "endpoints",
    icon: Terminal,
    title: "API Endpoints",
    color: "cyan",
    content: [
      { method: "POST", path: "/api/auth/login", desc: "Authenticate a user and receive JWT tokens" },
      { method: "POST", path: "/api/auth/register", desc: "Create a new SafeSwap account" },
      { method: "GET", path: "/api/swap/quote", desc: "Get a real-time swap quote with fees and slippage" },
      { method: "POST", path: "/api/swap/execute", desc: "Execute a token swap transaction" },
      { method: "GET", path: "/api/price/all", desc: "Fetch all current token prices" },
      { method: "POST", path: "/api/price/analyze", desc: "Run AI scam detection on a token address" },
    ],
  },
  {
    id: "quickstart",
    icon: Rocket,
    title: "Quick Start Guide",
    color: "pink",
    steps: [
      { title: "Create an Account", desc: "Register with your email or sign in with Google for instant Web2 access." },
      { title: "Connect Your Wallet", desc: "Link your Aptos wallet (Petra, Pontem, or Martian) for on-chain swaps." },
      { title: "Get a Quote", desc: "Select your token pair and amount — SafeSwap fetches live prices from CoinGecko and Binance." },
      { title: "Swap Securely", desc: "Our AI analyzes the target token in real-time before executing your transaction." },
    ],
  },
  {
    id: "security",
    icon: Shield,
    title: "Security Best Practices",
    color: "purple",
    tips: [
      { icon: Shield, text: "Always verify token contract addresses before swapping." },
      { icon: Zap, text: "Use the built-in AI scam detection to check token risk scores." },
      { icon: Lock, text: "Keep your wallet software and browser extensions up to date." },
      { icon: Code2, text: "Never share your private keys or seed phrases with anyone." },
    ],
  },
];

const codeExample = {
  request: `GET /api/swap/quote?fromToken=ETH&toToken=APT&amount=1.5

// Response: 200 OK`,
  response: `{
  "success": true,
  "data": {
    "quote": {
      "fromToken": "ETH",
      "toToken": "APT",
      "fromAmount": 1.5,
      "toAmount": 3408.12,
      "exchangeRate": 2272.08,
      "fee": 0.0045,
      "feeRate": 0.003,
      "priceImpact": 0.1
    }
  }
}`,
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all"
      aria-label="Copy code"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
};

const MethodBadge = ({ method }) => {
  const colors = {
    GET: "bg-green-500/15 text-green-400 border-green-500/20",
    POST: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    PUT: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    DELETE: "bg-red-500/15 text-red-400 border-red-500/20",
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
};

const Docs = () => {
  const [activeSection, setActiveSection] = useState("endpoints");

  return (
    <div className="min-h-screen pt-24 pb-20 text-white relative overflow-hidden">
      <SEO
        title="Documentation"
        description="Complete documentation for the SafeSwap API. Learn how to integrate token swaps, AI scam detection, and real-time pricing into your application."
        keywords="SafeSwap API, documentation, token swap API, DeFi API, Aptos API, blockchain development, scam detection API"
      />

      {/* Background orbs */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-40 left-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero */}
      <header className="max-w-5xl mx-auto text-center px-6 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6">
            <BookOpen size={14} /> Developer Documentation
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-5 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to integrate SafeSwap's secure token swapping and AI-powered scam detection into your application.
          </p>
        </motion.div>
      </header>

      {/* Nav tabs */}
      <nav className="max-w-5xl mx-auto px-6 mb-12" aria-label="Documentation sections">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeSection === s.id
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <s.icon size={16} />
              {s.title}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {activeSection === "endpoints" && (
            <motion.section
              key="endpoints"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              aria-labelledby="endpoints-heading"
            >
              <h2 id="endpoints-heading" className="text-2xl font-heading font-bold mb-6">API Endpoints</h2>
              <div className="space-y-3 mb-12">
                {sections[0].content.map((endpoint, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all"
                  >
                    <MethodBadge method={endpoint.method} />
                    <code className="text-sm font-mono text-gray-300 flex-1">{endpoint.path}</code>
                    <span className="text-xs text-gray-500 hidden sm:block">{endpoint.desc}</span>
                    <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
                  </motion.div>
                ))}
              </div>

              {/* Code example */}
              <h3 className="text-lg font-bold mb-4 text-gray-300">Example Request</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative rounded-2xl bg-[#0a0a0c] border border-white/[0.06] overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/[0.04] text-[10px] font-mono text-gray-500 uppercase tracking-wider">Request</div>
                  <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto">{codeExample.request}</pre>
                  <CopyButton text={codeExample.request} />
                </div>
                <div className="relative rounded-2xl bg-[#0a0a0c] border border-white/[0.06] overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/[0.04] text-[10px] font-mono text-gray-500 uppercase tracking-wider">Response</div>
                  <pre className="p-4 text-sm text-green-400/80 font-mono overflow-x-auto">{codeExample.response}</pre>
                  <CopyButton text={codeExample.response} />
                </div>
              </div>
            </motion.section>
          )}

          {activeSection === "quickstart" && (
            <motion.section
              key="quickstart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              aria-labelledby="quickstart-heading"
            >
              <h2 id="quickstart-heading" className="text-2xl font-heading font-bold mb-8">Quick Start Guide</h2>
              <div className="space-y-6">
                {sections[1].steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      {i < sections[1].steps.length - 1 && (
                        <div className="w-px flex-1 bg-gradient-to-b from-pink-500/20 to-transparent mt-2" />
                      )}
                    </div>
                    <div className="pb-8">
                      <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {activeSection === "security" && (
            <motion.section
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              aria-labelledby="security-heading"
            >
              <h2 id="security-heading" className="text-2xl font-heading font-bold mb-8">Security Best Practices</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {sections[2].tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-purple-500/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <tip.icon size={18} className="text-purple-400" />
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{tip.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Docs;
