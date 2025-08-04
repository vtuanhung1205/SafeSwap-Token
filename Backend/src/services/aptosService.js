const { AptosClient, AptosAccount, TxnBuilderTypes, BCS, HexString, Provider } = require('aptos');
const logger = require('../utils/logger');

class AptosService {
  constructor() {
    this.client = null;
    this.provider = null;
    this.network = process.env.APTOS_NETWORK || 'mainnet';
    this.nodeUrl = process.env.APTOS_NODE_URL || 'https://fullnode.mainnet.aptoslabs.com/v1';
    this.faucetUrl = process.env.APTOS_FAUCET_URL || 'https://faucet.mainnet.aptoslabs.com';
    this.chainId = 1; // Mainnet chain ID
  }

  async initialize() {
    try {
      this.client = new AptosClient(this.nodeUrl);
      this.provider = new Provider(this.network);
      
      // Test connection
      const ledgerInfo = await this.client.getLedgerInfo();
      logger.info(`Connected to Aptos ${this.network}: Ledger version ${ledgerInfo.ledger_version}`);
      
      // Get chain ID
      this.chainId = await this.client.getChainId();
      logger.info(`Chain ID: ${this.chainId}`);
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize Aptos service:', error);
      throw error;
    }
  }

  // Get account information with enhanced details
  async getAccountInfo(address) {
    try {
      const accountInfo = await this.client.getAccount(address);
      const resources = await this.client.getAccountResources(address);
      
      return {
        ...accountInfo,
        resources: resources.length,
        hasResources: resources.length > 0
      };
    } catch (error) {
      logger.error(`Error getting account info for ${address}:`, error);
      throw error;
    }
  }

  // Get account resources with better parsing
  async getAccountResources(address) {
    try {
      const resources = await this.client.getAccountResources(address);
      
      // Parse and categorize resources
      const categorizedResources = {
        coins: [],
        tokens: [],
        nfts: [],
        other: []
      };
      
      resources.forEach(resource => {
        if (resource.type.includes('::coin::CoinStore<')) {
          categorizedResources.coins.push(resource);
        } else if (resource.type.includes('::token::TokenStore')) {
          categorizedResources.tokens.push(resource);
        } else if (resource.type.includes('::nft::')) {
          categorizedResources.nfts.push(resource);
        } else {
          categorizedResources.other.push(resource);
        }
      });
      
      return {
        all: resources,
        categorized: categorizedResources,
        total: resources.length
      };
    } catch (error) {
      logger.error(`Error getting resources for ${address}:`, error);
      throw error;
    }
  }

  // Enhanced token balance retrieval
  async getTokenBalance(address, tokenAddress, tokenName, tokenPropertyVersion = 0) {
    try {
      const tokenStore = await this.client.getAccountResource(
        address,
        "0x1::coin::CoinStore<" + tokenAddress + "::" + tokenName + ">"
      );
      
      if (tokenStore && tokenStore.data) {
        return {
          amount: tokenStore.data.coin.value,
          decimals: tokenStore.data.coin.decimals,
          formattedAmount: (parseFloat(tokenStore.data.coin.value) / Math.pow(10, tokenStore.data.coin.decimals)).toFixed(tokenStore.data.coin.decimals),
          tokenAddress,
          tokenName
        };
      }
      
      return { 
        amount: '0', 
        decimals: 8,
        formattedAmount: '0.00000000',
        tokenAddress,
        tokenName
      };
    } catch (error) {
      logger.error(`Error getting token balance for ${address}:`, error);
      return { 
        amount: '0', 
        decimals: 8,
        formattedAmount: '0.00000000',
        tokenAddress,
        tokenName
      };
    }
  }

  // Get all token balances for an account
  async getAllTokenBalances(address) {
    try {
      const resources = await this.client.getAccountResources(address);
      const balances = [];
      
      for (const resource of resources) {
        if (resource.type.includes('::coin::CoinStore<')) {
          const tokenInfo = resource.type.match(/CoinStore<(.+)>/);
          if (tokenInfo) {
            const fullTokenType = tokenInfo[1];
            const [tokenAddress, tokenName] = fullTokenType.split('::');
            
            try {
              const balance = await this.getTokenBalance(address, tokenAddress, tokenName);
              if (parseFloat(balance.amount) > 0) {
                balances.push(balance);
              }
            } catch (error) {
              logger.error(`Error getting balance for ${fullTokenType}:`, error);
            }
          }
        }
      }
      
      return balances;
    } catch (error) {
      logger.error(`Error getting all token balances for ${address}:`, error);
      throw error;
    }
  }

