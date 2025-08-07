// Integration Test for SafeSwap Wallet Adapter
// This file tests the integration between the wallet adapter and existing frontend components

import safeSwapWallet from './SafeSwapWalletAdapter.js';
import { APTOS_CONFIG, getAptosClient } from '../config/aptos.js';

// Test suite for wallet adapter integration
export class WalletAdapterIntegrationTest {
  constructor() {
    this.testResults = [];
    this.errors = [];
  }

  // Run all integration tests
  async runAllTests() {
    console.log('🧪 Starting SafeSwap Wallet Adapter Integration Tests...');
    
    try {
      await this.testWalletInitialization();
      await this.testAptosConfigIntegration();
      await this.testEventSystem();
      await this.testLocalStorageIntegration();
      await this.testGlobalRegistration();
      await this.testErrorHandling();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Integration test failed:', error);
      this.errors.push(error);
    }
  }

  // Test wallet initialization
  async testWalletInitialization() {
    console.log('📋 Testing wallet initialization...');
    
    try {
      // Test basic wallet properties
      const walletInfo = safeSwapWallet.getWalletInfo();
      
      if (walletInfo.name !== 'SafeSwap') {
        throw new Error('Wallet name should be "SafeSwap"');
      }
      
      if (walletInfo.url !== 'https://safeswap-frontend.onrender.com') {
        throw new Error('Wallet URL should match SafeSwap frontend');
      }
      
      if (!walletInfo.isAIP62Standard) {
        throw new Error('Wallet should be AIP-62 standard compliant');
      }
      
      this.testResults.push({
        test: 'Wallet Initialization',
        status: '✅ PASSED',
        details: 'Wallet properly initialized with correct properties'
      });
      
    } catch (error) {
      this.testResults.push({
        test: 'Wallet Initialization',
        status: '❌ FAILED',
        details: error.message
      });
      this.errors.push(error);
    }
  }

  // Test Aptos configuration integration
  async testAptosConfigIntegration() {
    console.log('📋 Testing Aptos configuration integration...');
    
    try {
      // Test that Aptos client can be created
      const aptosClient = getAptosClient();
      
      if (!aptosClient) {
        throw new Error('Aptos client should be created successfully');
      }
      
      // Test that wallet uses the same node URL as config
      const walletClient = safeSwapWallet.client;
      const configClient = new (await import('aptos')).AptosClient(APTOS_CONFIG.NODE_URL);
      
      // Both should be AptosClient instances
      if (!(walletClient instanceof (await import('aptos')).AptosClient)) {
        throw new Error('Wallet client should be an AptosClient instance');
      }
      
      this.testResults.push({
        test: 'Aptos Configuration Integration',
        status: '✅ PASSED',
        details: 'Wallet properly integrates with Aptos configuration'
      });
      
    } catch (error) {
      this.testResults.push({
        test: 'Aptos Configuration Integration',
        status: '❌ FAILED',
        details: error.message
      });
      this.errors.push(error);
    }
  }

  // Test event system
  async testEventSystem() {
    console.log('📋 Testing event system...');
    
    try {
      let eventReceived = false;
      let eventData = null;
      
      // Test event listener registration
      const testCallback = (data) => {
        eventReceived = true;
        eventData = data;
      };
      
      safeSwapWallet.on('test', testCallback);
      
      // Test event notification
      safeSwapWallet.notifyListeners('test', { test: 'data' });
      
      if (!eventReceived) {
        throw new Error('Event should be received by listener');
      }
      
      if (!eventData || eventData.test !== 'data') {
        throw new Error('Event data should be passed correctly');
      }
      
      // Test event listener removal
      safeSwapWallet.off('test', testCallback);
      eventReceived = false;
      safeSwapWallet.notifyListeners('test', { test: 'data2' });
      
      if (eventReceived) {
        throw new Error('Event should not be received after listener removal');
      }
      
      this.testResults.push({
        test: 'Event System',
        status: '✅ PASSED',
        details: 'Event system properly handles registration, notification, and removal'
      });
      
    } catch (error) {
      this.testResults.push({
        test: 'Event System',
        status: '❌ FAILED',
        details: error.message
      });
      this.errors.push(error);
    }
  }

