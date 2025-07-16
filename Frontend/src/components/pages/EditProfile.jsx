import React, { useState } from "react";
import { User, Mail, Upload } from "lucide-react";

const EditProfile = () => {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@email.com");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48 flex items-center justify-center">
      <div className="w-full max-w-lg bg-[#18181c] rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Edit Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-4">
            <label htmlFor="avatar-upload" className="cursor-pointer group">
              <div className="w-24 h-24 rounded-full bg-cyan-700 flex items-center justify-center shadow-lg border-4 border-cyan-400/30 overflow-hidden mb-2">
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
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {success && (
            <div className="text-green-400 text-center mt-2">
              Profile updated successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
