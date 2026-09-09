import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  User,
  LogOut,
  Wallet,
  Settings,
  Shield,
  BarChart3,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../hooks/useWebSocket";
import LoginModal from "../Auth/LoginModal";
import RegisterModal from "../Auth/RegisterModal";

const Navbar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { isConnected } = useWebSocket();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "Welcome to SafeSwap!" },
    { id: 2, message: "Your swap was successful." },
    { id: 3, message: "New feature: Scam detection upgraded!" },
  ]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 shadow-sm px-6 py-4 mx-4 mt-4 rounded-3xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group" aria-label="SafeSwap Home">
              <img
                src="/logo.webp"
                alt="SafeSwap logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
              <span className="text-xl font-bold text-white">SafeSwap</span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-1 bg-black/20 backdrop-blur-md rounded-2xl p-1.5 border border-white/5">
            {['/', '/swap', '/feature', '/pricing', '/dashboard'].map((path) => {
              if (path === '/dashboard' && !isAuthenticated) return null;
              
              const labels = {
                '/': 'Home',
                '/swap': 'Swap',
                '/feature': 'Features',
                '/pricing': 'Pricing',
                '/dashboard': 'Dashboard'
              };
              
              const isActive = location.pathname === path;
              
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-5 py-2 rounded-xl transition-colors duration-300 text-sm ${isActive ? 'text-cyan-300' : 'text-gray-400 hover:text-white'}`}
                >
                  <span className="relative z-10 font-medium tracking-wide">{labels[path]}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-pink-600/20 border border-white/10 rounded-xl z-0"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4 min-w-[200px] justify-end">
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="relative p-2 rounded-full hover:bg-[#23232a] focus:outline-none"
                onClick={() => setShowNotifications((prev) => !prev)}
                onMouseEnter={() => setShowNotifications(true)}
                onMouseLeave={() => setShowNotifications(false)}
                aria-label="Notifications"
                aria-haspopup="true"
                aria-expanded={showNotifications}
              >
                <Bell className="w-6 h-6 text-cyan-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-[#18181c]">
                    {notifications.length}
                  </span>
                )}
              </button>
              {/* Notification Dropdown */}
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-[#18181c] border border-[#23232a] rounded-xl shadow-lg py-2 z-50"
                  onMouseEnter={() => setShowNotifications(true)}
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <div className="px-4 py-2 border-b border-[#23232a] text-white font-semibold">
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-4 text-gray-400 text-center">
                      No notifications
                    </div>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className="px-4 py-3 text-gray-200 hover:bg-[#23232a] transition border-b border-[#23232a] last:border-b-0"
                        >
                          {n.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 bg-[#111112] px-4 py-2 rounded-xl border border-[#23232a] hover:border-cyan-600 transition"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-white font-medium text-sm">
                          {user?.name}
                        </p>
                        <p className="text-gray-400 text-xs">{user?.email}</p>
                      </div>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-[#18181c] border border-[#23232a] rounded-xl shadow-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-[#23232a]">
                          <p className="text-white font-medium">{user?.name}</p>
                          <p className="text-gray-400 text-sm">{user?.email}</p>
                          {user?.walletAddress && (
                            <p className="text-cyan-500 text-xs mt-1">
                              {user.walletAddress.slice(0, 6)}...
                              {user.walletAddress.slice(-4)}
                            </p>
                          )}
                        </div>

                        <Link
                          to="/dashboard"
                          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#23232a] transition flex items-center space-x-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <BarChart3 size={16} />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          to="/wallet"
                          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#23232a] transition flex items-center space-x-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Wallet size={16} />
                          <span>Wallet</span>
                        </Link>

                        <Link
                          to="/settings"
                          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#23232a] transition flex items-center space-x-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </Link>

                        <hr className="border-[#23232a] my-2" />

                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#23232a] transition flex items-center space-x-2"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-4 py-2 text-cyan-600 hover:text-cyan-500 font-medium transition"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl transition"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setShowMobileMenu(v => !v)}
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Click outside to close user menu */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-white/[0.06] mt-3 pt-3"
            >
              <div className="flex flex-col gap-1 pb-2">
                {[{ path: '/', label: 'Home' }, { path: '/swap', label: 'Swap' }, { path: '/feature', label: 'Features' }, { path: '/pricing', label: 'Pricing' }].map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="border-t border-white/[0.06] my-2" />
                {isAuthenticated ? (
                  <button
                    onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-white/5 text-left transition-all"
                  >
                    Sign Out
                  </button>
                ) : (
                  <div className="flex gap-2 px-1">
                    <button
                      onClick={() => { setShowLoginModal(true); setShowMobileMenu(false); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setShowRegisterModal(true); setShowMobileMenu(false); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-cyan-600 text-white hover:bg-cyan-700 transition-all"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={switchToRegister}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default memo(Navbar);
