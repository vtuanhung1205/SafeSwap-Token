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
  const {
    isConnected,
    getFormattedPrice,
    getFormattedPriceChange,
    subscribeToTokens,
  } = useWebSocket();

  const [fromToken, setFromToken] = useState(tokens[0]); // APT
  const [toToken, setToToken] = useState(tokens[1]); // USDC
  const [fromAmount, setFromAmount] = useState("");
  const debouncedFromAmount = useDebounce(fromAmount, 500); // 500ms delay
  const [toAmount, setToAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [scamAnalysis, setScamAnalysis] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(null);

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
    setFromAmount(toAmount);
    setToAmount("");
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-pink-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div
            className={`relative bg-[#18181c] border border-[#23232a] rounded-2xl shadow-lg p-6 md:p-8`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Swap Tokens</h3>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Connecting</span>
                  </div>
                )}
              </div>
            </div>

            {/* From Token */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">From</label>
              <div className="flex bg-[#23232a] rounded-lg p-4 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
                <button
                  className="flex items-center gap-2 bg-[#2a2a32] px-3 py-2 rounded-lg mr-4 hover:bg-[#31313a] transition-colors"
                  onClick={() => setShowTokenModal("from")}
                >
                  <img
                    src={fromToken.icon}
                    alt={fromToken.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold text-white">{fromToken.symbol}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="flex-1 bg-transparent text-white text-xl font-semibold focus:outline-none"
                />
              </div>
              <div className="flex justify-between text-sm mt-2 px-1">
                <span className="text-gray-400">
                  {fromToken.symbol} Price: {getFormattedPrice(fromToken.symbol)}
                </span>
                <PriceChange symbol={fromToken.symbol} />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                className="bg-[#23232a] p-3 rounded-full hover:bg-[#31313a] transition-colors border border-[#3a3a42] shadow-lg"
                onClick={swapTokens}
              >
                <ArrowUpDown className="w-5 h-5 text-cyan-400" />
              </button>
            </div>

            {/* To Token */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">To</label>
              <div className="flex bg-[#23232a] rounded-lg p-4 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
                <button
                  className="flex items-center gap-2 bg-[#2a2a32] px-3 py-2 rounded-lg mr-4 hover:bg-[#31313a] transition-colors"
                  onClick={() => setShowTokenModal("to")}
                >
                  <img
                    src={toToken.icon}
                    alt={toToken.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold text-white">{toToken.symbol}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <input
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                  className="flex-1 bg-transparent text-white text-xl font-semibold focus:outline-none"
                />
              </div>
              <div className="flex justify-between text-sm mt-2 px-1">
                <span className="text-gray-400">
                  {toToken.symbol} Price: {getFormattedPrice(toToken.symbol)}
                </span>
                <PriceChange symbol={toToken.symbol} />
              </div>
            </div>

            {/* Scam Warning */}
            {scamAnalysis && scamAnalysis.riskScore > 50 && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-400">
                      Potential Scam Warning
                    </h4>
                    <p className="text-sm text-gray-300 mt-1">
                      This token has a risk score of {scamAnalysis.riskScore}%.
                      {scamAnalysis.reasons?.length > 0 && (
                        <span>
                          {" "}
                          Reasons:{" "}
                          {scamAnalysis.reasons.map((r) => r.toLowerCase()).join(", ")}
                          .
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quote Info */}
            {quote && (
              <div className="mb-6 bg-[#23232a] rounded-lg p-4">
                <h4 className="font-semibold text-gray-300 mb-2">Swap Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Exchange Rate</span>
                    <span className="text-white">
                      1 {fromToken.symbol} = {quote.exchangeRate.toFixed(6)}{" "}
                      {toToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price Impact</span>
                    <span className="text-white">{quote.priceImpact}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Fee</span>
                    <span className="text-white">
                      {quote.fee.toFixed(6)} {fromToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slippage Tolerance</span>
                    <span className="text-white">{quote.slippage || 0.5}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <button
              className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                isAuthenticated
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  : "bg-gray-600"
              }`}
              onClick={handleSwap}
              disabled={
                !fromAmount ||
                parseFloat(fromAmount) <= 0 ||
                !toAmount ||
                isLoadingQuote ||
                isSwapping
              }
            >
              {isSwapping ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Swapping...
                </span>
              ) : !isAuthenticated ? (
                <span className="flex items-center justify-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Connect Wallet to Swap
                </span>
              ) : isLoadingQuote ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Getting Quote...
                </span>
              ) : (
                <span>Swap Tokens</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Token Selection Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0"
            onClick={() => setShowTokenModal(null)}
          ></div>
          <div className="bg-[#18181c] rounded-2xl p-6 w-full max-w-md relative z-10">
            <h3 className="text-xl font-bold text-white mb-4">
              Select a Token
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  className="flex items-center gap-3 w-full p-3 hover:bg-[#23232a] rounded-lg transition-colors"
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
                  <img
                    src={token.icon}
                    alt={token.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-white">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-gray-400">{token.name}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-mono text-white">
                      {getFormattedPrice(token.symbol)}
                    </div>
                    <PriceChange symbol={token.symbol} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Price change component with color coding
const PriceChange = ({ symbol }) => {
  const { getFormattedPriceChange } = useWebSocket();
  const change = getFormattedPriceChange(symbol);

  return <span className={change.className}>{change.formatted}</span>;
};

// Helper for the token dropdown button
const ChevronDown = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default SwapForm;