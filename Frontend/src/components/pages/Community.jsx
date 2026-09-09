import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Twitter, Github, Users, Trophy, Bug, Heart, BookOpen, ArrowUpRight, Sparkles, Calendar } from "lucide-react";
import SEO from "../SEO";

const platforms = [
  {
    name: "Discord",
    desc: "Join 5,000+ members for real-time support and trading discussion.",
    href: "https://discord.gg/safeswap",
    handle: "discord.gg/safeswap",
    icon: MessageCircle,
    color: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/20 hover:border-indigo-500/40",
    iconColor: "text-indigo-400",
    shadow: "hover:shadow-indigo-500/10",
  },
  {
    name: "Twitter / X",
    desc: "Follow for announcements, updates, and ecosystem alpha.",
    href: "https://twitter.com/safeswap",
    handle: "@safeswap",
    icon: Twitter,
    color: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/20 hover:border-sky-500/40",
    iconColor: "text-sky-400",
    shadow: "hover:shadow-sky-500/10",
  },
  {
    name: "GitHub",
    desc: "Explore our open-source code, report issues, and contribute.",
    href: "https://github.com/vtuanhung1205/SafeSwap-Token",
    handle: "@SafeSwap-Token",
    icon: Github,
    color: "from-gray-500/20 to-gray-500/5",
    border: "border-gray-500/20 hover:border-gray-400/40",
    iconColor: "text-gray-300",
    shadow: "hover:shadow-gray-500/10",
  },
];

const events = [
  { icon: Calendar, title: "Monthly AMA", desc: "Live Q&A with the core development team every last Friday." },
  { icon: Trophy, title: "Trading Competitions", desc: "Seasonal trading events with APT prize pools for top performers." },
  { icon: Bug, title: "Bug Bounty Program", desc: "Earn rewards for finding and reporting security vulnerabilities." },
  { icon: Sparkles, title: "Feature Voting", desc: "Shape the roadmap by voting on upcoming features in Discord." },
];

const contributions = [
  { icon: Bug, title: "Report Bugs", desc: "Found something broken? Open an issue on GitHub." },
  { icon: Heart, title: "Help Others", desc: "Answer questions in Discord and help new members onboard." },
  { icon: BookOpen, title: "Improve Docs", desc: "Submit PRs to improve our documentation and guides." },
  { icon: Users, title: "Spread the Word", desc: "Share SafeSwap with your network and grow the community." },
];

const Community = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 text-white relative overflow-hidden">
      <SEO
        title="Community"
        description="Join the SafeSwap community on Discord, Twitter, and GitHub. Participate in events, earn rewards through bug bounties, and help shape the future of secure DeFi."
        keywords="SafeSwap community, Discord, DeFi community, Aptos community, bug bounty, trading competitions, open source blockchain"
      />

      {/* Background */}
      <div className="absolute top-20 right-1/3 w-96 h-96 bg-indigo-500/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-40 left-1/4 w-[400px] h-[400px] bg-pink-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero */}
      <header className="max-w-4xl mx-auto text-center px-6 mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <Users size={14} /> 5,000+ Members
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-5 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Community
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Connect with traders, developers, and enthusiasts building the future of secure decentralized finance on Aptos.
          </p>
        </motion.div>
      </header>

      <div className="max-w-5xl mx-auto px-6 space-y-24">
        {/* Social Platform Cards */}
        <section aria-labelledby="platforms-heading">
          <h2 id="platforms-heading" className="sr-only">Social Platforms</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {platforms.map((p, i) => (
              <motion.a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`group relative p-6 rounded-2xl bg-gradient-to-b ${p.color} border ${p.border} transition-all duration-300 hover:shadow-2xl ${p.shadow} hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center ${p.iconColor}`}>
                    <p.icon size={24} />
                  </div>
                  <ArrowUpRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                <p className="text-sm text-gray-400 mb-3 leading-relaxed">{p.desc}</p>
                <code className={`text-xs font-mono ${p.iconColor}`}>{p.handle}</code>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Events */}
        <section aria-labelledby="events-heading">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 id="events-heading" className="text-2xl font-heading font-bold mb-2">Events & Programs</h2>
            <p className="text-gray-500 text-sm mb-8">Ongoing opportunities to engage and earn.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/15 flex items-center justify-center shrink-0">
                  <e.icon size={18} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{e.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{e.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How to Contribute */}
        <section aria-labelledby="contribute-heading">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 id="contribute-heading" className="text-2xl font-heading font-bold mb-2">How to Contribute</h2>
            <p className="text-gray-500 text-sm mb-8">Every contribution makes SafeSwap better for everyone.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contributions.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-cyan-500/20 transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <c.icon size={18} className="text-cyan-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{c.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Community;
