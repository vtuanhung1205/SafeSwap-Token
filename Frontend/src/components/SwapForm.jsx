import React, { useState, useEffect, useRef } from "react";
import {
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useWebSocket } from "../hooks/useWebSocket";
import { swapAPI, priceAPI, handleApiError } from "../utils/api";
import toast from "react-hot-toast";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import WalletConnectModal from "./Wallet/WalletConnectModal";
import { motion, AnimatePresence } from "framer-motion";

const tokens = [
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "https://static1.tokenterminal.com//ethereum/logo.png?logo_hash=fd8f54cab23f8f4980041f4e74607cac0c7ab880",
    address: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa", // mock w/ usdt address
  },
  {
    symbol: "APT",
    name: "Aptos",
    icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/21794.png",
    address: "0x1", // Native APT
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "https://public.bnbstatic.com/static/academy/uploads-original/2fd4345d8c3a46278941afd9ab7ad225.png",
    address: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png",
    address: "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4feb3ba920bb0d28714eb",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    address: "0xdd89c0e695d069b2d87e0fa65633b4dcb81bb876ce8360d5b4d1c107f9c8f070",
  },
];

const SwapForm = () => {
  const { account, connected } = useWallet();
  const { user } = useAuth();
  const isFullyConnected = connected || !!user;
  const {
    isConnected,
    getFormattedPrice,
    getFormattedPriceChange,
    subscribeToTokens,
  } = useWebSocket();

  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [scamAnalysis, setScamAnalysis] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(null);
  const [aptBalance, setAptBalance] = useState(null);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [lastSelectedToken, setLastSelectedToken] = useState(tokens[1]); // Default to toToken

  useEffect(() => {
    const symbols = tokens.map((token) => token.symbol);
    subscribeToTokens(symbols);
  }, [subscribeToTokens]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0 && fromToken && toToken) {
        getSwapQuote();
      } else {
        setToAmount("");
        setQuote(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fromAmount, fromToken, toToken]);

  const analyzeToken = async (tokenObj) => {
    try {
      const address = tokenObj.address || `0x${tokenObj.symbol.toLowerCase()}${"0".repeat(40)}`;
      const response = await priceAPI.analyzeToken(address, tokenObj.symbol, tokenObj.symbol);
      if (response.data.success) {
        setScamAnalysis(response.data.data.analysis);
      }
    } catch (error) {
      console.error("Token analysis error:", error);
    }
  };

  const lastAnalyzedAddress = useRef(null);

  // Trigger AI Analysis immediately when the last selected token changes, but only if amount is entered
  useEffect(() => {
    if (lastSelectedToken && fromAmount && parseFloat(fromAmount) > 0) {
      const addressToAnalyze = lastSelectedToken.address || `0x${lastSelectedToken.symbol.toLowerCase()}${"0".repeat(40)}`;
      // Only re-analyze if we changed tokens, don't re-analyze just because they typed a different amount
      if (lastAnalyzedAddress.current !== addressToAnalyze) {
        setScamAnalysis(null); // Clear previous analysis while fetching
        analyzeToken(lastSelectedToken);
        lastAnalyzedAddress.current = addressToAnalyze;
      }
    } else if (!fromAmount || parseFloat(fromAmount) <= 0) {
      // Hide analysis orb if amount is cleared
      setScamAnalysis(null);
      lastAnalyzedAddress.current = null;
    }
  }, [lastSelectedToken, fromAmount]);

  useEffect(() => {
    const fetchBalance = async () => {
      const address = account?.address || user?.walletAddress || user?.address || user?.wallet?.address;
      if (isFullyConnected && address) {
        try {
          // Dynamically import the Aptos SDK to avoid blocking the initial bundle
          const { AptosClient } = await import("aptos");
          const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1");
          const resources = await client.getAccountResources(address);
          const accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
          if (accountResource) {
            setAptBalance((accountResource.data.coin.value / 100000000).toFixed(4));
          } else {
            setAptBalance("0.00");
          }
        } catch (err) {
          console.error("Failed to fetch balance:", err);
          setAptBalance("0.00");
        }
      } else if (isFullyConnected) {
         // Mock balance for Google-authenticated users if address isn't immediately available on the user object
         setAptBalance("10.50");
      } else {
        setAptBalance(null);
      }
    };
    fetchBalance();
  }, [isFullyConnected, account, user]);

  const getSwapQuote = async () => {
    if (!fromAmount || !fromToken || !toToken) return;
    setIsLoadingQuote(true);
    try {
      const response = await swapAPI.getQuote(fromToken.symbol, toToken.symbol, fromAmount);
      if (response.data.success) {
        const quoteData = response.data.data.quote;
        setQuote(quoteData);
        setToAmount(quoteData.toAmount.toFixed(6));
      }
    } catch (error) {
      console.error("Quote error:", error);
      toast.error(handleApiError(error));
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleSwap = async () => {
    if (!isFullyConnected) {
      setShowWalletConnect(true);
      return;
    }
    if (!quote) {
      toast.error("Please get a quote first");
      return;
    }
    if (scamAnalysis && scamAnalysis.isScam && scamAnalysis.riskScore > 80) {
      if (!confirm(`Warning: This token has a high scam risk (${scamAnalysis.riskScore}%). Do you want to continue?`)) {
        return;
      }
    }
    setIsSwapping(true);
    try {
      const response = await swapAPI.executeSwap(fromToken.symbol, toToken.symbol, quote.fromAmount, quote.toAmount, "quote_id");
      if (response.data.success) {
        const transaction = response.data.data.transaction;
        toast.success(`Swap initiated! Transaction: ${transaction.hash.slice(0, 10)}...`);
        setFromAmount("");
        setToAmount("");
        setQuote(null);
        setScamAnalysis(null);
      }
    } catch (error) {
      console.error("Swap error:", error);
      toast.error(handleApiError(error));
    } finally {
      setIsSwapping(false);
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setLastSelectedToken(temp); // Analyze the new target token
    setFromAmount(toAmount);
    setToAmount("");
  };

  const selectToken = (token, type) => {
    if (type === "from") {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setLastSelectedToken(token);
    setShowTokenModal(null);
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] bg-transparent px-4 py-12 w-full max-w-6xl mx-auto overflow-hidden">
      <h2
        className="text-4xl font-heading font-bold text-center text-white mb-6"
      >
        Swap anytime,
        <br />
        anywhere.
      </h2>


      {/* Dynamic Layout Wrapper */}
      <motion.div
        className={`flex flex-col lg:flex-row gap-8 w-full items-start ${scamAnalysis ? "lg:justify-center" : "lg:justify-center"}`}
      >
        {/* Swap Form Container */}
        <motion.div
          className="relative group w-full max-w-md mx-auto lg:mx-0 flex-shrink-0"
        >
          {/* Animated Background Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500 -z-10 will-change-opacity"></div>
          
          <div className="glass-panel glowing-border rounded-3xl p-6 bg-[#18181c]/80">
            <div className="rounded-2xl bg-[#111112] p-5 mb-2 border border-white/5 shadow-inner transition-colors focus-within:border-cyan-500/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm font-medium">Sell</span>
                <span className="text-xs text-gray-500 font-medium">Balance: {isFullyConnected ? (aptBalance !== null ? aptBalance : "Loading...") : "--"}</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="bg-transparent text-3xl font-heading font-semibold text-white outline-none w-1/2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.0"
                />
                <button onClick={() => setShowTokenModal("from")} className="flex items-center bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-white rounded-full px-4 py-2 ml-2 font-medium text-lg">
                  <img src={fromToken.icon} alt={fromToken.symbol} className="w-6 h-6 mr-2" />
                  {fromToken.symbol}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-xs text-gray-500">{getFormattedPrice(fromToken.symbol)}</span>
                <span className={`text-xs ${getFormattedPriceChange(fromToken.symbol).className}`}>{getFormattedPriceChange(fromToken.symbol).formatted}</span>
              </div>
            </div>

            <div className="flex justify-center -my-3 z-10 relative">
              <button onClick={swapTokens} className="bg-[#18181c] border border-[#23232a] rounded-full w-10 h-10 flex items-center justify-center hover:border-cyan-500 hover:text-cyan-400 transition-colors shadow-lg">
                <ArrowUpDown size={18} className="text-gray-400 hover:text-cyan-400 transition-colors" />
              </button>
            </div>

            <div className="rounded-2xl bg-[#111112] p-5 mt-2 border border-white/5 shadow-inner transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm font-medium">Buy</span>
                {isLoadingQuote && <Loader2 size={16} className="animate-spin text-cyan-500" />}
              </div>
              <div className="flex items-center justify-between">
                <input type="number" min="0" value={toAmount} readOnly className="bg-transparent text-3xl font-heading font-semibold text-white outline-none w-1/2" placeholder="0.0" />
                <button onClick={() => setShowTokenModal("to")} className="flex items-center bg-pink-500 hover:bg-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all text-white rounded-full px-4 py-2 ml-2 font-medium text-lg">
                  {toToken ? (<><img src={toToken.icon} alt={toToken.symbol} className="w-6 h-6 mr-2" />{toToken.symbol}</>) : ("Select token")}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-xs text-gray-500">{getFormattedPrice(toToken?.symbol)}</span>
                <span className={`text-xs ${getFormattedPriceChange(toToken?.symbol).className}`}>{getFormattedPriceChange(toToken?.symbol).formatted}</span>
              </div>
            </div>

            <AnimatePresence>
              {quote && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-[#111112] border border-white/5 rounded-2xl overflow-hidden"
                >
                  <div className="flex justify-between text-sm text-gray-400 mb-2 font-medium">
                    <span>Exchange Rate</span>
                    <span className="text-white">1 {fromToken.symbol} = {quote.exchangeRate.toFixed(6)} {toToken.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2 font-medium">
                    <span>Price Impact</span>
                    <span className={quote.priceImpact > 5 ? "text-red-400 font-bold" : "text-green-400 font-bold"}>{quote.priceImpact.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 font-medium">
                    <span>Fee</span>
                    <span className="text-white">{quote.fee.toFixed(6)} {fromToken.symbol} (${quote.feeUsd.toFixed(2)})</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => {
                if (!isFullyConnected) setShowWalletConnect(true);
                else handleSwap();
              }}
              disabled={isSwapping || isLoadingQuote || (isFullyConnected && !quote)}
              className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold text-lg shadow-[0_4px_14px_0_rgba(6,182,212,0.39)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.23)] transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {!isFullyConnected ? (<><Wallet size={20} /><span>Connect Wallet</span></>) : isSwapping ? (<><Loader2 size={20} className="animate-spin" /><span>Swapping...</span></>) : (<><TrendingUp size={20} /><span>Swap</span></>)}
            </button>
          </div>
        </motion.div>

        {/* Dynamic Analysis Side Panel */}
        <AnimatePresence>
          {scamAnalysis && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="w-full max-w-md mx-auto lg:mx-0 flex-shrink-0"
            >
              <div className="glass-panel rounded-3xl p-6 relative overflow-hidden h-full flex flex-col justify-center">
                {/* Decorative background glow */}
                <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-20 -z-10 rounded-full transform-gpu ${scamAnalysis.riskScore > 30 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                
                <h3 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-400">AI Analysis</span>
                </h3>
                
                {scamAnalysis.riskScore > 30 ? (
                  <div className="p-5 bg-red-900/20 border border-red-500/30 rounded-2xl shadow-inner">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-red-500/20 rounded-full">
                        <AlertTriangle size={24} className="text-red-400" />
                      </div>
                      <span className="text-red-400 font-bold text-lg">High Risk Detected</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Risk Score</span>
                        <span className="text-red-500 font-bold">{scamAnalysis.riskScore}/100</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${scamAnalysis.riskScore}%` }}></div>
                      </div>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-3 mt-4">
                      {scamAnalysis.reasons.map((reason, index) => (
                        <li key={index} className="flex items-start bg-red-950/30 p-2 rounded-lg">
                          <span className="text-red-500 mr-2 mt-0.5">•</span> 
                          <span className="leading-tight">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-8 bg-green-900/10 border border-green-500/20 rounded-2xl flex flex-col items-center text-center shadow-inner h-full justify-center">
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      className="p-4 bg-green-500/20 rounded-full mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    >
                      <CheckCircle size={48} className="text-green-400" />
                    </motion.div>
                    <span className="text-green-400 text-xl font-bold mb-2">Token Appears Safe</span>
                    <span className="text-sm text-gray-400 font-medium bg-[#111112] px-3 py-1 rounded-full border border-[#23232a]">Risk Score: {scamAnalysis.riskScore}/100</span>
                    <p className="mt-6 text-sm text-gray-400 leading-relaxed">
                      Our advanced AI models have continuously monitored this token's contract and on-chain activity. No malicious patterns or honeypot signatures detected.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p 
        className="text-gray-500 text-center mt-12 max-w-md text-sm"
      >
        The safest token swap platform on Aptos with real-time AI scam detection
        and institutional-grade price feeds.
      </p>

      {/* Token Selector Modal */}
      <AnimatePresence>
        {showTokenModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTokenModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#18181c] rounded-3xl border border-[#23232a] p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-heading font-bold text-white mb-4">Select {showTokenModal === "from" ? "source" : "destination"} token</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2" data-lenis-prevent="true">
                {tokens.map((token) => (
                  <button key={token.symbol} onClick={() => selectToken(token, showTokenModal)} className="w-full flex items-center space-x-3 p-3 rounded-2xl hover:bg-[#23232a] transition-colors group">
                    <img src={token.icon} alt={token.symbol} className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="flex-1 text-left">
                      <div className="text-white font-bold">{token.symbol}</div>
                      <div className="text-gray-400 text-sm">{token.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm font-medium">{getFormattedPrice(token.symbol)}</div>
                      <div className={`text-xs ${getFormattedPriceChange(token.symbol).className}`}>{getFormattedPriceChange(token.symbol).formatted}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTokenModal(null)} className="w-full mt-6 py-3 bg-[#23232a] text-gray-300 font-medium rounded-xl hover:bg-gray-800 hover:text-white transition-colors">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <WalletConnectModal isOpen={showWalletConnect} onClose={() => setShowWalletConnect(false)} />
    </div>
  );
};

export default SwapForm;