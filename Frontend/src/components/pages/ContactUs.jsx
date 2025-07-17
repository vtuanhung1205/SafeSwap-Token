import React, { useState, useEffect } from "react";

const ContactUs = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Contact Us...
      </div>
    );
  }
  return (
    <div className="min-h-screen  from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
        Contact Us
      </h1>
      <p className="mb-8 text-gray-300 text-lg text-center max-w-2xl mx-auto">
        Have questions or need support? Reach out to us! Our team is here to
        help you 24/7.
      </p>
      <div className="max-w-2xl mx-auto bg-[#18181c] rounded-2xl shadow-lg p-8 mb-10">
        <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
          <li>
            Email:{" "}
            <a
              href="mailto:safeswap@contact.me"
              className="text-cyan-400 underline"
            >
              safeswap@contact.me
            </a>
          </li>
          <li>
            Github:{" "}
            <a
              href="https://github.com/vtuanhung1205/SafeSwap-Token"
              className="text-cyan-400 underline"
            >
              @SafeSwap-Token
            </a>
          </li>
        </ul>
        <form className="max-w-md mx-auto bg-[#23232a] p-6 rounded-xl shadow-inner">
          <label className="block text-gray-300 mb-2">Your Email</label>
          <input
            type="email"
            className="w-full mb-4 p-2 rounded bg-gray-800 text-white"
            placeholder="you@example.com"
          />
          <label className="block text-gray-300 mb-2">Message</label>
          <textarea
            className="w-full mb-4 p-2 rounded bg-gray-800 text-white"
            rows="4"
            placeholder="How can we help you?"
          />
          <button
            type="submit"
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded"
          >
            Send
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          We aim to respond to all queries within 24 hours.
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
