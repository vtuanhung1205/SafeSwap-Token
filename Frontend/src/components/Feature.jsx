import React from "react";
import { ShieldCheck, ArrowRightLeft, Cpu, Lock, Zap, Search } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "./SEO";

const features = [
  {
    icon: Cpu,
    title: "AI-Powered Threat Detection",
    description: "Our proprietary AI models analyze smart contracts in real-time before you swap, providing a comprehensive risk score to protect you from honeypots, rug pulls, and malicious code.",
    bullets: ["Real-time code analysis", "Honeypot detection", "Continuous learning models"],
    mockup: "threat",
    color: "cyan"
  },
  {
    icon: Zap,
    title: "Lightning Fast Swapping",
    description: "Built on the Aptos blockchain, SafeSwap leverages parallel execution to ensure your transactions are incredibly fast and incredibly cheap.",
    bullets: ["Sub-second finality", "Parallel execution engine", "Minimal gas fees"],
    mockup: "swap",
    color: "pink"
  },
  {
    icon: Lock,
    title: "Institutional-Grade Security",
    description: "We employ multi-layered security protocols, end-to-end encryption, and regular third-party audits to ensure your assets are always protected.",
    bullets: ["End-to-end encryption", "Regular smart contract audits", "Non-custodial architecture"],
    mockup: "security",
    color: "purple"
  }
];

const Feature = () => {
  return (
    <div className="min-h-screen pt-24 pb-24 text-white overflow-hidden">
      <SEO
        title="Features"
        description="Discover SafeSwap's cutting-edge features: AI-powered threat detection, lightning-fast swapping on Aptos, and institutional-grade security for your DeFi transactions."
        keywords="SafeSwap features, AI threat detection, fast token swap, Aptos DEX, DeFi security, smart contract audit, scam detection"
      />
      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center px-4 mb-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-heading font-black mb-6 leading-tight">
            Next-Gen Tech for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
              Safe Swapping
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Discover the cutting-edge technology that makes SafeSwap the most secure and reliable decentralized exchange on the Aptos network.
          </p>
        </motion.div>
      </div>

      {/* Feature Storytelling Scroll */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 md:space-y-48">
        {features.map((feature, idx) => (
          <div key={idx} className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}>
            
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: idx % 2 !== 0 ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
              className="flex-1 space-y-6 text-center md:text-left"
            >
              <div className={`w-16 h-16 mx-auto md:mx-0 rounded-2xl bg-${feature.color}-500/10 border border-${feature.color}-500/30 flex items-center justify-center mb-6`}>
                <feature.icon size={32} className={`text-${feature.color}-400`} />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold">{feature.title}</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-4 pt-4 text-left inline-block md:block">
                {feature.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${feature.color}-400`} />
                    <span className="text-gray-300 font-medium">{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Visual Mockups */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: idx % 2 !== 0 ? -15 : 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
              className="flex-1 w-full"
              style={{ perspective: "1000px" }}
            >
              <div className="relative w-full aspect-square md:aspect-[4/3] max-w-md mx-auto">
                <div className={`absolute inset-0 bg-${feature.color}-500/20 blur-[80px] rounded-full pointer-events-none`} />
                
                {/* Custom Mockup based on feature type */}
                {feature.mockup === "threat" && (
                  <div className="absolute inset-0 glass-panel glowing-border rounded-[32px] p-8 flex flex-col justify-center overflow-hidden">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-full bg-[#23232a] animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-[#23232a] rounded w-1/3" />
                        <div className="h-3 bg-[#23232a] rounded w-1/2" />
                      </div>
                    </div>
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-bold">AI Status: Safe</span>
                        <span className="text-green-400 text-sm">98/100</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} whileInView={{ width: "98%" }} transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-green-500 rounded-full" 
                        />
                      </div>
                    </div>
                    <Search className="absolute -bottom-6 -right-6 w-48 h-48 text-cyan-500/10" />
                  </div>
                )}

                {feature.mockup === "swap" && (
                  <div className="absolute inset-0 glass-panel glowing-border rounded-[32px] p-6 flex flex-col justify-center">
                    <div className="bg-[#111112] p-4 rounded-2xl mb-2 border border-white/5 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-3xl font-bold">1,000</span>
                        <span className="bg-cyan-600 px-3 py-1 rounded-full font-bold">APT</span>
                      </div>
                    </div>
                    <div className="flex justify-center -my-3 relative z-10">
                      <div className="w-10 h-10 bg-[#18181c] border border-white/10 rounded-full flex items-center justify-center">
                        <ArrowRightLeft className="w-5 h-5 text-gray-400 rotate-90" />
                      </div>
                    </div>
                    <div className="bg-[#111112] p-4 rounded-2xl mt-2 border border-white/5 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-3xl font-bold">3,408</span>
                        <span className="bg-pink-500 px-3 py-1 rounded-full font-bold">USDC</span>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between text-xs text-gray-500 font-mono">
                      <span>Latency: <span className="text-green-400">0.2s</span></span>
                      <span>Gas: <span className="text-green-400">0.0001 APT</span></span>
                    </div>
                  </div>
                )}

                {feature.mockup === "security" && (
                  <div className="absolute inset-0 glass-panel glowing-border rounded-[32px] p-8 flex flex-col justify-center items-center text-center overflow-hidden">
                    <motion.div 
                      initial={{ scale: 0.8 }} whileInView={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(168,85,247,0.3)] relative"
                    >
                      <div className="absolute inset-0 border-2 border-purple-500/50 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                      <ShieldCheck className="w-12 h-12 text-purple-400" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Audited & Verified</h3>
                    <p className="text-sm text-gray-400">Smart contracts verified by top-tier security firms.</p>
                    
                    <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                      <div className="bg-[#111112] p-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">
                        <Lock size={14} className="text-green-400" /> <span className="text-xs font-bold">Encrypted</span>
                      </div>
                      <div className="bg-[#111112] p-3 rounded-xl border border-white/5 flex items-center justify-center gap-2">
                        <ShieldCheck size={14} className="text-green-400" /> <span className="text-xs font-bold">Non-Custodial</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-40 text-center px-4"
      >
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">
          Experience the future of secure and seamless token swapping. Your safe journey into DeFi begins now.
        </p>
        <a
          href="/swap"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] text-lg"
        >
          Try SafeSwap Now <ArrowRightLeft size={20} />
        </a>
      </motion.div>
    </div>
  );
};

export default Feature;
