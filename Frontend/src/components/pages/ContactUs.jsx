import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Send, Clock, ArrowUpRight, CheckCircle } from "lucide-react";
import SEO from "../SEO";

const contactChannels = [
  {
    icon: Mail,
    title: "Email",
    desc: "For general inquiries and support requests.",
    value: "votuanhung1205.work@gmail.com",
    href: "mailto:votuanhung1205.work@gmail.com",
    color: "cyan",
  },
  {
    icon: Github,
    title: "GitHub",
    desc: "Report bugs and request features.",
    value: "@SafeSwap-Token",
    href: "https://github.com/h4nsx/SafeSwap-Token",
    color: "gray",
  },
  {
    icon: Linkedin,
    title: "Linkedin",
    desc: "Get real-time help from the community.",
    value: "linkedin.com/in/hans-vo",
    href: "https://linkedin.com/in/hans-vo",
    color: "indigo",
  },
];

const colorMap = {
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    icon: "text-cyan-400",
    shadow: "hover:shadow-cyan-500/10",
  },
  gray: {
    bg: "bg-gray-500/10",
    border: "border-gray-500/20 hover:border-gray-400/40",
    icon: "text-gray-300",
    shadow: "hover:shadow-gray-500/10",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20 hover:border-indigo-500/40",
    icon: "text-indigo-400",
    shadow: "hover:shadow-indigo-500/10",
  },
};

const ContactUs = () => {
  const [formState, setFormState] = useState({ email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setFormState({ email: "", message: "" });
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 text-white relative overflow-hidden">
      <SEO
        title="Contact Us"
        description="Get in touch with the SafeSwap team. Reach out via email, GitHub, or Discord for support, bug reports, or partnership inquiries."
        keywords="contact SafeSwap, SafeSwap support, DeFi help, blockchain support, Aptos exchange contact, crypto support email"
      />

      {/* Background */}
      <div className="absolute top-20 right-1/3 w-96 h-96 bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-40 left-1/3 w-[400px] h-[400px] bg-pink-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero */}
      <header className="max-w-4xl mx-auto text-center px-6 mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6">
            <Mail size={14} /> Get in Touch
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-5 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question, partnership inquiry, or just want to say hello? We're here to help.
          </p>
        </motion.div>
      </header>

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Contact Channels + Response Badge */}
          <div className="space-y-8">
            <div className="space-y-4">
              {contactChannels.map((ch, i) => {
                const c = colorMap[ch.color];
                return (
                  <motion.a
                    key={ch.title}
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`group flex items-start gap-4 p-5 rounded-2xl border ${c.border} bg-white/[0.02] transition-all duration-300 hover:shadow-2xl ${c.shadow} hover:-translate-y-0.5`}
                  >
                    <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ${c.icon} shrink-0`}>
                      <ch.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white mb-0.5">{ch.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{ch.desc}</p>
                      <code className={`text-xs font-mono ${c.icon}`}>{ch.value}</code>
                    </div>
                    <ArrowUpRight size={16} className="text-gray-700 group-hover:text-white transition-colors mt-1 shrink-0" />
                  </motion.a>
                );
              })}
            </div>

            {/* Response time badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-green-500/5 border border-green-500/10"
            >
              <Clock size={16} className="text-green-400 shrink-0" />
              <p className="text-xs text-gray-400">
                Average response time: <span className="text-green-400 font-semibold">under 24 hours</span>
              </p>
            </motion.div>
          </div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-6">
              <div>
                <label htmlFor="contact-email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Your Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows="5"
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-sm hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle size={16} className="text-green-300" />
                    <span>Message Sent!</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
