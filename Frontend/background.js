// Background Script for SafeSwap Wallet Extension
// Handles extension lifecycle and communication

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('SafeSwap Wallet Extension installed');
    
    // Initialize extension storage
    chrome.storage.local.set({
      safeSwapWallet: null,
      extensionInstalled: true,
      installDate: Date.now()
    });
  } else if (details.reason === 'update') {
    console.log('SafeSwap Wallet Extension updated');
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('SafeSwap Wallet Extension started');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', request);
  
  switch (request.type) {
    case 'getWalletInfo':
      // Get wallet info from storage
      chrome.storage.local.get(['safeSwapWallet'], (result) => {
        sendResponse({
          name: 'SafeSwap',
          url: 'https://safeswap-frontend.onrender.com',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzM4NEVGRiIvPgo8L3N2Zz4K',
          readyState: 'Detected',
          isAIP62Standard: true,
          connected: !!result.safeSwapWallet,
          account: result.safeSwapWallet?.address || null,
          publicKey: result.safeSwapWallet?.publicKey || null
        });
      });
      return true; // Keep message channel open for async response
      
    case 'connectWallet':
      // Handle wallet connection
      chrome.storage.local.set({
        safeSwapWallet: {
          address: request.address,
          publicKey: request.publicKey,
          createdAt: Date.now()
        }
      }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'disconnectWallet':
      // Handle wallet disconnection
      chrome.storage.local.remove(['safeSwapWallet'], () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'getExtensionInfo':
      // Return extension information
      sendResponse({
        name: 'SafeSwap Wallet',
        version: '1.0.0',
        description: 'AIP-62 compatible Aptos wallet for SafeSwap',
        homepage: 'https://safeswap-frontend.onrender.com'
      });
      break;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// Handle tab updates to inject wallet adapter
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    // Inject wallet adapter into the page
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-script.js']
    }).catch((error) => {
      console.log('Could not inject wallet adapter:', error);
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup or navigate to SafeSwap
  chrome.tabs.create({
    url: 'https://safeswap-frontend.onrender.com'
  });
});

// Keep service worker alive
chrome.runtime.onSuspend.addListener(() => {
  console.log('SafeSwap Wallet Extension suspended');
});
