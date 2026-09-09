import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, ChevronDown, Copy, Check, Braces, ArrowRight } from "lucide-react";
import SEO from "../SEO";

const endpoints = [
  {
    method: "GET",
    path: "/api/swap/quote",
    summary: "Get a swap quote with live pricing",
    params: [
      { name: "fromToken", type: "string", required: true, desc: "Symbol of the source token (e.g. ETH)" },
      { name: "toToken", type: "string", required: true, desc: "Symbol of the target token (e.g. APT)" },
      { name: "amount", type: "number", required: true, desc: "Amount of source token to swap" },
    ],
    request: `GET /api/swap/quote?fromToken=ETH&toToken=APT&amount=1.5`,
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
      "feeRate": 0.003
    }
  }
}`,
  },
  {
    method: "POST",
    path: "/api/swap/execute",
    summary: "Execute a token swap transaction",
    params: [
      { name: "fromToken", type: "string", required: true, desc: "Symbol of the source token" },
      { name: "toToken", type: "string", required: true, desc: "Symbol of the target token" },
      { name: "fromAmount", type: "number", required: true, desc: "Amount to swap" },
      { name: "toAmount", type: "number", required: true, desc: "Expected amount to receive" },
      { name: "quoteId", type: "string", required: true, desc: "Quote identifier from /quote" },
    ],
    request: `POST /api/swap/execute
{
  "fromToken": "ETH",
  "toToken": "APT",
  "fromAmount": 1.5,
  "toAmount": 3408.12,
  "quoteId": "qt_abc123"
}`,
    response: `{
  "success": true,
  "data": {
    "transaction": {
      "hash": "0x7f3a...",
      "status": "pending",
      "fromToken": "ETH",
      "toToken": "APT"
    }
  }
}`,
  },
  {
    method: "POST",
    path: "/api/price/analyze",
    summary: "Run AI-powered scam detection on a token",
    params: [
      { name: "tokenAddress", type: "string", required: true, desc: "On-chain address of the token" },
      { name: "tokenName", type: "string", required: true, desc: "Token display name" },
      { name: "tokenSymbol", type: "string", required: true, desc: "Token ticker symbol" },
    ],
    request: `POST /api/price/analyze
{
  "tokenAddress": "0xf22bede...",
  "tokenName": "Tether",
  "tokenSymbol": "USDT"
}`,
    response: `{
  "success": true,
  "data": {
    "analysis": {
      "isScam": false,
      "riskScore": 12,
      "confidence": 88,
      "reasons": ["Low risk profile"]
    }
  }
}`,
  },
  {
    method: "GET",
    path: "/api/price/all",
    summary: "Fetch all current token prices",
    params: [],
    request: `GET /api/price/all`,
    response: `{
  "success": true,
  "data": {
    "APT": { "price": 6.42, "change24h": 3.2 },
    "ETH": { "price": 2272.08, "change24h": 1.8 }
  }
}`,
  },
];

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all" aria-label="Copy code">
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
};

const MethodBadge = ({ method }) => {
  const colors = {
    GET: "bg-green-500/15 text-green-400 border-green-500/20",
    POST: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
};

const EndpointCard = ({ endpoint, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("request");

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.1] transition-colors"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-5 text-left"
        aria-expanded={isOpen}
      >
        <MethodBadge method={endpoint.method} />
        <code className="text-sm font-mono text-white flex-1">{endpoint.path}</code>
        <span className="text-xs text-gray-500 hidden sm:block max-w-xs truncate">{endpoint.summary}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/[0.04] pt-5 space-y-5">
              <p className="text-sm text-gray-400">{endpoint.summary}</p>

              {/* Parameters */}
              {endpoint.params.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Parameters</h4>
                  <div className="space-y-2">
                    {endpoint.params.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <code className="text-cyan-400 font-mono text-xs bg-cyan-500/5 px-2 py-0.5 rounded">{p.name}</code>
                        <span className="text-gray-600 text-xs">{p.type}</span>
                        {p.required && <span className="text-[10px] text-red-400/70 font-medium">required</span>}
                        <span className="text-gray-500 text-xs flex-1">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code tabs */}
              <div>
                <div className="flex gap-1 mb-3">
                  {["request", "response"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                        tab === t ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="relative rounded-xl bg-[#0a0a0c] border border-white/[0.04] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.03]">
                    <span className="text-[10px] font-mono text-gray-600 uppercase">{tab}</span>
                    <CopyButton text={tab === "request" ? endpoint.request : endpoint.response} />
                  </div>
                  <pre className={`p-4 text-xs font-mono overflow-x-auto ${tab === "response" ? "text-green-400/80" : "text-gray-300"}`}>
                    {tab === "request" ? endpoint.request : endpoint.response}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

const APIReference = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 text-white relative overflow-hidden">
      <SEO
        title="API Reference"
        description="Complete API reference for SafeSwap. Explore endpoints for token swaps, real-time pricing, AI scam detection, and wallet management on the Aptos blockchain."
        keywords="SafeSwap API reference, REST API, token swap endpoint, scam detection API, DeFi API documentation, Aptos blockchain API"
      />

      {/* Background */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero */}
      <header className="max-w-4xl mx-auto text-center px-6 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Braces size={14} /> REST API v1.0
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-5 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            API Reference
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Detailed reference for every SafeSwap endpoint. Includes parameters, example requests, and response schemas.
          </p>
        </motion.div>
      </header>

      {/* Base URL */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm">
          <span className="text-gray-500 font-medium">Base URL</span>
          <ArrowRight size={14} className="text-gray-600" />
          <code className="text-cyan-400 font-mono">https://safeswap-token-backend.onrender.com/api</code>
        </div>
      </div>

      {/* Endpoints */}
      <div className="max-w-4xl mx-auto px-6 space-y-3">
        {endpoints.map((endpoint, i) => (
          <EndpointCard key={i} endpoint={endpoint} index={i} />
        ))}
      </div>
    </div>
  );
};

export default APIReference;
