import React, { useState } from "react";
import { CreditCard, User, Mail, CheckCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const plans = {
  Free: {
    name: "Free",
    price: "$0",
    desc: "Basic Swap, Real-time Price Feed, Scam Detection (Limited), Community Support",
  },
  Pro: {
    name: "Pro",
    price: "$9.99/mo",
    desc: "All Free Features, Unlimited Scam Detection, Priority Swap Queue, Advanced Analytics, Email Support",
  },
  Enterprise: {
    name: "Enterprise",
    price: "Contact Us",
    desc: "All Pro Features, Custom Integrations, Dedicated Account Manager, 24/7 Premium Support",
  },
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan = "Pro" } = location.state || {};
  const planInfo = plans[plan] || plans["Pro"];

  const [form, setForm] = useState({
    name: "",
    email: "",
    card: "",
    exp: "",
    cvc: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/pricing"), 1800);
    }, 1500);
  };

  return (
    <div className="min-h-screen from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48 flex items-center justify-center">
      <div className="w-full max-w-lg bg-[#18181c] rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Payment
        </h1>
        <div className="mb-6 text-center">
          <div className="text-xl font-bold mb-1 text-cyan-400">
            {planInfo.name} Plan
          </div>
          <div className="text-2xl font-extrabold mb-1 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            {planInfo.price}
          </div>
          <div className="text-gray-400 text-sm mb-2">{planInfo.desc}</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-1">Full Name</label>
            <div className="flex items-center bg-[#23232a] rounded-lg px-3 py-2">
              <User size={18} className="text-cyan-400 mr-2" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                placeholder="Your Name"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <div className="flex items-center bg-[#23232a] rounded-lg px-3 py-2">
              <Mail size={18} className="text-cyan-400 mr-2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          {planInfo.name !== "Enterprise" && (
            <>
              <div>
                <label className="block text-gray-300 mb-1">Card Number</label>
                <div className="flex items-center bg-[#23232a] rounded-lg px-3 py-2">
                  <CreditCard size={18} className="text-cyan-400 mr-2" />
                  <input
                    type="text"
                    name="card"
                    value={form.card}
                    onChange={handleChange}
                    className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                    placeholder="1234 5678 9012 3456"
                    required
                    pattern="[0-9]{13,19}"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-300 mb-1">Expiry</label>
                  <input
                    type="text"
                    name="exp"
                    value={form.exp}
                    onChange={handleChange}
                    className="bg-[#23232a] rounded-lg px-3 py-2 w-full text-white placeholder-gray-500 outline-none"
                    placeholder="MM/YY"
                    required
                    pattern="(0[1-9]|1[0-2])\/([0-9]{2})"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-300 mb-1">CVC</label>
                  <input
                    type="text"
                    name="cvc"
                    value={form.cvc}
                    onChange={handleChange}
                    className="bg-[#23232a] rounded-lg px-3 py-2 w-full text-white placeholder-gray-500 outline-none"
                    placeholder="123"
                    required
                    pattern="[0-9]{3,4}"
                  />
                </div>
              </div>
            </>
          )}
          {planInfo.name === "Enterprise" ? (
            <a
              href="mailto:safeswap@proton.me"
              className="block w-full text-center px-6 py-3 rounded-xl font-bold border border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all duration-300 mt-4"
            >
              Contact Us for Enterprise
            </a>
          ) : (
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold transition mt-4 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay ${planInfo.price}`}
            </button>
          )}
          {success && (
            <div className="text-green-400 text-center mt-4 flex items-center justify-center gap-2">
              <CheckCircle size={20} /> Payment successful! Redirecting...
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Payment;
