import React from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Instagram, ArrowUpRight } from "lucide-react";

const socialLinks = [
  {
    href: "https://github.com/vtuanhung1205/SafeSwap-Token",
    label: "GitHub",
    icon: Github,
    color: "hover:text-white",
  },
  {
    href: "https://linkedin.com/in/hans-vo",
    label: "LinkedIn",
    icon: Linkedin,
    color: "hover:text-sky-400",
  },
  {
    href: "https://instagram.com/h4nsx",
    label: "Instagram",
    icon: Instagram,
    color: "hover:text-indigo-400",
  },
];

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/feature" },
      { label: "Pricing", href: "/pricing" },
      { label: "Swap", href: "/swap" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Our Story", href: "/our-story" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "API Reference", href: "/api-reference" },
      { label: "Help Center", href: "/help-center" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Terms of Use", href: "/terms-of-use" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="relative mt-20 border-t border-white/[0.06]" role="contentinfo">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-16">
          {/* Brand column */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3 group" aria-label="SafeSwap Home">
              <img
                src="/logo.webp"
                alt="SafeSwap logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-heading font-bold text-white">SafeSwap</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              The most secure AI-powered decentralized exchange on the Aptos blockchain. Swap with confidence.
            </p>
            
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow SafeSwap on ${item.label}`}
                  className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 ${item.color} hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300`}
                >
                  <item.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <nav key={col.title} aria-label={`${col.title} links`}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-500 hover:text-white transition-colors duration-200 flex items-center gap-1 group/link"
                    >
                      {link.label}
                      <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200 text-cyan-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} SafeSwap. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/terms-of-use" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Terms
            </Link>
            <Link to="/privacy-policy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Privacy
            </Link>
            <span className="text-xs text-gray-700">
              Built on <span className="text-cyan-500/70 font-medium">Aptos</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
