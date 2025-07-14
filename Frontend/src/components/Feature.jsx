import React from "react";

const features = [
  {
    icon: "🛡️",
    title: "Detection",
    description:
      "Advanced AI-powered detection system that analyzes token contracts and transaction histories in real time. Detects suspicious patterns such as honeypots, rug pulls, and tokens with malicious code or abnormal trading activity. Provides a comprehensive risk score and clear warnings before you proceed with any swap, helping you avoid potential scams and financial losses. Continuously updates detection models based on the latest threats and scam tactics in the crypto space.",
  },
  {
    icon: "🔄",
    title: "Swap Token",
    description:
      "Seamless and intuitive interface for swapping tokens directly on the Aptos blockchain. Displays real-time price feeds, slippage, and estimated fees before you confirm any transaction. Ensures high-speed execution and minimal transaction costs, leveraging the efficiency of Aptos. Supports a wide range of tokens and provides a transparent breakdown of each swap, including transaction history and analytics for your review.",
  },
];

const Feature = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-black text-white px-4 py-16">
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          About SafeSwap
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-2 font-medium">
          Discover the core features that make SafeSwap the safest and most
          user-friendly token swap platform on Aptos.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full mb-12">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="bg-[#18181c] border border-[#23232a] rounded-3xl p-10 flex flex-col items-center shadow-xl hover:shadow-2xl hover:border-cyan-500 transition-all duration-300 group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
              {f.icon}
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white tracking-tight">
              {f.title}
            </h2>
            <p className="text-gray-300 text-base leading-relaxed text-center">
              {f.description}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col items-center">
        <a
          href="/swap"
          className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl text-lg shadow-lg transition-all duration-300 transform hover:scale-105 mb-2"
        >
          Try SafeSwap Now
        </a>
        <span className="text-gray-400 text-sm">
          Experience secure and seamless token swaps today!
        </span>
      </div>
    </div>
  );
};

export default Feature;