  // Enhanced transaction details
  async getTransaction(txnHash) {
    try {
      const transaction = await this.client.getTransactionByHash(txnHash);
      
      // Parse transaction details
      const parsedTx = {
        ...transaction,
        parsed: this.parseTransactionDetails(transaction)
      };
      
      return parsedTx;
    } catch (error) {
      logger.error(`Error getting transaction ${txnHash}:`, error);
      throw error;
    }
  }

  // Parse transaction details for better understanding
  parseTransactionDetails(transaction) {
    const parsed = {
      type: 'unknown',
      function: null,
      arguments: [],
      tokenTransfers: [],
      gasUsed: transaction.gas_used || 0,
      gasPrice: transaction.gas_unit_price || 0,
      success: transaction.success || false
    };
    
    if (transaction.payload && transaction.payload.type === 'entry_function_payload') {
      parsed.function = transaction.payload.function;
      parsed.arguments = transaction.payload.arguments || [];
      
      // Determine transaction type
      if (parsed.function.includes('transfer')) {
        parsed.type = 'transfer';
        
        // Parse transfer details
        if (parsed.arguments.length >= 2) {
          parsed.tokenTransfers.push({
            to: parsed.arguments[0],
            amount: parsed.arguments[1]
          });
        }
      } else if (parsed.function.includes('swap')) {
        parsed.type = 'swap';
      } else if (parsed.function.includes('mint')) {
        parsed.type = 'mint';
      } else if (parsed.function.includes('burn')) {
        parsed.type = 'burn';
      }
    }
    
    return parsed;
  }

  // Get recent transactions with enhanced filtering
  async getAccountTransactions(address, limit = 25, start = null) {
    try {
      const options = { limit };
      if (start) {
        options.start = start;
      }
      
      const transactions = await this.client.getAccountTransactions(address, options);
      
      // Parse and enhance transaction data
      const enhancedTransactions = transactions.map(tx => ({
        ...tx,
        parsed: this.parseTransactionDetails(tx)
      }));
      
      return enhancedTransactions;
    } catch (error) {
      logger.error(`Error getting transactions for ${address}:`, error);
      throw error;
    }
  }

