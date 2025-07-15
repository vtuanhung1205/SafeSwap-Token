import React, { useState, useEffect } from "react";

const HelpCenter = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Help Center...
      </div>
    );
  }
  return (
    <div className="min-h-screen  from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
        Help Center
      </h1>
      <p className="mb-8 text-gray-300 text-lg text-center max-w-2xl mx-auto">
        Find answers to common questions and get help using SafeSwap.
      </p>
      <div className="max-w-3xl mx-auto bg-[#18181c] rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          Frequently Asked Questions
        </h2>
        <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
          <li>
            How do I connect my wallet? <br />
            <span className="text-gray-500">
              Go to the top right and click 'Connect Wallet'.
            </span>
          </li>
          <li>
            How do I get a swap quote? <br />
            <span className="text-gray-500">
              Enter the amount and select tokens, the quote will appear
              automatically.
            </span>
          </li>
          <li>
            What tokens are supported? <br />
            <span className="text-gray-500">
              ETH, USDT, USDC, BTC, APT and more.
            </span>
          </li>
          <li>
            How is scam detection performed? <br />
            <span className="text-gray-500">
              We use real-time risk analysis and on-chain data.
            </span>
          </li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-pink-400">
          Contact Support
        </h2>
        <p className="text-gray-400">
          If you need further help, please{" "}
          <a href="/contact" className="text-cyan-400 underline">
            contact us
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default HelpCenter;
