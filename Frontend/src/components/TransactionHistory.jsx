import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Loader2, ExternalLink, Clock, Hash } from 'lucide-react';

const TransactionHistory = () => {
    const { account, connected } = useWallet();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (connected && account) {
            fetchTransactions();
        }
    }, [connected, account]);

    const fetchTransactions = async () => {
        if (!connected || !account) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Use AptosClient to fetch transactions (as per the guide)
            const client = new (await import('aptos')).AptosClient('https://fullnode.mainnet.aptoslabs.com/v1');
            
            const txns = await client.getAccountTransactions({
                address: account.address,
                limit: 20 // Limit to last 20 transactions
            });
            
            setTransactions(txns);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Failed to fetch transaction history');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const formatTransactionType = (type) => {
        if (type.includes('coin::transfer')) return 'Transfer';
        if (type.includes('swap')) return 'Swap';
        if (type.includes('mint')) return 'Mint';
        if (type.includes('burn')) return 'Burn';
        return 'Other';
    };

    const formatAmount = (amount) => {
        if (!amount) return '0';
        return (Number(amount) / 100000000).toFixed(4);
    };

    const getTransactionStatus = (success) => {
        return success ? 'Success' : 'Failed';
    };

    const getStatusColor = (success) => {
        return success ? 'text-green-400' : 'text-red-400';
    };

    if (!connected) {
        return (
            <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
                <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
                <div className="text-gray-400 text-center py-8">
                    Please connect your wallet to view transaction history
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Transaction History</h2>
                <button 
                    onClick={fetchTransactions}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Clock size={16} />
                    )}
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
            ) : transactions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transactions.map((txn) => (
                        <div 
                            key={txn.hash} 
                            className="bg-[#2a2a35] rounded-lg p-4 border border-[#3a3a45] hover:border-cyan-500/50 transition"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                    <Hash size={16} className="text-gray-400" />
                                    <span className="text-white font-mono text-sm">
                                        {txn.hash.slice(0, 8)}...{txn.hash.slice(-6)}
                                    </span>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(txn.success)}`}>
                                    {getTransactionStatus(txn.success)}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400">Type:</span>
                                    <span className="text-white ml-2">
                                        {formatTransactionType(txn.payload?.function || 'Unknown')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Amount:</span>
                                    <span className="text-white ml-2">
                                        {formatAmount(txn.payload?.arguments?.[1] || '0')} APT
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Gas Used:</span>
                                    <span className="text-white ml-2">
                                        {txn.gas_used || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Timestamp:</span>
                                    <span className="text-white ml-2">
                                        {new Date(txn.timestamp / 1000).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                    Version: {txn.version}
                                </span>
                                <a 
                                    href={`https://explorer.aptoslabs.com/txn/${txn.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-xs"
                                >
                                    <span>View on Explorer</span>
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-400 text-center py-8">
                    No transactions found
                </div>
            )}
        </div>
    );
};

export default TransactionHistory; 