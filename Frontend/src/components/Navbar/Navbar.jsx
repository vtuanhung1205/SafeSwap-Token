import React, { useState } from "react";
import {
  ChevronDown,
  User,
  LogOut,
  Settings,
  Shield,
  BarChart3,
  Bell,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../hooks/useWebSocket";
import LoginModal from "../Auth/LoginModal";
import RegisterModal from "../Auth/RegisterModal";
import WalletConnect from "../WalletConnect";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { isConnected } = useWebSocket();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "Welcome to SafeSwap!" },
    { id: 2, message: "Your swap was successful." },
    { id: 3, message: "New feature: Scam detection upgraded!" },
  ]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };
  
  const handleWalletConnected = (account) => {
    // Remove toast notification for a more professional UI
    console.log(`Wallet connected: ${account.address.slice(0, 6)}...`);
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
      <nav className="bg-[#18181c] border-b border-[#23232a] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">SafeSwap</span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === "/"
                  ? "text-cyan-400 bg-cyan-600/10"
                  : "text-gray-300 hover:text-cyan-400"
              }`}
            >
              Home
            </Link>
            <Link
              to="/swap"
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === "/swap"
                  ? "text-cyan-400 bg-cyan-600/10"
                  : "text-gray-300 hover:text-cyan-400"
              }`}
            >
              Swap
            </Link>
            <Link
              to="/pricing"
              className={`px-3 py-2 rounded-lg transition ${
                location.pathname === "/pricing"
                  ? "text-cyan-400 bg-cyan-600/10"
                  : "text-gray-300 hover:text-cyan-400"
              }`}
            >
              Pricing
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg transition ${
                  location.pathname === "/dashboard"
                    ? "text-cyan-400 bg-cyan-600/10"
                    : "text-gray-300 hover:text-cyan-400"
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* User and Wallet Section */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="relative p-2 rounded-full hover:bg-[#23232a] focus:outline-none"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                <Bell className="w-6 h-6 text-cyan-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 border-2 border-[#18181c]">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-[#18181c] border border-[#23232a] rounded-xl shadow-lg py-2 z-50"
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-2 text-gray-300 text-sm">
                      {notification.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <WalletConnect onWalletConnected={handleWalletConnected} />
                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-3 bg-[#111112] px-4 py-2 rounded-xl border border-[#23232a] hover:border-cyan-600 transition"
                      >
                        {/* User Avatar and Info */}
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                            <User size={16} className="text-white" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-white font-medium text-sm">{user?.name || "User"}</p>
                          <p className="text-gray-400 text-xs">{user?.email}</p>
                        </div>
                        <ChevronDown size={16} className="text-gray-400" />
                      </button>
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-[#18181c] border border-[#23232a] rounded-xl shadow-lg py-2 z-50">
                          {/* Dropdown Content */}
                          <Link
                            to="/dashboard"
                            className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#23232a] transition flex items-center space-x-2"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <BarChart3 size={16} />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#23232a] transition flex items-center space-x-2"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings size={16} />
                            <span>Settings</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#23232a] transition flex items-center space-x-2"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-4 py-2 rounded-lg text-gray-300 hover:text-cyan-400 transition"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={switchToRegister}
        />
      )}
      {showRegisterModal && (
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  );
};

export default Navbar;
