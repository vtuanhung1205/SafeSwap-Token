import React, { useState, useEffect } from "react";
import { User, Mail, Upload, Wallet, RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { walletAPI } from "../../utils/api";
import toast from "react-hot-toast";

const EditProfile = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Wallet information
  const [walletInfo, setWalletInfo] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [tokenBalances, setTokenBalances] = useState({});

  // Token metadata for UI display
  const tokenMetadata = {
    APT: {
      name: "Aptos",
      icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/21794.png",
      decimals: 8
    },
    BTC: {
      name: "Bitcoin",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png",
      decimals: 8
    },
    ETH: {
      name: "Ethereum",
      icon: "https://static1.tokenterminal.com//ethereum/logo.png?logo_hash=fd8f54cab23f8f4980041f4e74607cac0c7ab880",
      decimals: 18
    },
    USDC: {
      name: "USD Coin",
      icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png",
      decimals: 6
    },
    USDT: {
      name: "Tether",
      icon: "https://public.bnbstatic.com/static/academy/uploads-original/2fd4345d8c3a46278941afd9ab7ad225.png",
      decimals: 6
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPreview(user.avatar || null);
      setLoading(false);
      fetchWalletInfo();
    }
  }, [isAuthenticated, user]);

  const fetchWalletInfo = async () => {
    try {
      setLoadingWallet(true);
      const response = await walletAPI.getInfo();
      
      if (response.data?.success) {
        setWalletInfo(response.data.data.wallet);
        if (response.data.data.wallet.tokenBalances) {
          setTokenBalances(response.data.data.wallet.tokenBalances);
        }
      }
    } catch (error) {
      console.error("Failed to fetch wallet info:", error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', name);
      
      // Only append avatar if it's changed
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Format token balance based on token type
  const formatTokenBalance = (balance, symbol) => {
    if (balance === null || balance === undefined) return "0";
    
    // Use different precision based on token type
    let precision = 4;
    if (symbol === "BTC") precision = 8;
    else if (symbol === "ETH" || symbol === "APT") precision = 6;
    else if (symbol === "USDC" || symbol === "USDT") precision = 2;
    
    return parseFloat(balance).toFixed(precision);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Edit Form */}
          <div className="md:col-span-2 bg-[#18181c] rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
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
                    readOnly
                    className="bg-transparent outline-none w-full text-white placeholder-gray-500 opacity-70"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold transition mt-4 disabled:opacity-60 flex items-center justify-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </button>
              {success && (
                <div className="text-green-400 text-center mt-2">
                  Profile updated successfully!
                </div>
              )}
            </form>
          </div>
          
          {/* Wallet Information */}
          <div className="bg-[#18181c] rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Wallet</h2>
              <button 
                onClick={fetchWalletInfo}
                className="p-2 rounded-lg bg-[#23232a] hover:bg-[#2a2a32] text-cyan-400"
                disabled={loadingWallet}
              >
                {loadingWallet ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
              </button>
            </div>
            
            {!walletInfo ? (
              <div className="text-center py-8">
                <div className="inline-block p-4 rounded-full bg-cyan-500/10 mb-4">
                  <Wallet size={32} className="text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold">No Wallet Connected</h3>
                <p className="text-gray-400 text-sm mt-1">Connect a wallet to see your balances</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#23232a] p-4 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">Wallet Address</div>
                  <div className="font-mono text-sm text-cyan-400 break-all">
                    {walletInfo.address}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-300 mb-2 flex justify-between items-center">
                    <span>Token Balances</span>
                    {loadingWallet && <Loader2 size={14} className="animate-spin text-cyan-400" />}
                  </div>
                  
                  {Object.keys(tokenBalances).length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      No token balances found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(tokenBalances).map(([symbol, data]) => (
                        <div key={symbol} className="bg-[#23232a] p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-center">
                            <img 
                              src={tokenMetadata[symbol]?.icon || `https://cryptoicon-api.vercel.app/api/icon/${symbol.toLowerCase()}`} 
                              alt={symbol}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            <span>{symbol}</span>
                          </div>
                          <div className="font-mono text-sm">
                            {formatTokenBalance(data.balance, symbol)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
