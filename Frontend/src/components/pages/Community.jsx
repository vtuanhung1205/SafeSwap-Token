import React, { useState, useEffect } from "react";

const Community = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Community...
      </div>
    );
  }
  return (
    <div className="min-h-screen  from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
        Community
      </h1>
      <p className="mb-8 text-gray-300 text-lg text-center max-w-2xl mx-auto">
        Join our community to get support, share ideas, and stay updated!
      </p>
      <div className="max-w-3xl mx-auto bg-[#18181c] rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Channels</h2>
        <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
          <li>
            Discord:{" "}
            <a
              href="https://discord.gg/safeswap"
              className="text-cyan-400 underline"
            >
              discord.gg/safeswap
            </a>
          </li>
          <li>
            Telegram:{" "}
            <a href="https://t.me/safeswap" className="text-cyan-400 underline">
              t.me/safeswap
            </a>
          </li>
          <li>
            Twitter:{" "}
            <a
              href="https://twitter.com/safeswap"
              className="text-cyan-400 underline"
            >
              @safeswap
            </a>
          </li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-pink-400">
          Events & Announcements
        </h2>
        <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
          <li>Monthly AMA with the team</li>
          <li>Community trading competitions</li>
          <li>Bug bounty program</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2 text-cyan-400">
          How to Contribute
        </h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Report bugs and suggest features on GitHub</li>
          <li>Help answer questions in the community channels</li>
          <li>Share SafeSwap with your network</li>
        </ul>
      </div>
    </div>
  );
};

export default Community;
