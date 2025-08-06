import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search, Filter } from 'lucide-react';

const TokenList = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTokens = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('https://api.panora.exchange/tokens');
        setTokens(response.data);
      } catch (error) {
        console.error('Error fetching token list:', error);
        setError('Failed to load tokens');
      } finally {
        setLoading(false);
      }
    };

    getTokens();
  }, []);

  const filteredTokens = tokens.filter((token) => {
    const matchesFilter = filter === 'All' || 
      (token.panoraTags && token.panoraTags.includes(filter));
    
    const matchesSearch = searchTerm === '' || 
      token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
        <span className="ml-2 text-gray-400">Loading tokens...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Aptos Token List</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[#1c1c24] border border-[#2a2a35] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setFilter('All')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'All' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-[#2a2a35] text-gray-300 hover:bg-[#3a3a45]'
          }`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('Native')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'Native' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-[#2a2a35] text-gray-300 hover:bg-[#3a3a45]'
          }`}
        >
          Native
        </button>
        <button 
          onClick={() => setFilter('Emojicoin')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'Emojicoin' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-[#2a2a35] text-gray-300 hover:bg-[#3a3a45]'
          }`}
        >
          Emojicoin
        </button>
        <button 
          onClick={() => setFilter('Meme')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'Meme' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-[#2a2a35] text-gray-300 hover:bg-[#3a3a45]'
          }`}
        >
          Meme
        </button>
      </div>

      {/* Token Count */}
      <div className="text-gray-400">
        Showing {filteredTokens.length} of {tokens.length} tokens
      </div>

      {/* Token List */}
      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {filteredTokens.length > 0 ? (
          filteredTokens.map((token) => (
            <div 
              key={token.tokenAddress || token.faAddress}
              className="flex items-center justify-between p-4 bg-[#1c1c24] border border-[#2a2a35] rounded-lg hover:border-cyan-500/50 transition"
            >
              <div className="flex items-center space-x-3">
                <img 
                  src={token.logoUrl} 
                  alt={`${token.name} logo`} 
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/32x32/666666/FFFFFF?text=?';
                  }}
                />
                <div>
                  <div className="text-white font-medium">
                    {token.name} ({token.symbol})
                  </div>
                  <div className="text-gray-400 text-sm">
                    Decimals: {token.decimals}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-gray-400 text-sm">
                  {token.tokenAddress || token.faAddress}
                </div>
                {token.panoraTags && token.panoraTags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {token.panoraTags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-[#2a2a35] text-xs text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            No tokens found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenList; 