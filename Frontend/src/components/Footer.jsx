import React from "react";
import { Link } from "react-router-dom";

const socialLinks = [
  {
    href: "https://github.com/vtuanhung1205/SafeSwap-Token",
    label: "Github",
    icon: (
      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
      </svg>
    ),
  },
  {
    href: "/",
    label: "Facebook",
    icon: (
      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02s10-4.5 10-10.02C22 6.53 17.5 2.04 12 2.04zM16.5 12.06h-2.25v6h-3V12.06H9.5v-2.25h1.75V8.56c0-1.73 1.05-2.68 2.6-2.68h1.9v2.25h-1.14c-.85 0-.9.4-.9.92v1.45h2.25l-.25 2.25z" />
      </svg>
    ),
  },
];

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/feature" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Our Story", href: "/our-story" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "API Reference", href: "/api-reference" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help-center" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

const policyLinks = [
  { label: "Terms Of Use", href: "/terms-of-use" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const Footer = () => {
  return (
    <footer className="bg-[#18181c] text-gray-200 pt-10 pb-4 px-4 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Social icons */}
          <div className="flex items-center space-x-8 mb-6 md:mb-0">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition"
              >
                {item.icon}
              </a>
            ))}
          </div>
          {/* Footer columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
            {footerLinks.map((col) => (
              <div key={col.title}>
                <div className="font-bold text-white mb-2">{col.title}</div>
                <ul className="space-y-1">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="hover:text-cyan-400 transition text-gray-300"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <hr className="my-8 border-gray-700" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm gap-4">
          <div>© {new Date().getFullYear()} - SafeSwap</div>
          <div className="flex space-x-6">
            {policyLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="hover:text-cyan-400 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
