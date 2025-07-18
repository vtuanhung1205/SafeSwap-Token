import React, { useState } from "react";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";

const ChangePassword = () => {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (newPass.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setCurrent("");
      setNewPass("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48 flex items-center justify-center">
      <div className="w-full max-w-lg bg-[#18181c] rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Change Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-1">Current Password</label>
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
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
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
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
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
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <div className="text-red-400 text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-semibold transition mt-4 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Change Password"}
          </button>
          {success && (
            <div className="text-green-400 text-center mt-2 flex items-center justify-center gap-1">
              <CheckCircle size={18} /> Password changed successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
