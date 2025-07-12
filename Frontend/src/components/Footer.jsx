import React from "react";

const socialLinks = [
  {
    href: "https://github.com/",
    label: "Github",
    icon: (
      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/",
    label: "X",
    icon: (
      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.53 2.477h3.75l-7.79 8.89 9.17 10.156h-7.21l-5.67-6.6-6.49 6.6H.04l8.32-9.5L-.04 2.477h7.36l5.09 5.92 5.12-5.92zm-1.32 16.36h2.08L6.6 4.56H4.41l11.8 14.277z" />
      </svg>
    ),
  },
  {
    href: "https://discord.com/",
    label: "Discord",
    icon: (
      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.2a.074.074 0 0 0-.079.037c-.34.607-.719 1.396-.984 2.01a18.524 18.524 0 0 0-5.59 0 12.51 12.51 0 0 0-.997-2.01.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.684 4.369a.069.069 0 0 0-.032.027C.533 8.159-.32 11.81.099 15.415a.082.082 0 0 0 .031.056c2.52 1.85 4.96 2.97 7.36 3.7a.077.077 0 0 0 .084-.027c.567-.78 1.073-1.6 1.497-2.48a.076.076 0 0 0-.041-.104c-.812-.308-1.58-.693-2.33-1.13a.077.077 0 0 1-.008-.127c.156-.117.312-.238.46-.36a.074.074 0 0 1 .077-.01c4.87 2.23 10.13 2.23 14.96 0a.073.073 0 0 1 .078.009c.148.122.304.243.46.36a.077.077 0 0 1-.006.127c-.75.437-1.52.822-2.33 1.13a.076.076 0 0 0-.04.105c.427.88.933 1.7 1.496 2.48a.076.076 0 0 0 .084.028c2.4-.73 4.84-1.85 7.36-3.7a.077.077 0 0 0 .03-.055c.5-4.09-.838-7.74-3.553-11.019a.061.061 0 0 0-.033-.028zM8.02 15.331c-1.01 0-1.84-.92-1.84-2.05 0-1.13.81-2.05 1.84-2.05 1.02 0 1.85.93 1.84 2.05 0 1.13-.81 2.05-1.84 2.05zm7.96 0c-1.01 0-1.84-.92-1.84-2.05 0-1.13.81-2.05 1.84-2.05 1.02 0 1.85.93 1.84 2.05 0 1.13-.81 2.05-1.84 2.05z" />
      </svg>
    ),
  },
];

const footerLinks = [
  {
    title: "App",
    links: ["Swap", "Search", "Pool"],
  },
  {
    title: "Company",
    links: ["Careers", "Blog", "Brand Assets"],
  },
  {
    title: "Protocol",
    links: ["Governance", "Management", "Developers"],
  },
  {
    title: "Help?",
    links: ["Support Center", "Contact"],
  },
];

const policyLinks = [
  { label: "Brand Policy", href: "#" },
  { label: "Privacy Policy", href: "#" },
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
                    <li key={link}>
                      <a
                        href="#"
                        className="hover:text-cyan-400 transition text-gray-300"
                      >
                        {link}
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
          <div>© {new Date().getFullYear()} - Cryptoplace</div>
          <div className="flex space-x-6">
            {policyLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-cyan-400 transition"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