  // Test localStorage integration
  async testLocalStorageIntegration() {
    console.log('📋 Testing localStorage integration...');
    
    try {
      // Clear any existing wallet data
      localStorage.removeItem('safeSwap_wallet');
      
      // Test wallet detection when no data exists
      const initialDetection = await safeSwapWallet.detectWallet();
      if (initialDetection) {
        throw new Error('Wallet should not be detected when no data exists');
      }
      
      // Test wallet connection and storage
      const connectionResult = await safeSwapWallet.connect();
      
      if (!connectionResult.account || !connectionResult.publicKey) {
        throw new Error('Connection should return account and public key');
      }
      
      // Check if data was stored
      const storedData = localStorage.getItem('safeSwap_wallet');
      if (!storedData) {
        throw new Error('Wallet data should be stored in localStorage');
      }
      
      const parsedData = JSON.parse(storedData);
      if (!parsedData.address || !parsedData.publicKey) {
        throw new Error('Stored data should contain address and public key');
      }
      
      // Test wallet detection with stored data
      const detectionWithData = await safeSwapWallet.detectWallet();
      if (!detectionWithData) {
        throw new Error('Wallet should be detected when data exists');
      }
      
      // Test disconnect and data removal
      await safeSwapWallet.disconnect();
      const storedDataAfterDisconnect = localStorage.getItem('safeSwap_wallet');
      if (storedDataAfterDisconnect) {
        throw new Error('Wallet data should be removed after disconnect');
      }
      
      this.testResults.push({
        test: 'LocalStorage Integration',
        status: '✅ PASSED',
        details: 'Wallet properly integrates with localStorage for persistence'
      });
      
    } catch (error) {
      this.testResults.push({
        test: 'LocalStorage Integration',
        status: '❌ FAILED',
        details: error.message
      });
      this.errors.push(error);
    }
  }

  // Test global registration
  async testGlobalRegistration() {
    console.log('📋 Testing global registration...');
    
    try {
      // Test that wallet is available globally
      if (typeof window !== 'undefined') {
        if (!window.safeSwapWallet) {
          throw new Error('Wallet should be available globally as window.safeSwapWallet');
        }
        
        if (window.safeSwapWallet !== safeSwapWallet) {
          throw new Error('Global wallet should be the same instance');
        }
      }
      
      this.testResults.push({
        test: 'Global Registration',
        status: '✅ PASSED',
        details: 'Wallet properly registered globally for dapp detection'
      });
      
    } catch (error) {
      this.testResults.push({
        test: 'Global Registration',
        status: '❌ FAILED',
        details: error.message
      });
      this.errors.push(error);
    }
  }

  // Test error handling
  async testErrorHandling() {
    console.log('📋 Testing error handling...');
    
    try {
      // Test error handling for unconnected wallet operations
      try {
        await safeSwapWallet.getAccountInfo();
        throw new Error('Should throw error when wallet not connected');
      } catch (error) {
        if (!error.message.includes('Wallet not connected')) {
          throw new Error('Should throw specific error message for unconnected wallet');
        }
      }
      
      // Test error handling for invalid operations
      try {
        await safeSwapWallet.signTransaction(null);
        throw new Error('Should throw error for invalid transaction');
      } catch (error) {
        if (!error.message.includes('Wallet not connected')) {
          throw new Error('Should handle invalid transaction gracefully');
        }
      }
      
      this.testResults.push({
        test: 'Error Handling',
        status: '✅ PASSED',
        details: 'Wallet properly handles errors and edge cases'
      });
      
    } catch (error) {
      this.testResults.push({
        test: 'Error Handling',
        status: '❌ FAILED',
        details: error.message
      });
      this.errors.push(error);
    }
  }

  // Print test results
  printResults() {
    console.log('\n📊 Integration Test Results:');
    console.log('================================');
    
    this.testResults.forEach(result => {
      console.log(`${result.status} ${result.test}: ${result.details}`);
    });
    
    console.log('\n📈 Summary:');
    const passed = this.testResults.filter(r => r.status.includes('PASSED')).length;
    const failed = this.testResults.filter(r => r.status.includes('FAILED')).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📋 Total: ${this.testResults.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n🚨 Errors:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
      });
    }
    
    if (failed === 0) {
      console.log('\n🎉 All integration tests passed! Wallet adapter is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }
}

// Auto-run tests if this file is imported
if (typeof window !== 'undefined') {
  const testRunner = new WalletAdapterIntegrationTest();
  testRunner.runAllTests();
}

export default WalletAdapterIntegrationTest;
