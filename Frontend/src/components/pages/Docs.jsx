import React, { useState, useEffect } from "react";

const Docs = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Documentation...
      </div>
    );
  }
  return (
    <div className="min-h-screen  from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
        Documentation
      </h1>
      <p className="mb-8 text-gray-300 text-lg text-center max-w-2xl mx-auto">
        Welcome to the SafeSwap documentation. Here you can find information
        about our API endpoints, how to use the platform, and best practices for
        secure token swaps.
      </p>
      <div className="max-w-3xl mx-auto bg-[#18181c] rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">API Endpoints</h2>
        <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
          <li>
            <span className="text-cyan-400 font-semibold">POST</span>{" "}
            /api/auth/login - User login
          </li>
          <li>
            <span className="text-cyan-400 font-semibold">POST</span>{" "}
            /api/auth/register - User registration
          </li>
          <li>
            <span className="text-cyan-400 font-semibold">POST</span>{" "}
            /api/swap/quote - Get swap quote
          </li>
          <li>
            <span className="text-cyan-400 font-semibold">POST</span>{" "}
            /api/swap/execute - Execute swap
          </li>
          <li>
            <span className="text-cyan-400 font-semibold">GET</span>{" "}
            /api/price - Get token prices
          </li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-pink-400">
          Getting Started
        </h2>
        <ol className="list-decimal list-inside text-gray-300 mb-6 space-y-1">
          <li>Register an account or login.</li>
          <li>Connect your wallet.</li>
          <li>Get a swap quote and execute swaps securely.</li>
        </ol>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-cyan-400">
          Security Best Practices
        </h2>
        <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
          <li>Always verify token addresses before swapping.</li>
          <li>Use the scam detection feature to check token risk.</li>
          <li>Keep your wallet software up to date.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-pink-400">
          Example: Get a Swap Quote
        </h2>
        <pre className="bg-[#23232a] p-4 rounded-lg mb-2 text-sm text-gray-200 shadow-inner overflow-x-auto">{`
POST /api/swap/quote
{
  "fromToken": "ETH",
  "toToken": "USDT",
  "amount": 1.5
}
`}</pre>
        <p className="text-gray-400">
          Response: <span className="text-cyan-400">200 OK</span>
        </p>
        <pre className="bg-[#23232a] p-4 rounded-lg mb-2 text-sm text-gray-200 shadow-inner overflow-x-auto">{`
{
  "exchangeRate": 1666.67,
  "toAmount": 2500,
  "fee": 0.003,
  "priceImpact": 0.1
}
`}</pre>
      </div>
    </div>
  );
};

export default Docs;
