import React, { useState, useEffect } from "react";

const APIReference = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading API Reference...
      </div>
    );
  }
  return (
    <div className="min-h-screen  from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
        API Reference
      </h1>
      <p className="mb-8 text-gray-300 text-lg text-center max-w-2xl mx-auto">
        Detailed reference for SafeSwap API endpoints, including parameters and
        example requests/responses.
      </p>
      <div className="max-w-3xl mx-auto bg-[#18181c] rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          POST /api/swap/quote
        </h2>
        <p className="text-gray-400 mb-2">Request parameters:</p>
        <ul className="list-disc list-inside text-gray-300 mb-2 space-y-1">
          <li>
            <b>fromToken</b> (string): Symbol of the token to swap from
          </li>
          <li>
            <b>toToken</b> (string): Symbol of the token to swap to
          </li>
          <li>
            <b>amount</b> (number): Amount to swap
          </li>
        </ul>
        <pre className="bg-[#23232a] p-4 rounded-lg mb-2 text-sm text-gray-200 shadow-inner overflow-x-auto">{`
POST /api/swap/quote
{
  "fromToken": "ETH",
  "toToken": "USDT",
  "amount": 1.5
}
`}</pre>
        <p className="text-gray-400 mb-2">Response:</p>
        <pre className="bg-[#23232a] p-4 rounded-lg mb-2 text-sm text-gray-200 shadow-inner overflow-x-auto">{`
{
  "exchangeRate": 1666.67,
  "toAmount": 2500,
  "fee": 0.003,
  "priceImpact": 0.1
}
`}</pre>
        <h2 className="text-2xl font-bold mt-10 mb-4 text-pink-400">
          POST /api/swap/execute
        </h2>
        <p className="text-gray-400 mb-2">Request parameters:</p>
        <ul className="list-disc list-inside text-gray-300 mb-2 space-y-1">
          <li>
            <b>fromToken</b> (string): Symbol of the token to swap from
          </li>
          <li>
            <b>toToken</b> (string): Symbol of the token to swap to
          </li>
          <li>
            <b>fromAmount</b> (number): Amount to swap from
          </li>
          <li>
            <b>toAmount</b> (number): Amount to receive
          </li>
          <li>
            <b>quoteId</b> (string): Quote identifier
          </li>
        </ul>
        <pre className="bg-[#23232a] p-4 rounded-lg mb-2 text-sm text-gray-200 shadow-inner overflow-x-auto">{`
POST /api/swap/execute
{
  "fromToken": "ETH",
  "toToken": "USDT",
  "fromAmount": 1.5,
  "toAmount": 2500,
  "quoteId": "abc123"
}
`}</pre>
        <p className="text-gray-400 mb-2">Response:</p>
        <pre className="bg-[#23232a] p-4 rounded-lg mb-2 text-sm text-gray-200 shadow-inner overflow-x-auto">{`
{
  "transactionHash": "0x123...",
  "status": "pending"
}
`}</pre>
      </div>
    </div>
  );
};

export default APIReference;
