import React, { useState } from "react";
import { CreditCard, User, Mail, CheckCircle, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const plans = {
  Free: {
    name: "Free",
    price: "$0",
    desc: "Basic Swap, Real-time Price Feed, Scam Detection (Limited), Community Support",
    color: "from-gray-500 to-gray-400"
  },
  Pro: {
    name: "Pro",
    price: "$9.99/mo",
    desc: "All Free Features, Unlimited Scam Detection, Priority Swap Queue, Advanced Analytics, Email Support",
    color: "from-cyan-400 to-pink-400"
  },
  Enterprise: {
    name: "Enterprise",
    price: "Custom",
    desc: "All Pro Features, Custom Integrations, Dedicated Account Manager, 24/7 Premium Support",
    color: "from-purple-400 to-indigo-400"
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
      setTimeout(() => navigate("/dashboard"), 2500);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-12 text-white relative overflow-hidden flex items-center justify-center">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[600px] bg-gradient-to-tr from-cyan-500/10 to-pink-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <Link to="/pricing" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm font-semibold">
            <ArrowLeft size={16} /> Back to Pricing
          </Link>
          
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black mb-4">Complete your <br/> upgrade</h1>
            <p className="text-gray-400 text-lg">You are upgrading to the <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${planInfo.color}`}>{planInfo.name}</span> plan.</p>
          </div>

          <div className="glass-panel p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-br ${planInfo.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-6 pb-6 border-b border-white/10">
                <div>
                  <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Due Today</div>
                  <div className="text-4xl font-heading font-black">{planInfo.price}</div>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle size={16} className={`text-transparent bg-clip-text bg-gradient-to-r ${planInfo.color}`} style={{ color: '#22d3ee' }} /> Immediate access to {planInfo.name} features
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle size={16} className={`text-transparent bg-clip-text bg-gradient-to-r ${planInfo.color}`} style={{ color: '#22d3ee' }} /> Billed securely via Stripe
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle size={16} className={`text-transparent bg-clip-text bg-gradient-to-r ${planInfo.color}`} style={{ color: '#22d3ee' }} /> Cancel anytime
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold justify-center lg:justify-start">
            <ShieldCheck size={14} className="text-green-400" /> Guaranteed safe & secure checkout
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-panel p-8 md:p-10 rounded-[32px] glowing-border relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleSubmit} className="space-y-6 relative z-10"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text" name="name" value={form.name} onChange={handleChange}
                      className="w-full bg-[#18181c] border border-[#23232a] text-white px-12 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all peer"
                      placeholder=" " required
                    />
                    <label className="absolute left-12 top-4 text-gray-500 text-sm transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-focus:bg-[#111112] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#111112] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                      Cardholder Name
                    </label>
                  </div>

                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      className="w-full bg-[#18181c] border border-[#23232a] text-white px-12 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all peer"
                      placeholder=" " required
                    />
                    <label className="absolute left-12 top-4 text-gray-500 text-sm transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-focus:bg-[#111112] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#111112] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                      Email Address
                    </label>
                  </div>
                </div>

                {planInfo.name !== "Enterprise" && (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text" name="card" value={form.card} onChange={handleChange}
                        className="w-full bg-[#18181c] border border-[#23232a] text-white px-12 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all peer"
                        placeholder=" " required pattern="[0-9]{13,19}" maxLength={19}
                      />
                      <label className="absolute left-12 top-4 text-gray-500 text-sm transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-focus:bg-[#111112] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#111112] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                        Card Number
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <input
                          type="text" name="exp" value={form.exp} onChange={handleChange}
                          className="w-full bg-[#18181c] border border-[#23232a] text-white px-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all peer"
                          placeholder=" " required pattern="(0[1-9]|1[0-2])\/([0-9]{2})" maxLength={5}
                        />
                        <label className="absolute left-4 top-4 text-gray-500 text-sm transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-focus:bg-[#111112] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#111112] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                          MM/YY
                        </label>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="text" name="cvc" value={form.cvc} onChange={handleChange}
                          className="w-full bg-[#18181c] border border-[#23232a] text-white px-4 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all peer"
                          placeholder=" " required pattern="[0-9]{3,4}" maxLength={4}
                        />
                        <label className="absolute left-4 top-4 text-gray-500 text-sm transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-focus:bg-[#111112] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#111112] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                          CVC
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  {planInfo.name === "Enterprise" ? (
                    <a
                      href="mailto:safeswap@proton.me"
                      className="flex items-center justify-center w-full bg-white text-black py-4 rounded-xl font-bold transition-all hover:bg-gray-200"
                    >
                      Contact Sales Team
                    </a>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="relative w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-70 flex items-center justify-center gap-2 overflow-hidden"
                    >
                      {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        `Pay ${planInfo.price}`
                      )}
                      
                      {/* Button shine effect */}
                      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    </button>
                  )}
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-12 relative z-10"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                  >
                    <CheckCircle size={40} className="text-green-400" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-heading font-bold mb-2">Payment Successful!</h3>
                <p className="text-gray-400">Welcome to SafeSwap {planInfo.name}. Redirecting to your dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;
