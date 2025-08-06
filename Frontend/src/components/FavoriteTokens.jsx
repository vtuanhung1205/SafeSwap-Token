import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../utils/api';
import { Loader2, Star, StarOff, AlertCircle, Bell, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';

const FavoriteTokens = () => {
    const { isAuthenticated } = useAuth();
    const [favoriteTokens, setFavoriteTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFavoriteTokens();
        }
    }, [isAuthenticated]);

    const fetchFavoriteTokens = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await userAPI.getFavoriteTokens();
            if (response.data.success) {
                setFavoriteTokens(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching favorite tokens:', error);
            setError('Failed to fetch favorite tokens');
        } finally {
            setLoading(false);
        }
    };

    const addToFavorites = async (tokenData) => {
        try {
            const response = await userAPI.addFavoriteToken(tokenData);
            if (response.data.success) {
                setFavoriteTokens(response.data.data);
                toast.success(`${tokenData.symbol} added to favorites`);
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            toast.error(error.response?.data?.error || 'Failed to add to favorites');
        }
    };

    const removeFromFavorites = async (tokenAddress) => {
        try {
            const response = await userAPI.removeFavoriteToken(tokenAddress);
            if (response.data.success) {
                setFavoriteTokens(response.data.data);
                toast.success('Token removed from favorites');
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
            toast.error(error.response?.data?.error || 'Failed to remove from favorites');
        }
    };

    const setPriceAlert = async (tokenAddress, alertPrice) => {
        try {
            const response = await userAPI.setPriceAlert(tokenAddress, alertPrice);
            if (response.data.success) {
                setFavoriteTokens(prev => 
                    prev.map(token => 
                        token.address === tokenAddress 
                            ? { ...token, alertPrice }
                            : token
                    )
                );
                toast.success(`Price alert set for ${alertPrice}`);
            }
        } catch (error) {
            console.error('Error setting price alert:', error);
            toast.error(error.response?.data?.error || 'Failed to set price alert');
        }
    };

    const removePriceAlert = async (tokenAddress) => {
        try {
            const response = await userAPI.removePriceAlert(tokenAddress);
            if (response.data.success) {
                setFavoriteTokens(prev => 
                    prev.map(token => 
                        token.address === tokenAddress 
                            ? { ...token, alertPrice: null }
                            : token
                    )
                );
                toast.success('Price alert removed');
            }
        } catch (error) {
            console.error('Error removing price alert:', error);
            toast.error(error.response?.data?.error || 'Failed to remove price alert');
        }
    };

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        return `${address.slice(0, 8)}...${address.slice(-6)}`;
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
                <h2 className="text-xl font-bold text-white mb-4">Favorite Tokens</h2>
                <div className="text-gray-400 text-center py-8">
                    Please login to manage your favorite tokens
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Favorite Tokens</h2>
                <button 
                    onClick={fetchFavoriteTokens}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                    <Loader2 size={16} className={loading ? 'animate-spin' : 'hidden'} />
                    <span>Refresh</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-cyan-500" size={32} />
                </div>
            ) : error ? (
                <div className="text-red-400 text-center py-8">
                    {error}
                </div>
            ) : favoriteTokens.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {favoriteTokens.map((token) => (
                        <div 
                            key={token.address}
                            className="bg-[#2a2a35] rounded-lg p-4 border border-[#3a3a45] hover:border-cyan-500/50 transition"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <Star className="text-yellow-400" size={20} />
                                    <div>
                                        <div className="text-white font-medium">
                                            {token.name} ({token.symbol})
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            {formatAddress(token.address)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {token.alertPrice && (
                                        <div className="flex items-center space-x-1 text-cyan-400 text-sm">
                                            <Bell size={14} />
                                            <span>${token.alertPrice}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeFromFavorites(token.address)}
                                        className="text-red-400 hover:text-red-300 transition"
                                        title="Remove from favorites"
                                    >
                                        <StarOff size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            {token.notes && (
                                <div className="text-gray-400 text-sm mb-3">
                                    <span className="text-gray-500">Notes:</span> {token.notes}
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">
                                    Added: {new Date(token.addedAt).toLocaleDateString()}
                                </span>
                                <div className="flex items-center space-x-2">
                                    {token.alertPrice ? (
                                        <button
                                            onClick={() => removePriceAlert(token.address)}
                                            className="flex items-center space-x-1 text-red-400 hover:text-red-300 text-xs"
                                        >
                                            <BellOff size={12} />
                                            <span>Remove Alert</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                const price = prompt('Enter alert price:');
                                                if (price && !isNaN(price)) {
                                                    setPriceAlert(token.address, parseFloat(price));
                                                }
                                            }}
                                            className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-xs"
                                        >
                                            <Bell size={12} />
                                            <span>Set Alert</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-400 text-center py-8">
                    <Star className="mx-auto mb-4 text-gray-500" size={48} />
                    <p>No favorite tokens yet</p>
                    <p className="text-sm mt-2">Add tokens to your favorites to track them easily</p>
                </div>
            )}
        </div>
    );
};

export default FavoriteTokens; 