import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { APTOS_CONFIG } from '../config/aptos';

const TokenList = () => {
  const { connected, account } = useWallet();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popular Aptos tokens
  const popularTokens = [
    {
      symbol: 'APT',
      name: 'Aptos Coin',
      address: '0x1::aptos_coin::AptosCoin',
      decimals: 8,
      logo: 'https://cryptologos.cc/logos/aptos-apt-logo.png'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x1::coin::USDC',
      decimals: 6,
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x1::coin::USDT',
      decimals: 6,
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      address: '0x1::coin::BTC',
      decimals: 8,
      logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x1::coin::ETH',
      decimals: 8,
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
    }
  ];

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, use static data
        // In production, you would fetch from Panora API or similar
        setTokens(popularTokens);
        
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError('Failed to load tokens');
        // Fallback to static data
        setTokens(popularTokens);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
        <p className="text-gray-400 text-sm mt-2">Showing default tokens</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Popular Tokens</h3>
        {connected && (
          <span className="text-sm text-green-400">
            Connected: {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
          </span>
        )}
      </div>
      
      <div className="grid gap-4">
        {tokens.map((token, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-[#2a2a35] rounded-lg border border-[#3a3a45] hover:border-[#4a4a55] transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-bold">{token.symbol}</span>
              </div>
              <div>
                <h4 className="font-semibold">{token.name}</h4>
                <p className="text-sm text-gray-400">{token.symbol}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-400">Decimals: {token.decimals}</p>
              <p className="text-xs text-gray-500 font-mono">
                {token.address.slice(0, 20)}...
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {!connected && (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">
            Connect your wallet to see token balances
          </p>
        </div>
      )}
    </div>
  );
};

export default TokenList; 