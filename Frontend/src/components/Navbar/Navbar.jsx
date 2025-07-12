import React, { useState } from "react";

const tokens = [
  {
    name: "Ethereum",
    symbol: "ETH",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    name: "Tether",
    symbol: "USDT",
    icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  },
  {
    name: "BNB",
    symbol: "BNB",
    icon: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  // Search state
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const filtered = tokens.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.symbol.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <nav className="bg-[#0a0a4a] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 w-full justify-between">
          {/* Logo + Name */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold tracking-wide select-none">
              Cryptoplace
            </span>
          </div>
          {/* Search (center, grow, mx-6) */}
          <div className="hidden md:flex flex-grow justify-center mx-6 max-w-md relative">
            <div className="flex items-center bg-[#18181c] rounded-full px-4 py-2 shadow border border-[#23232a] focus-within:ring-2 focus-within:ring-cyan-500 w-full">
              <svg
                className="w-5 h-5 text-gray-400 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search token by name..."
                className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 100)}
              />
            </div>
            {focused && query && (
              <div className="absolute left-0 w-full mt-2 bg-[#18181c] rounded-2xl shadow-2xl border border-[#23232a] z-50 overflow-hidden animate-fade-in-down">
                {filtered.length === 0 ? (
                  <div className="px-4 py-4 text-gray-400 text-center">
                    No tokens found.
                  </div>
                ) : (
                  <ul className="max-h-60 overflow-y-auto divide-y divide-[#23232a]">
                    {filtered.map((token) => (
                      <li
                        key={token.symbol}
                        className="flex items-center px-4 py-3 hover:bg-[#23232a] cursor-pointer transition"
                      >
                        <img
                          src={token.icon}
                          alt={token.symbol}
                          className="w-7 h-7 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-semibold text-white">
                            {token.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {token.symbol}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          {/* Menu */}
          <div className="hidden md:flex space-x-8 text-lg font-medium">
            <a
              href="#"
              className="hover:text-cyan-300 transition-colors duration-200 px-2 py-1 rounded focus:outline-none focus:bg-cyan-900"
            >
              Home
            </a>
            <a
              href="#"
              className="hover:text-cyan-300 transition-colors duration-200 px-2 py-1 rounded focus:outline-none focus:bg-cyan-900"
            >
              Features
            </a>
            <a
              href="#"
              className="hover:text-cyan-300 transition-colors duration-200 px-2 py-1 rounded focus:outline-none focus:bg-cyan-900"
            >
              Pricing
            </a>
            <a
              href="#"
              className="hover:text-cyan-300 transition-colors duration-200 px-2 py-1 rounded focus:outline-none focus:bg-cyan-900"
            >
              Blog
            </a>
          </div>
          {/* Right side: Currency + Sign up */}
          <div className="flex items-center space-x-4 ml-2">
            {/* Currency Dropdown */}
            <select className="bg-[#18186a] text-white px-3 py-1 rounded border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition">
              <option>USD</option>
              <option>EUR</option>
              <option>VND</option>
            </select>
            {/* Sign up Button */}
            <a
              href="#"
              className="flex items-center bg-white text-[#0a0a4a] font-semibold px-5 py-2 rounded-full shadow hover:bg-cyan-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              Sign up
              <svg
                className="ml-2"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open menu"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 animate-fade-in-down">
            <div className="flex flex-col items-center bg-[#0a0a4a] py-4 rounded shadow-lg">
              <a
                href="#"
                className="block w-full text-center hover:text-cyan-300 transition-colors duration-200 px-4 py-2 rounded mb-2"
              >
                Home
              </a>
              <a
                href="#"
                className="block w-full text-center hover:text-cyan-300 transition-colors duration-200 px-4 py-2 rounded mb-2"
              >
                Features
              </a>
              <a
                href="#"
                className="block w-full text-center hover:text-cyan-300 transition-colors duration-200 px-4 py-2 rounded mb-2"
              >
                Pricing
              </a>
              <a
                href="#"
                className="block w-full text-center hover:text-cyan-300 transition-colors duration-200 px-4 py-2 rounded"
              >
                Blog
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
