import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Wallet, ArrowRightLeft, Shield, Settings, Search, MessageCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../SEO";

const categories = [
  { id: "general", label: "General", icon: HelpCircle },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "swapping", label: "Swapping", icon: ArrowRightLeft },
  { id: "security", label: "Security", icon: Shield },
];

const faqs = [
  {
    category: "general",
    q: "What is SafeSwap?",
    a: "SafeSwap is an AI-powered decentralized exchange (DEX) built on the Aptos blockchain. It combines lightning-fast token swaps with real-time scam detection to protect your assets from honeypots, rug pulls, and malicious smart contracts.",
  },
  {
    category: "general",
    q: "Is SafeSwap free to use?",
    a: "Yes! The Free plan gives you access to basic swapping and scam detection. For advanced features like real-time AI threat analysis and priority swap queues, check out our Pro plan at $9.99/month.",
  },
  {
    category: "general",
    q: "What tokens are supported?",
    a: "SafeSwap currently supports APT, ETH, USDT, USDC, SOL, and more tokens are being added regularly. All tokens are priced in real-time through CoinGecko and Binance feeds.",
  },
  {
    category: "wallet",
    q: "How do I connect my wallet?",
    a: "Click 'Connect Wallet' in the top navigation bar. SafeSwap supports Petra, Pontem, and Martian wallets. You can also sign in with Google for a Web2 experience using a custodial wallet.",
  },
  {
    category: "wallet",
    q: "Can I use SafeSwap without a crypto wallet?",
    a: "Yes! You can sign in with your Google account. SafeSwap will create a custodial wallet address for you, allowing you to explore swaps and AI analysis without needing a browser extension wallet.",
  },
  {
    category: "wallet",
    q: "How do I check my wallet balance?",
    a: "Navigate to the Wallet page from the sidebar. Your APT balance and connected wallet address will be displayed automatically once your wallet is connected.",
  },
  {
    category: "swapping",
    q: "How do I get a swap quote?",
    a: "On the Swap page, select your source and target tokens, enter the amount you want to swap, and the quote (including fees and exchange rate) will appear automatically within seconds.",
  },
  {
    category: "swapping",
    q: "What fees does SafeSwap charge?",
    a: "SafeSwap charges a 0.3% swap fee. There are no hidden fees — the fee is transparently displayed in your quote breakdown before you confirm the swap.",
  },
  {
    category: "swapping",
    q: "Why did my swap fail?",
    a: "Swaps can fail due to network congestion, insufficient balance, or if the AI detects a high-risk token and blocks the transaction. Check the transaction details for the specific failure reason.",
  },
  {
    category: "security",
    q: "How does AI scam detection work?",
    a: "Our machine learning model analyzes the on-chain transaction history, wallet behavior patterns, and temporal features of token addresses. It generates a risk score (0-100) and flags potential Sybil attacks, honeypots, and rug pulls in real-time.",
  },
  {
    category: "security",
    q: "What does a high risk score mean?",
    a: "A risk score above 70 indicates the AI has detected suspicious patterns (low transaction diversity, bot-like timing, self-funded wallets). SafeSwap will show a warning before allowing you to proceed with the swap.",
  },
  {
    category: "security",
    q: "Is my data safe?",
    a: "SafeSwap uses end-to-end encryption, JWT-based authentication, and a non-custodial architecture. We never store your private keys. Read our full Privacy Policy for more details.",
  },
];

const FAQItem = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden hover:border-white/[0.08] transition-colors"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
        <ChevronDown size={16} className={`text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/[0.03] pt-4">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const HelpCenter = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const filteredFaqs = faqs.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen pt-24 pb-20 text-white relative overflow-hidden">
      <SEO
        title="Help Center"
        description="Get answers to common questions about SafeSwap. Learn about wallet connections, token swaps, AI scam detection, fees, and security on the Aptos blockchain."
        keywords="SafeSwap help, FAQ, how to swap tokens, wallet connection, DeFi support, Aptos help, scam detection FAQ"
      />

      {/* Background */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-pink-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero */}
      <header className="max-w-4xl mx-auto text-center px-6 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6">
            <HelpCircle size={14} /> Help & Support
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-5 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Help Center
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find answers to frequently asked questions about wallets, swapping, security, and more.
          </p>
        </motion.div>
      </header>

      <div className="max-w-3xl mx-auto px-6">
        {/* Category tabs */}
        <nav className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide" aria-label="FAQ categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </nav>

        {/* FAQ List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {filteredFaqs.map((faq, i) => (
              <FAQItem key={`${activeCategory}-${i}`} faq={faq} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Still need help? */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
          aria-labelledby="contact-cta"
        >
          <h2 id="contact-cta" className="text-2xl font-heading font-bold mb-3">Still need help?</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            Our support team is available 24/7. Reach out via email or join our Discord for real-time assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-sm hover:from-cyan-500 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Mail size={16} /> Contact Us
            </Link>
            <a
              href="https://discord.gg/safeswap"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-gray-300 font-bold text-sm hover:bg-white/[0.08] hover:text-white transition-all"
            >
              <MessageCircle size={16} /> Join Discord
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default HelpCenter;
