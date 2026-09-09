import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, ShieldCheck, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_KEY = "safeswap_cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay check to avoid flash on initial render
    const timer = setTimeout(() => {
      const consent = localStorage.getItem(COOKIE_KEY);
      if (!consent) setVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-[420px] z-[60]"
        >
          <div className="relative rounded-2xl border border-white/[0.08] bg-[#111114]/95 backdrop-blur-xl p-5 shadow-2xl shadow-black/50">
            {/* Close button */}
            <button
              onClick={decline}
              aria-label="Dismiss cookie notice"
              className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={14} />
            </button>

            {/* Icon + heading */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie size={18} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white mb-0.5">We use cookies</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  SafeSwap uses essential cookies for authentication and analytics cookies to improve your experience.
                  Read our{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                    onClick={decline}
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={accept}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-bold hover:from-cyan-500 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
              >
                <ShieldCheck size={14} />
                Accept All
              </button>
              <button
                onClick={decline}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-xs font-bold hover:bg-white/[0.08] hover:text-white transition-all"
              >
                Essential Only
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
