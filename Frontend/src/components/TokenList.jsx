import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';

const TokenList = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTokens();
    }, []);

    const fetchTokens = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Follow Aptos Guide: Use Panora Exchange API
            const response = await axios.get('https://api.panora.exchange/tokens');
            
            // Transform data according to guide format
            const transformedTokens = response.data.map(token => ({
                id: token.tokenAddress || token.faAddress,
                name: token.name || 'Unknown',
                symbol: token.symbol || 'UNKNOWN',
                address: token.tokenAddress || token.faAddress || '',
                logoUrl: token.logoUrl || '',
                decimals: token.decimals || 8,
                panoraTags: token.panoraTags || [],
                // Add price info if available
                price: 0, // Will be fetched separately if needed
                priceChange24h: 0,
                marketCap: 0,
                volume24h: 0,
                tags: token.panoraTags || [] // Map panoraTags to tags for compatibility
            }));
            
            setTokens(transformedTokens);
        } catch (error) {
            console.error('Error fetching token list:', error);
            setError('Failed to fetch token list');
        } finally {
            setLoading(false);
        }
    };

    const filteredTokens = tokens.filter((token) => {
        const matchesFilter = filter === 'All' || token.tags?.includes(filter);
        const matchesSearch = token.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            token.symbol?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getFilterOptions = () => {
        const allTags = new Set();
        tokens.forEach(token => {
            token.tags?.forEach(tag => allTags.add(tag));
        });
        return ['All', ...Array.from(allTags)];
    };

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        return `${address.slice(0, 8)}...${address.slice(-6)}`;
    };

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 6
        }).format(price);
    };

    const formatMarketCap = (marketCap) => {
        if (!marketCap) return '$0';
        if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
        if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
        if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
        return `$${marketCap.toFixed(2)}`;
    };

    const getPriceChangeColor = (change) => {
        if (!change) return 'text-gray-400';
        return change > 0 ? 'text-green-400' : 'text-red-400';
    };

    const getPriceChangeIcon = (change) => {
        if (!change) return null;
        return change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />;
    };

    if (loading) {
        return (
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
                <h2 className="text-xl font-bold text-white mb-4">Aptos Token List (Panora Exchange)</h2>
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-cyan-500" size={32} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
                <h2 className="text-xl font-bold text-white mb-4">Aptos Token List (Panora Exchange)</h2>
                <div className="text-red-400 text-center py-8">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Aptos Token List (GeckoTerminal)</h2>
                <button 
                    onClick={fetchTokens}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                    <Loader2 size={16} className={loading ? 'animate-spin' : 'hidden'} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#2a2a35] border border-[#3a3a45] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                {getFilterOptions().map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setFilter(tag)}
                        className={`px-3 py-1 text-sm rounded-lg transition ${
                            filter === tag
                                ? 'bg-cyan-600 text-white'
                                : 'bg-[#2a2a35] text-gray-300 hover:bg-[#3a3a45]'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Token List */}
            <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredTokens.length > 0 ? (
                    filteredTokens.map((token) => (
                        <div 
                            key={token.id}
                            className="bg-[#2a2a35] rounded-lg p-4 border border-[#3a3a45] hover:border-cyan-500/50 transition"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <img 
                                        src={token.logoUrl || '/default-token-icon.png'} 
                                        alt={`${token.name} logo`} 
                                        className="w-8 h-8 rounded-full"
                                        onError={(e) => {
                                            e.target.src = '/default-token-icon.png';
                                        }}
                                    />
                                    <div>
                                        <div className="text-white font-medium">
                                            {token.name} ({token.symbol})
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            {formatAddress(token.address)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-medium">
                                        {formatPrice(token.price)}
                                    </div>
                                    {token.priceChange24h && (
                                        <div className={`flex items-center space-x-1 text-sm ${getPriceChangeColor(token.priceChange24h)}`}>
                                            {getPriceChangeIcon(token.priceChange24h)}
                                            <span>{token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400">Market Cap:</span>
                                    <span className="text-white ml-2">
                                        {formatMarketCap(token.marketCap)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">24h Volume:</span>
                                    <span className="text-white ml-2">
                                        {formatMarketCap(token.volume24h)}
                                    </span>
                                </div>
                            </div>
                            
                            {token.tags && token.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {token.tags.map((tag, index) => (
                                        <span 
                                            key={index}
                                            className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-gray-400 text-center py-8">
                        No tokens found matching your criteria
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="mt-4 text-sm text-gray-400 text-center">
                Showing {filteredTokens.length} of {tokens.length} tokens
            </div>
        </div>
    );
};

export default TokenList; 