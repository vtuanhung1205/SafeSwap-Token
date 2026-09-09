import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Shield,
  Sun,
  Moon,
  CheckCircle,
  X,
  Upload,
  Settings as SettingsIcon,
  Smartphone,
  Save,
  KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: 'general', label: 'General Info', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Sun },
];

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  
  // General Info
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@email.com");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security
  const [twoFA, setTwoFA] = useState(false);
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Appearance
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2000);
    }, 1000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    if (newPass.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordSuccess(true);
      setCurrent("");
      setNewPass("");
      setConfirm("");
      setTimeout(() => setPasswordSuccess(false), 2000);
    }, 1000);
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.4 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-cyan-400 space-y-4">
        <SettingsIcon className="w-10 h-10 animate-spin-slow" />
        <span className="font-heading tracking-widest text-sm uppercase">Loading Preferences...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 text-white min-h-[80vh]">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-400 mt-2 font-medium">Manage your account preferences and security protocols.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 relative group overflow-hidden ${isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="settings-active-tab"
                    className="absolute inset-0 bg-cyan-900/40 border border-cyan-500/30 rounded-2xl z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon size={20} className={`relative z-10 ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300 transition-colors'}`} />
                <span className="relative z-10 font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 glass-panel p-1 rounded-3xl min-h-[500px] w-full">
          <div className="bg-[#111112]/50 backdrop-blur-md w-full h-full rounded-[23px] p-8 md:p-10 relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <AnimatePresence mode="wait">
              {/* General Tab */}
              {activeTab === 'general' && (
                <motion.div key="general" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10">
                  <h2 className="text-2xl font-heading font-bold mb-8 flex items-center gap-2">
                    <User className="text-cyan-400" /> General Information
                  </h2>
                  
                  <form onSubmit={handleProfileSubmit} className="max-w-xl space-y-8">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-2xl bg-[#23232a] border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-cyan-500/50 transition-colors">
                          {preview ? (
                            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User size={40} className="text-gray-500" />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                          <Upload size={24} className="text-white" />
                        </div>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
                        <label htmlFor="avatar-upload" className="absolute inset-0 cursor-pointer"></label>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Profile Picture</h3>
                        <p className="text-sm text-gray-400">Upload a new avatar to personalize your account.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#18181c] border border-[#23232a] text-white px-12 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all peer"
                          placeholder=" "
                          required
                        />
                        <label className="absolute left-12 top-4 text-gray-500 text-sm transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-focus:bg-[#111112] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#111112] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                          Display Name
                        </label>
                      </div>

                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#18181c] border border-[#23232a] text-white px-12 py-4 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all peer"
                          placeholder=" "
                          required
                        />
                        <label className="absolute left-12 top-4 text-gray-500 text-sm transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:text-cyan-400 peer-focus:bg-[#111112] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#111112] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                          Email Address
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-2 disabled:opacity-50"
                      >
                        {savingProfile ? <SettingsIcon className="animate-spin" size={20} /> : <Save size={20} />}
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </button>
                      
                      <AnimatePresence>
                        {profileSuccess && (
                          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-green-400 flex items-center gap-2 font-medium text-sm">
                            <CheckCircle size={16} /> Saved
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div key="security" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10">
                  <h2 className="text-2xl font-heading font-bold mb-8 flex items-center gap-2">
                    <Shield className="text-cyan-400" /> Security
                  </h2>

                  <div className="max-w-xl space-y-10">
                    {/* 2FA Section */}
                    <div className="p-6 rounded-2xl bg-[#18181c] border border-white/5 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                          Two-Factor Auth <Smartphone size={16} className="text-cyan-400" />
                        </h3>
                        <p className="text-sm text-gray-400 max-w-sm">Secure your account with a one-time passcode generated by your authenticator app.</p>
                      </div>
                      <button 
                        onClick={() => setTwoFA(!twoFA)}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${twoFA ? 'bg-cyan-600' : 'bg-gray-700'}`}
                      >
                        <motion.div 
                          className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-md"
                          animate={{ left: twoFA ? '34px' : '4px' }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>

                    {/* Change Password */}
                    <div>
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <KeyRound size={18} className="text-pink-400" /> Change Password
                      </h3>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        {[
                          { label: "Current Password", state: current, setter: setCurrent, show: showCurrent, setShow: setShowCurrent },
                          { label: "New Password", state: newPass, setter: setNewPass, show: showNew, setShow: setShowNew },
                          { label: "Confirm Password", state: confirm, setter: setConfirm, show: showConfirm, setShow: setShowConfirm }
                        ].map((field, idx) => (
                          <div key={idx} className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                              type={field.show ? "text" : "password"}
                              value={field.state}
                              onChange={(e) => field.setter(e.target.value)}
                              className="w-full bg-[#18181c] border border-[#23232a] text-white px-12 py-4 rounded-xl focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all peer"
                              placeholder=" "
                              required
                              minLength={6}
                            />
                            <label className="absolute left-12 top-4 text-gray-500 text-sm transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:text-pink-400 peer-focus:bg-[#111112] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-[#111112] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                              {field.label}
                            </label>
                            <button
                              type="button"
                              onClick={() => field.setShow(!field.show)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                              {field.show ? <X size={18} /> : <Lock size={18} />}
                            </button>
                          </div>
                        ))}

                        {passwordError && <p className="text-red-400 text-sm mt-2">{passwordError}</p>}

                        <div className="pt-4 flex items-center gap-4">
                          <button
                            type="submit"
                            disabled={savingPassword}
                            className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)] disabled:opacity-50"
                          >
                            {savingPassword ? "Updating..." : "Update Password"}
                          </button>
                          <AnimatePresence>
                            {passwordSuccess && (
                              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-green-400 flex items-center gap-2 font-medium text-sm">
                                <CheckCircle size={16} /> Password Updated
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <motion.div key="appearance" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10">
                  <h2 className="text-2xl font-heading font-bold mb-8 flex items-center gap-2">
                    <Sun className="text-yellow-400" /> Appearance
                  </h2>

                  <div className="max-w-xl">
                    <h3 className="font-bold text-lg mb-4">Theme Preference</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`p-6 rounded-2xl border text-left transition-all ${theme === 'dark' ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-[#18181c] border-[#23232a] hover:border-white/20'}`}
                      >
                        <Moon size={28} className={theme === 'dark' ? 'text-cyan-400 mb-4' : 'text-gray-500 mb-4'} />
                        <h4 className="font-bold text-lg text-white mb-1">Deep Space</h4>
                        <p className="text-sm text-gray-400">Dark aesthetic optimized for focus.</p>
                      </button>

                      <button 
                        onClick={() => setTheme('light')}
                        className={`p-6 rounded-2xl border text-left transition-all opacity-50 cursor-not-allowed ${theme === 'light' ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-[#18181c] border-[#23232a]'}`}
                        disabled // Disabled as we only built a dark theme for now
                        title="Coming Soon"
                      >
                        <Sun size={28} className={theme === 'light' ? 'text-yellow-400 mb-4' : 'text-gray-500 mb-4'} />
                        <h4 className="font-bold text-lg text-white mb-1">Light Mode</h4>
                        <p className="text-sm text-gray-400">Currently in development.</p>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
