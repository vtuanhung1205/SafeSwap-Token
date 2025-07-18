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
} from "lucide-react";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [theme, setTheme] = useState("light");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Edit Profile state
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@email.com");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Change Password state
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Edit Profile handlers
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
      setTimeout(() => setProfileSuccess(false), 1500);
      setShowEditProfile(false);
    }, 1200);
  };

  // Change Password handlers
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
      setTimeout(() => setPasswordSuccess(false), 1500);
      setShowChangePassword(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      {/* Hero Card - User Info */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="relative bg-gradient-to-br from-cyan-900/60 to-pink-900/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row items-center gap-6 border border-cyan-800/30">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center shadow-lg border-4 border-cyan-400/30">
              <User size={36} className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{name}</div>
              <div className="text-cyan-300 font-mono text-sm flex items-center gap-1">
                <Mail size={16} className="inline-block text-cyan-400" />
                {email}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowEditProfile(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl font-semibold shadow transition"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="max-w-3xl mx-auto bg-[#18181c] rounded-2xl shadow-lg p-8 mb-10 space-y-10">
        {/* Change Password */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock size={20} className="text-pink-400" />
            <h2 className="text-xl font-semibold text-pink-400">
              Change Password
            </h2>
          </div>
          <button
            onClick={() => setShowChangePassword(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl font-semibold transition mb-2"
          >
            Change Password
          </button>
        </div>

        {/* Two-Factor Authentication */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={20} className="text-cyan-400" />
            <h2 className="text-xl font-semibold text-cyan-400">
              Two-Factor Authentication (2FA)
            </h2>
          </div>
          <label className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              checked={twoFA}
              onChange={() => setTwoFA(!twoFA)}
              className="form-checkbox h-5 w-5 text-cyan-600"
            />
            <span className="text-gray-300">Enable 2FA</span>
            {twoFA && <CheckCircle size={18} className="text-green-400 ml-2" />}
          </label>
          <div className="text-xs text-gray-400 ml-8">
            Add an extra layer of security to your account.
          </div>
        </div>

        {/* Appearance */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sun size={20} className="text-yellow-300" />
            <Moon size={20} className="text-pink-400" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-transparent">
              Appearance
            </h2>
          </div>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === "light"}
                onChange={() => setTheme("light")}
                className="form-radio h-5 w-5 text-yellow-300"
              />
              <span className="text-gray-300">Light Mode</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === "dark"}
                onChange={() => setTheme("dark")}
                className="form-radio h-5 w-5 text-pink-600"
              />
              <span className="text-gray-300">Dark Mode</span>
            </label>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg bg-[#18181c] rounded-2xl shadow-2xl p-8 relative animate-fade-in">
            <button
              onClick={() => setShowEditProfile(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-pink-400"
            >
              <X size={28} />
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-4">
                <label htmlFor="avatar-upload" className="cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-cyan-700 flex items-center justify-center shadow-lg border-4 border-cyan-400/30 overflow-hidden mb-2 relative">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={48} className="text-white" />
                    )}
                    <div className="absolute opacity-0 group-hover:opacity-100 transition bg-black/60 w-24 h-24 flex items-center justify-center rounded-full top-0 left-0">
                      <Upload size={28} className="text-cyan-300" />
                    </div>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                <span className="text-xs text-gray-400">
                  Click to change avatar
                </span>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Name</label>
                <div className="flex items-center bg-[#23232a] rounded-lg px-3 py-2">
                  <User size={18} className="text-cyan-400 mr-2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                    required
                    minLength={2}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <div className="flex items-center bg-[#23232a] rounded-lg px-3 py-2">
                  <Mail size={18} className="text-cyan-400 mr-2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold transition mt-4 disabled:opacity-60"
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
              {profileSuccess && (
                <div className="text-green-400 text-center mt-2">
                  Profile updated successfully!
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg bg-[#18181c] rounded-2xl shadow-2xl p-8 relative animate-fade-in">
            <button
              onClick={() => setShowChangePassword(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-pink-400"
            >
              <X size={28} />
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Change Password
            </h1>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="flex items-center bg-[#23232a] rounded-lg px-3 py-2">
                  <Lock size={18} className="text-pink-400 mr-2" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="ml-2 text-gray-400"
                  >
                    {showCurrent ? <X size={18} /> : <Lock size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">New Password</label>
                <div className="flex items-center bg-[#23232a] rounded-lg px-3 py-2">
                  <Lock size={18} className="text-cyan-400 mr-2" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="ml-2 text-gray-400"
                  >
                    {showNew ? <X size={18} /> : <Lock size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="flex items-center bg-[#23232a] rounded-lg px-3 py-2">
                  <Lock size={18} className="text-cyan-400 mr-2" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="bg-transparent outline-none w-full text-white placeholder-gray-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="ml-2 text-gray-400"
                  >
                    {showConfirm ? <X size={18} /> : <Lock size={18} />}
                  </button>
                </div>
              </div>
              {passwordError && (
                <div className="text-red-400 text-center">{passwordError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-semibold transition mt-4 disabled:opacity-60"
                disabled={savingPassword}
              >
                {savingPassword ? "Saving..." : "Change Password"}
              </button>
              {passwordSuccess && (
                <div className="text-green-400 text-center mt-2 flex items-center justify-center gap-1">
                  <CheckCircle size={18} /> Password changed successfully!
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
