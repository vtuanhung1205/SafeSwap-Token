import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Zap, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../SEO";

const plans = [
  {
    icon: ShieldCheck,
    name: "Free",
    priceMonthly: "$0",
    priceYearly: "$0",
    description: "For individuals exploring decentralized swapping.",
    features: [
      "Basic Scam Detection",
      "Standard Swap Routing",
      "Last 5 Transactions",
      "Community Support",
    ],
    highlight: false,
    color: "from-gray-500 to-gray-400"
  },
  {
    icon: Zap,
    name: "Pro",
    priceMonthly: "$9.99",
    priceYearly: "$99.00",
    description: "For active traders demanding security & speed.",
    features: [
      "Real-time AI Threat Analysis",
      "Priority Swap Queue",
      "Full Transaction History",
      "Priority Email Support",
    ],
    highlight: true,
    color: "from-cyan-400 to-pink-500"
  },
  {
    icon: Star,
    name: "Enterprise",
    priceMonthly: "Custom",
    priceYearly: "Custom",
    description: "For institutional liquidity providers and DAOs.",
    features: [
      "Custom Smart Contract Audits",
      "Dedicated RPC Endpoints",
      "Advanced Analytics Dashboard",
      "24/7 Dedicated Support",
    ],
    highlight: false,
    color: "from-purple-500 to-indigo-500"
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-12 lg:px-48 text-white relative overflow-hidden">
      <SEO
        title="Pricing"
        description="Choose the right SafeSwap plan for your trading needs. Free basic swaps, Pro real-time AI analysis at $9.99/mo, or custom Enterprise solutions for DAOs."
        keywords="SafeSwap pricing, DeFi subscription, crypto trading plan, AI scam detection plan, Aptos DEX pricing"
      />
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="text-center mb-20 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-heading font-black mb-6 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent"
        >
          Pricing Plans
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-400 max-w-2xl mx-auto mb-10"
        >
          Institutional-grade security for everyone. Choose the plan that fits your trading volume and security requirements.
        </motion.p>

        {/* Toggle Switch */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          <span className={`font-semibold ${!isYearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="w-16 h-8 bg-[#23232a] rounded-full p-1 relative border border-white/10"
          >
            <motion.div 
              className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full shadow-lg"
              animate={{ x: isYearly ? 32 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`font-semibold flex items-center gap-2 ${isYearly ? 'text-white' : 'text-gray-500'}`}>
            Yearly <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Save 20%</span>
          </span>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1), type: "spring", bounce: 0.4 }}
            whileHover={{ y: -10 }}
            className={`relative flex flex-col glass-panel rounded-[32px] p-8 md:p-10 transition-all duration-300 group ${
              plan.highlight 
                ? 'border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.15)] bg-[#18181c]/90' 
                : 'border-white/5 hover:border-white/20 bg-[#111112]/80'
            }`}
          >
            {/* Highlight Glow */}
            {plan.highlight && (
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-[32px] pointer-events-none" />
            )}

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[#23232a] border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                  <plan.icon size={28} className={`text-transparent bg-clip-text bg-gradient-to-br ${plan.color}`} style={{ color: index === 1 ? '#22d3ee' : index === 2 ? '#a855f7' : '#9ca3af' }} />
                </div>
                <h2 className="text-2xl font-heading font-bold text-white mb-2">{plan.name}</h2>
                <p className="text-sm text-gray-400 h-10">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <motion.span 
                    key={isYearly ? plan.priceYearly : plan.priceMonthly}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-heading font-black"
                  >
                    {isYearly ? plan.priceYearly : plan.priceMonthly}
                  </motion.span>
                  {plan.priceMonthly !== "Custom" && (
                    <span className="text-gray-500 font-medium">{isYearly ? '/year' : '/month'}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className={plan.highlight ? "text-cyan-400 shrink-0" : "text-gray-500 shrink-0"} />
                    <span className={plan.highlight ? "text-gray-200" : "text-gray-400"}>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.name === "Enterprise" ? (
                <button
                  className="w-full px-6 py-4 rounded-xl font-bold bg-[#23232a] text-white hover:bg-white hover:text-black transition-colors"
                >
                  Contact Sales
                </button>
              ) : (
                <button
                  onClick={() => plan.name !== "Free" && navigate("/payment", { state: { plan: plan.name } })}
                  disabled={plan.name === "Free"}
                  className={`w-full px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                    plan.highlight
                      ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                      : "bg-[#23232a] text-gray-400 hover:bg-[#2a2a35] hover:text-white"
                  }`}
                >
                  {plan.name === "Free" ? "Current Plan" : "Get Started"}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;