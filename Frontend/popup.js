// Popup Script for SafeSwap Wallet Extension
// Handles popup UI interactions and wallet management

document.addEventListener('DOMContentLoaded', function() {
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const openDappBtn = document.getElementById('openDappBtn');
    const connectionStatus = document.getElementById('connectionStatus');
    const accountInfo = document.getElementById('accountInfo');
    const accountAddress = document.getElementById('accountAddress');
    const publicKey = document.getElementById('publicKey');

    // Load initial state
    loadWalletState();

    // Connect wallet button
    connectBtn.addEventListener('click', async () => {
        try {
            connectBtn.disabled = true;
            connectBtn.textContent = 'Connecting...';
            
            // Create a new wallet account
            const address = '0x' + Math.random().toString(16).substr(2, 64);
            const pubKey = '0x' + Math.random().toString(16).substr(2, 64);
            
            // Store wallet data
            await chrome.storage.local.set({
                safeSwapWallet: {
                    address: address,
                    publicKey: pubKey,
                    createdAt: Date.now()
                }
            });
            
            // Update UI
            updateUI(true, address, pubKey);
            
            // Notify content scripts
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'walletConnected',
                        data: { address, publicKey: pubKey }
                    });
                }
            });
            
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet');
        } finally {
            connectBtn.disabled = false;
            connectBtn.textContent = 'Connect Wallet';
        }
    });

    // Disconnect wallet button
    disconnectBtn.addEventListener('click', async () => {
        try {
            disconnectBtn.disabled = true;
            disconnectBtn.textContent = 'Disconnecting...';
            
            // Clear wallet data
            await chrome.storage.local.remove(['safeSwapWallet']);
            
            // Update UI
            updateUI(false);
            
            // Notify content scripts
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'walletDisconnected'
                    });
                }
            });
            
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            alert('Failed to disconnect wallet');
        } finally {
            disconnectBtn.disabled = false;
            disconnectBtn.textContent = 'Disconnect';
        }
    });

    // Open SafeSwap dapp button
    openDappBtn.addEventListener('click', () => {
        chrome.tabs.create({
            url: 'https://safeswap-frontend.onrender.com'
        });
    });

    // Load wallet state from storage
    async function loadWalletState() {
        try {
            const result = await chrome.storage.local.get(['safeSwapWallet']);
            if (result.safeSwapWallet) {
                const wallet = result.safeSwapWallet;
                updateUI(true, wallet.address, wallet.publicKey);
            } else {
                updateUI(false);
            }
        } catch (error) {
            console.error('Error loading wallet state:', error);
            updateUI(false);
        }
    }

    // Update UI based on connection state
    function updateUI(connected, address = null, pubKey = null) {
        if (connected) {
            connectionStatus.textContent = 'Connected';
            connectionStatus.className = 'status-value connected';
            
            accountAddress.textContent = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
            publicKey.textContent = pubKey ? `${pubKey.slice(0, 6)}...${pubKey.slice(-4)}` : '';
            accountInfo.classList.remove('hidden');
            
            connectBtn.classList.add('hidden');
            disconnectBtn.classList.remove('hidden');
        } else {
            connectionStatus.textContent = 'Disconnected';
            connectionStatus.className = 'status-value disconnected';
            
            accountInfo.classList.add('hidden');
            
            connectBtn.classList.remove('hidden');
            disconnectBtn.classList.add('hidden');
        }
    }

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.safeSwapWallet) {
            const wallet = changes.safeSwapWallet.newValue;
            if (wallet) {
                updateUI(true, wallet.address, wallet.publicKey);
            } else {
                updateUI(false);
            }
        }
    });

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'updateWalletState') {
            loadWalletState();
        }
    });
});
