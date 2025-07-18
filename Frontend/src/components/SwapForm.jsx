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
import { swapAPI, priceAPI, walletAPI, handleApiError } from "../utils/api";
import toast from "react-hot-toast";
import { useWallet } from "@aptos-labs/wallet-adapter-react"; // Import useWallet
import WalletConnect from "./WalletConnect"; // Updated import path

// --- Custom Hook for Debouncing ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// --- Helper Hook for On-Scroll Animations (from OurStory) ---
const useInView = (options) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        // Stop observing after it's visible once to prevent re-animation
        observer.unobserve(entry.target);
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return [ref, isInView];
};

const tokens = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "https://static1.tokenterminal.com//ethereum/logo.png?logo_hash=fd8f54cab23f8f4980041f4e74607cac0c7ab880",
  },
  {
    symbol: "SOL",
    name: "Solana",
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
  },
  {
    symbol: "APT",
    name: "Aptos",
    icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/21794.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "https://public.bnbstatic.com/static/academy/uploads-original/2fd4345d8c3a46278941afd9ab7ad225.png",
  },
];

const SwapForm = () => {
  const { user, isAuthenticated } = useAuth();
  const { connected: isWalletConnected } = useWallet(); // Lấy trạng thái kết nối ví
  const {
    isConnected,
    getFormattedPrice,
    getFormattedPriceChange,
    subscribeToTokens,
  } = useWebSocket();

  const [fromToken, setFromToken] = useState(tokens[0]); // BTC
  const [toToken, setToToken] = useState(tokens[1]); // ETH
  const [fromAmount, setFromAmount] = useState("");
  const debouncedFromAmount = useDebounce(fromAmount, 500); // 500ms delay
  const [toAmount, setToAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [scamAnalysis, setScamAnalysis] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(null);
  const [tokenBalances, setTokenBalances] = useState({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const [formRef, isFormInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const animationClasses = isFormInView
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-10";

  useEffect(() => {
    const symbols = tokens.map((token) => token.symbol);
    subscribeToTokens(symbols);
  }, [subscribeToTokens]);

  useEffect(() => {
    if (debouncedFromAmount && parseFloat(debouncedFromAmount) > 0 && fromToken && toToken) {
      getSwapQuote();
    } else {
      setToAmount("");
      setQuote(null);
    }
  }, [debouncedFromAmount, fromToken, toToken]);

  // Fetch wallet balances when wallet is connected
  useEffect(() => {
    if (isWalletConnected) {
      fetchWalletBalances();
    } else {
      setTokenBalances({});
    }
  }, [isWalletConnected]);

  const fetchWalletBalances = async () => {
    if (!isWalletConnected) return;
    
    setIsLoadingBalances(true);
    try {
      const response = await walletAPI.getInfo();
      if (response.data?.success && response.data.data?.wallet?.tokenBalances) {
        setTokenBalances(response.data.data.wallet.tokenBalances);
      }
    } catch (error) {
      console.error("Failed to fetch wallet balances:", error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const getSwapQuote = async () => {
    if (!debouncedFromAmount || !fromToken || !toToken) return;
    setIsLoadingQuote(true);
    try {
      const response = await swapAPI.getQuote(fromToken.symbol, toToken.symbol, debouncedFromAmount);
        if (response.data.success) {
          const quoteData = response.data.data.quote;
          setQuote(quoteData);
          setToAmount(quoteData.toAmount.toFixed(6));
          analyzeToken(toToken.symbol);
      }
    } catch (error) {
      console.error("Quote error:", error);
      toast.error(handleApiError(error));
      // Clear output amount on error
      setToAmount("");
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const analyzeToken = async (symbol) => {
    try {
      // Chỉ phân tích token nếu không phải là USDC hoặc USDT (stablecoin)
      if (symbol === 'USDC' || symbol === 'USDT') {
        setScamAnalysis({
          isScam: false,
          riskScore: 5,
          confidence: 95,
          reasons: ["Verified stablecoin"],
          recommendation: "Safe to trade"
        });
        return;
      }

        const mockAddress = `0x${symbol.toLowerCase()}${"0".repeat(40)}`;
        const response = await priceAPI.analyzeToken(mockAddress, symbol, symbol);
        if (response.data.success) {
          setScamAnalysis(response.data.data.analysis);
      }
    } catch (error) {
      console.error("Token analysis error:", error);
      // Fallback nếu API thất bại
      setScamAnalysis({
        isScam: false,
        riskScore: 20,
        confidence: 80,
        reasons: ["Limited data available"],
        recommendation: "Proceed with caution"
      });
    }
  };

  const handleSwap = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to swap tokens");
      return;
    }
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to swap tokens");
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
      // Sửa lỗi: Gửi quote.quoteId thật thay vì chuỗi hardcoded
      const response = await swapAPI.executeSwap(fromToken.symbol, toToken.symbol, quote.fromAmount, quote.toAmount, quote.quoteId);
        if (response.data.success) {
          const transaction = response.data.data.transaction;
          toast.success(`Swap initiated! Transaction: ${transaction.hash.slice(0, 10)}...`);
          setFromAmount("");
          setToAmount("");
          setQuote(null);
          setScamAnalysis(null);
          
          // Refresh balances after swap
          setTimeout(fetchWalletBalances, 2000);
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
    setFromAmount(toAmount);
    setToAmount("");
  };

  // Get the balance for a specific token
  const getTokenBalance = (symbol) => {
    if (!isWalletConnected || !tokenBalances || !tokenBalances[symbol]) {
      return null;
    }
    return tokenBalances[symbol].balance;
  };

  // Format balance with appropriate decimals
  const formatBalance = (balance, symbol) => {
    if (balance === null || balance === undefined) return "N/A";
    
    // Use different precision based on token type
    let precision = 4;
    if (symbol === "BTC") precision = 8;
    else if (symbol === "ETH" || symbol === "APT") precision = 6;
    else if (symbol === "USDC" || symbol === "USDT") precision = 2;
    
    return parseFloat(balance).toFixed(precision);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-transparent px-4">
      <div
        ref={formRef}
        className={`w-full max-w-md transition-all duration-700 ease-out ${animationClasses}`}
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Swap Anytime
          </h2>
          <p className="text-lg text-gray-400">
            Secure, fast, and decentralized.
          </p>
        </div>

        <div className="relative group">
          <div className="bg-[#1c1c24] rounded-2xl p-6 border border-[#2a2a35] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Swap Tokens</h3>
              {isConnected && (
                <div className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                  Live
                </div>
              )}
            </div>

            {/* From Token */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">From</label>
                {isWalletConnected && tokenBalances[fromToken.symbol] && (
                  <div className="text-xs text-gray-400 flex items-center">
                    <Wallet size={12} className="mr-1" />
                    <span>Balance: {formatBalance(getTokenBalance(fromToken.symbol), fromToken.symbol)} {fromToken.symbol}</span>
                  </div>
                )}
              </div>
              <div className="flex bg-[#111112] rounded-xl p-3 border border-[#2a2a35] focus-within:border-cyan-600 transition">
                <button
                  className="flex items-center space-x-2 bg-[#1c1c24] px-3 py-2 rounded-lg border border-[#2a2a35] hover:border-cyan-600 transition"
                  onClick={() => setShowTokenModal("from")}
                >
                  <img
                    src={fromToken.icon}
                    alt={fromToken.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-white">{fromToken.symbol}</span>
                  <ChevronDown />
                </button>
                <input
                  type="number"
                  className="flex-1 bg-transparent border-none text-right text-white text-lg focus:outline-none"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
              </div>
              {isWalletConnected && tokenBalances[fromToken.symbol] && (
                <div className="flex justify-end mt-1">
                  <button 
                    className="text-xs text-cyan-500 hover:text-cyan-400"
                    onClick={() => {
                      const balance = getTokenBalance(fromToken.symbol);
                      if (balance) setFromAmount(balance.toString());
                    }}
                  >
                    Max
                  </button>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 z-10 relative">
              <button
                className="bg-[#1c1c24] p-2 rounded-lg border border-[#2a2a35] hover:border-cyan-600 transition"
                onClick={swapTokens}
              >
                <ArrowUpDown size={18} className="text-cyan-500" />
              </button>
            </div>

            {/* To Token */}
            <div className="mb-4 mt-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-400">To</label>
                {isWalletConnected && tokenBalances[toToken.symbol] && (
                  <div className="text-xs text-gray-400 flex items-center">
                    <Wallet size={12} className="mr-1" />
                    <span>Balance: {formatBalance(getTokenBalance(toToken.symbol), toToken.symbol)} {toToken.symbol}</span>
                  </div>
                )}
              </div>
              <div className="flex bg-[#111112] rounded-xl p-3 border border-[#2a2a35] focus-within:border-cyan-600 transition">
                <button
                  className="flex items-center space-x-2 bg-[#1c1c24] px-3 py-2 rounded-lg border border-[#2a2a35] hover:border-cyan-600 transition"
                  onClick={() => setShowTokenModal("to")}
                >
                  <img
                    src={toToken.icon}
                    alt={toToken.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-white">{toToken.symbol}</span>
                  <ChevronDown />
                </button>
                <input
                  type="number"
                  className="flex-1 bg-transparent border-none text-right text-white text-lg focus:outline-none"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                />
              </div>
            </div>

            {/* Price and Rate Info */}
            {quote && (
              <div className="bg-[#111112] rounded-xl p-3 mb-4 border border-[#2a2a35]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="text-sm text-white">
                    1 {fromToken.symbol} ≈{" "}
                    {quote.exchangeRate.toFixed(6)} {toToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Fee</span>
                  <span className="text-sm text-white">
                    {(quote.fee * 100).toFixed(2)}% ({quote.fee.toFixed(6)}{" "}
                    {fromToken.symbol})
                  </span>
                </div>
              </div>
            )}

            {/* Scam Analysis */}
            {scamAnalysis && (
              <div
                className={`rounded-xl p-3 mb-4 border ${
                  scamAnalysis.isScam
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : scamAnalysis.riskScore > 50
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "bg-green-500/10 border-green-500/30 text-green-400"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {scamAnalysis.isScam ? (
                    <AlertTriangle size={18} />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  <div>
                    <div className="font-medium mb-1">
                      {scamAnalysis.isScam
                        ? "High Risk Token"
                        : scamAnalysis.riskScore > 50
                        ? "Medium Risk Token"
                        : "Low Risk Token"}
                    </div>
                    <div className="text-xs">
                      {scamAnalysis.recommendation}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Connect Wallet / Swap Button */}
            {!isWalletConnected ? (
              <WalletConnect />
            ) : (
              <button
                className={`w-full py-3 rounded-xl font-medium transition ${
                  isLoadingQuote || isSwapping || !quote
                    ? "bg-cyan-600/50 text-cyan-300 cursor-not-allowed"
                    : "bg-cyan-600 text-white hover:bg-cyan-700"
                }`}
                disabled={isLoadingQuote || isSwapping || !quote}
                onClick={handleSwap}
              >
                {isSwapping ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Swapping...</span>
                  </div>
                ) : isLoadingQuote ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Getting Quote...</span>
                  </div>
                ) : !quote ? (
                  "Enter Amount"
                ) : (
                  "Swap Tokens"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Token Selection Modal */}
        {showTokenModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1c1c24] rounded-2xl p-6 border border-[#2a2a35] shadow-lg w-full max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Select Token
                </h3>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowTokenModal(null)}
                >
                  &times;
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {tokens.map((token) => (
                  <button
                    key={token.symbol}
                    className="flex items-center justify-between w-full p-3 hover:bg-[#2a2a35] rounded-lg transition mb-2"
                    onClick={() => {
                      if (showTokenModal === "from") {
                        if (token.symbol === toToken.symbol) {
                          setToToken(fromToken);
                        }
                        setFromToken(token);
                      } else {
                        if (token.symbol === fromToken.symbol) {
                          setFromToken(toToken);
                        }
                        setToToken(token);
                      }
                      setShowTokenModal(null);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={token.icon}
                        alt={token.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="text-left">
                        <div className="text-white font-medium">
                          {token.symbol}
                        </div>
                        <div className="text-gray-400 text-sm">{token.name}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <PriceChange symbol={token.symbol} />
                      {isWalletConnected && tokenBalances[token.symbol] && (
                        <div className="text-xs text-gray-400">
                          {formatBalance(getTokenBalance(token.symbol), token.symbol)} {token.symbol}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PriceChange = ({ symbol }) => {
  const { getFormattedPriceChange } = useWebSocket();
  const change = getFormattedPriceChange(symbol);
  
  return (
    <div className={`text-sm ${change.className} flex items-center`}>
      {change.isPositive ? <TrendingUp size={12} className="mr-1" /> : <ArrowUpDown size={12} className="mr-1" />}
      {change.formatted}
    </div>
  );
};

const ChevronDown = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-400"
    {...props}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default SwapForm;