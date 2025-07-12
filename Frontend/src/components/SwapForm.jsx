import React, { useState } from "react";

const tokens = [
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  },
];

const SwapForm = () => {
  const [fromToken] = useState(tokens[0]);
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-transparent">
      <h2 className="text-4xl font-bold text-center text-white mb-6">
        Swap anytime,
        <br />
        anywhere.
      </h2>
      <div className="bg-[#18181c] rounded-3xl shadow-2xl p-6 w-full max-w-md border border-[#23232a]">
        {/* Sell */}
        <div className="rounded-2xl bg-[#111112] p-5 mb-2 flex flex-col relative">
          <span className="text-gray-300 text-sm mb-2">Sell</span>
          <div className="flex items-center justify-between">
            <input
              type="number"
              min="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-transparent text-3xl font-semibold text-white outline-none w-1/2"
            />
            <button className="flex items-center bg-cyan-600 hover:bg-cyan-700 transition text-white rounded-full px-4 py-2 ml-2 font-medium text-lg focus:outline-none">
              <img
                src={fromToken.icon}
                alt={fromToken.symbol}
                className="w-6 h-6 mr-2"
              />
              {fromToken.symbol}
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <span className="text-xs text-gray-500 mt-1">0 US$</span>
        </div>
        {/* Arrow */}
        <div className="flex justify-center -my-2">
          <div className="bg-[#18181c] border border-[#23232a] rounded-full w-10 h-10 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {/* Buy */}
        <div className="rounded-2xl bg-[#111112] p-5 mt-2 flex flex-col relative">
          <span className="text-gray-300 text-sm mb-2">Buy</span>
          <div className="flex items-center justify-between">
            <input
              type="number"
              min="0"
              value={toAmount}
              readOnly
              className="bg-transparent text-3xl font-semibold text-white outline-none w-1/2"
            />
            <button className="flex items-center bg-pink-500 hover:bg-pink-600 transition text-white rounded-full px-4 py-2 ml-2 font-medium text-lg focus:outline-none">
              Select token
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        {/* Start Button */}
        <button className="w-full mt-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg shadow-lg transition">
          Start
        </button>
      </div>
      <p className="text-gray-400 text-center mt-6 max-w-md">
        The largest onchain marketplace. Buy and sell crypto on Ethereum and
        over 12 other blockchains.
      </p>
    </div>
  );
};

export default SwapForm;
