const axios = require('axios');
const { logger } = require('../utils/logger');

class ScamDetectionService {
  constructor() {
    this.riskThreshold = 70;
    this.aiServiceUrl = process.env.AI_SERVICE_URL || '';
    
    if (!this.aiServiceUrl) {
      logger.warn('AI_SERVICE_URL is not set. Using fallback scam detection.');
    }
  }

  async analyzeToken(tokenAddress, tokenName = '', tokenSymbol = '') {
    try {
      if (this.aiServiceUrl) {
        return await this.analyzeWithAI(tokenAddress);
      } else {
        return await this.analyzeWithFallback(tokenAddress, tokenName, tokenSymbol);
      }
    } catch (error) {
      logger.error(`Failed to analyze token ${tokenAddress}:`, error);
      throw error;
    }
  }

  async analyzeWithAI(tokenAddress) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/predict`, {
        wallet_address: tokenAddress,
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const aiData = response.data;

      const analysisResult = {
        tokenAddress: aiData.wallet_address || tokenAddress,
        isScam: aiData.prediction === 'Sybil',
        riskScore: Math.round((aiData.sybil_probability || 0) * 100),
        confidence: Math.round((aiData.confidence || 0.5) * 100),
        reasons: [
          `AI Prediction: ${aiData.prediction || 'Unknown'}`,
          `Sybil Probability: ${Math.round((aiData.sybil_probability || 0) * 100)}%`
        ],
        checkedAt: new Date(),
      };

      logger.info(`AI analysis completed for ${tokenAddress}: Risk Score ${analysisResult.riskScore}`);
      return analysisResult;

    } catch (error) {
      logger.error(`Error calling AI service for token ${tokenAddress}:`, error.message);
      
      // Fallback to manual analysis if AI service fails
      return await this.analyzeWithFallback(tokenAddress, '', '');
    }
  }

  async analyzeWithFallback(tokenAddress, tokenName = '', tokenSymbol = '') {
    try {
      let riskScore = 0;
      const reasons = [];

      // Basic address validation
      if (!this.isValidAptosAddress(tokenAddress)) {
        riskScore += 50;
        reasons.push('Invalid or suspicious address format');
      }

      // Check for suspicious patterns in name/symbol
      if (tokenName || tokenSymbol) {
        const nameAnalysis = this.analyzeTokenName(tokenName, tokenSymbol);
        riskScore += nameAnalysis.riskScore;
        reasons.push(...nameAnalysis.reasons);
      }

      // Check against known scam patterns
      const patternAnalysis = this.checkSuspiciousPatterns(tokenAddress);
      riskScore += patternAnalysis.riskScore;
      reasons.push(...patternAnalysis.reasons);

      // Cap risk score at 100
      riskScore = Math.min(riskScore, 100);

      const analysisResult = {
        tokenAddress,
        isScam: riskScore >= this.riskThreshold,
        riskScore,
        confidence: this.calculateConfidence(reasons.length),
        reasons: reasons.length > 0 ? reasons : ['No suspicious patterns detected'],
        checkedAt: new Date(),
      };

      logger.info(`Fallback analysis completed for ${tokenAddress}: Risk Score ${riskScore}`);
      return analysisResult;

    } catch (error) {
      logger.error(`Fallback analysis failed for ${tokenAddress}:`, error);
      
      // Return safe default if all analysis fails
      return {
        tokenAddress,
        isScam: false,
        riskScore: 0,
        confidence: 0,
        reasons: ['Analysis unavailable'],
        checkedAt: new Date(),
      };
    }
  }

  analyzeTokenName(tokenName, tokenSymbol) {
    let riskScore = 0;
    const reasons = [];

    const suspiciousPatterns = [
      /test|fake|scam|rug|moon|safe|baby|doge|elon|shib/i,
      /\$|💰|🚀|💎|🔥/,
      /x{3,}|!{2,}|\.{3,}/,
    ];

    const name = `${tokenName} ${tokenSymbol}`.toLowerCase();

    suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(name)) {
        switch (index) {
          case 0:
            riskScore += 30;
            reasons.push('Contains suspicious keywords');
            break;
          case 1:
            riskScore += 20;
            reasons.push('Contains suspicious symbols');
            break;
          case 2:
            riskScore += 15;
            reasons.push('Contains excessive special characters');
            break;
        }
      }
    });

    return { riskScore, reasons };
  }

  checkSuspiciousPatterns(address) {
    let riskScore = 0;
    const reasons = [];

    // Check for known scam address patterns
    const suspiciousPatterns = [
      /^0x000+/, // All zeros or mostly zeros
      /^0x111+/, // Repeated digits
      /^0xfff+/, // All F's
    ];

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(address.toLowerCase())) {
        riskScore += 25;
        reasons.push('Address matches known scam patterns');
      }
    });

    return { riskScore, reasons };
  }

  isValidAptosAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }

    // Aptos addresses are typically 64 characters (32 bytes) hex string with 0x prefix
    const aptosAddressRegex = /^0x[a-fA-F0-9]{1,64}$/;
    return aptosAddressRegex.test(address);
  }

  calculateConfidence(reasonCount) {
    if (reasonCount === 0) return 50; // Neutral confidence
    if (reasonCount <= 2) return 60;
    if (reasonCount <= 4) return 75;
    return 90;
  }

  async batchAnalyze(addresses) {
    try {
      const results = await Promise.allSettled(
        addresses.map(addr => this.analyzeToken(addr))
      );

      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          logger.error(`Failed to analyze address ${addresses[index]}:`, result.reason);
          return {
            tokenAddress: addresses[index],
            isScam: false,
            riskScore: 0,
            confidence: 0,
            reasons: ['Analysis failed'],
            checkedAt: new Date(),
          };
        }
      });
    } catch (error) {
      logger.error('Batch analysis failed:', error);
      throw error;
    }
  }

  getHealthStatus() {
    return {
      service: 'ScamDetectionService',
      status: this.aiServiceUrl ? 'AI-enabled' : 'Fallback-mode',
      aiServiceUrl: this.aiServiceUrl ? 'configured' : 'not-configured',
      riskThreshold: this.riskThreshold
    };
  }
}

module.exports = { ScamDetectionService };