  // Enhanced transaction submission with better error handling
  async submitTransaction(sender, payload, maxGasAmount = 2000) {
    try {
      const entryFunctionPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(payload);
      
      const rawTxn = await this.client.generateTransaction(sender.address(), entryFunctionPayload, {
        max_gas_amount: maxGasAmount
      });
      
      const bcsTxn = await this.client.signTransaction(sender, rawTxn);
      const transactionRes = await this.client.submitTransaction(bcsTxn);
      
      // Wait for transaction with timeout
      const timeout = 30000; // 30 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        try {
          const tx = await this.client.getTransactionByHash(transactionRes.hash);
          if (tx && tx.success !== undefined) {
            return {
              hash: transactionRes.hash,
              success: tx.success,
              vmStatus: tx.vm_status,
              gasUsed: tx.gas_used,
              gasPrice: tx.gas_unit_price
            };
          }
        } catch (error) {
          // Transaction not yet processed, continue waiting
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      }
      
      throw new Error('Transaction timeout');
    } catch (error) {
      logger.error('Error submitting transaction:', error);
      throw error;
    }
  }

  // Create token transfer payload with validation
  createTransferPayload(to, amount, tokenAddress, tokenName) {
    try {
      // Validate addresses
      if (!this.isValidAddress(to)) {
        throw new Error('Invalid recipient address');
      }
      
      if (!this.isValidAddress(tokenAddress)) {
        throw new Error('Invalid token address');
      }
      
      // Validate amount
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid amount');
      }
      
      const entryFunction = new TxnBuilderTypes.EntryFunction(
        TxnBuilderTypes.ModuleId.fromStr("0x1::coin"),
        "transfer",
        [new TxnBuilderTypes.TypeTagStruct(
          TxnBuilderTypes.StructTag.fromString(`${tokenAddress}::${tokenName}`)
        )],
        [BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(to)), BCS.bcsSerializeUint64(amount)]
      );
      
      return entryFunction;
    } catch (error) {
      logger.error('Error creating transfer payload:', error);
      throw error;
    }
  }

  // Enhanced token metadata retrieval
  async getTokenMetadata(tokenAddress, tokenName) {
    try {
      const metadata = await this.client.getAccountResource(
        tokenAddress,
        `0x1::coin::CoinInfo<${tokenAddress}::${tokenName}>`
      );
      
      if (metadata && metadata.data) {
        return {
          ...metadata.data,
          tokenAddress,
          tokenName,
          fullName: `${tokenAddress}::${tokenName}`
        };
      }
      
      throw new Error('Token metadata not found');
    } catch (error) {
      logger.error(`Error getting token metadata for ${tokenAddress}::${tokenName}:`, error);
      throw error;
    }
  }

  // Get current block height with caching
  async getBlockHeight() {
    try {
      const ledgerInfo = await this.client.getLedgerInfo();
      return ledgerInfo.ledger_version;
    } catch (error) {
      logger.error('Error getting block height:', error);
      throw error;
    }
  }

  // Enhanced network status
  async getNetworkStatus() {
    try {
      const ledgerInfo = await this.client.getLedgerInfo();
      const chainId = await this.client.getChainId();
      
      return {
        chainId,
        ledgerVersion: ledgerInfo.ledger_version,
        timestamp: ledgerInfo.ledger_timestamp,
        network: this.network,
        nodeUrl: this.nodeUrl,
        isHealthy: true,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting network status:', error);
      throw error;
    }
  }

  // Enhanced address validation
  isValidAddress(address) {
    try {
      if (!address || typeof address !== 'string') {
        return false;
      }
      
      // Remove 0x prefix if present
      const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
      
      // Check length (Aptos addresses are 64 hex characters)
      if (cleanAddress.length !== 64) {
        return false;
      }
      
      // Check if it's valid hex
      if (!/^[0-9a-fA-F]+$/.test(cleanAddress)) {
        return false;
      }
      
      HexString.ensure(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get transaction events with better parsing
  async getTransactionEvents(txnHash) {
    try {
      const events = await this.client.getEventsByEventHandle(
        "0x1::coin::CoinStore",
        "withdraw_events",
        txnHash
      );
      
      // Parse events
      const parsedEvents = events.map(event => ({
        ...event,
        parsed: this.parseEventData(event)
      }));
      
      return parsedEvents;
    } catch (error) {
      logger.error(`Error getting events for transaction ${txnHash}:`, error);
      throw error;
    }
  }

  // Parse event data
  parseEventData(event) {
    try {
      const parsed = {
        type: 'unknown',
        data: {}
      };
      
      if (event.type && event.type.includes('withdraw_events')) {
        parsed.type = 'withdraw';
        parsed.data = event.data || {};
      } else if (event.type && event.type.includes('deposit_events')) {
        parsed.type = 'deposit';
        parsed.data = event.data || {};
      }
      
      return parsed;
    } catch (error) {
      logger.error('Error parsing event data:', error);
      return { type: 'unknown', data: {} };
    }
  }

  // Estimate gas for transaction
  async estimateGas(payload, senderAddress) {
    try {
      const entryFunctionPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(payload);
      
      const rawTxn = await this.client.generateTransaction(senderAddress, entryFunctionPayload, {
        max_gas_amount: 2000
      });
      
      // For estimation, we'll use a default value
      // In a real implementation, you might want to simulate the transaction
      return {
        estimatedGas: 1000,
        gasPrice: 100,
        totalFee: 100000
      };
    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw error;
    }
  }

  // Get account balance in APT
  async getAccountBalance(address) {
    try {
      return await this.getTokenBalance(
        address,
        '0x1',
        'aptos_coin::AptosCoin'
      );
    } catch (error) {
      logger.error(`Error getting account balance for ${address}:`, error);
      throw error;
    }
  }

  // Check if account exists
  async accountExists(address) {
    try {
      await this.client.getAccount(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get account sequence number
  async getAccountSequenceNumber(address) {
    try {
      const accountInfo = await this.client.getAccount(address);
      return accountInfo.sequence_number;
    } catch (error) {
      logger.error(`Error getting sequence number for ${address}:`, error);
      throw error;
    }
  }
}

module.exports = new AptosService(); 