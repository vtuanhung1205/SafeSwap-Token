import axios from 'axios';
import { logger } from '@/utils/logger';

export interface ScamAnalysisResult {
  tokenAddress: string;
  riskScore: number;
  confidence: number;
  reasons: string[];
  isScam: boolean;
  checkedAt: Date;
}

export class ScamDetectionService {
  private readonly riskThreshold: number = 70;
  private readonly suspiciousPatterns: string[] = [
    'moon',
    'rocket',
    'safe',
    'baby',
    'doge',
    'elon',
    'shiba',
    'floki',
    'pump',
    'gem',
    'x1000',
    'guaranteed',
    'profit',
    'investment',
    'return',
  ];

  public async analyzeToken(tokenAddress: string, tokenName?: string, tokenSymbol?: string): Promise<ScamAnalysisResult> {
    try {
      const analysisResult: ScamAnalysisResult = {
        tokenAddress,
        riskScore: 0,
        confidence: 0,
        reasons: [],
        isScam: false,
        checkedAt: new Date(),
      };

      // Analyze token name and symbol
      if (tokenName || tokenSymbol) {
        const nameAnalysis = this.analyzeTokenName(tokenName || '', tokenSymbol || '');
        analysisResult.riskScore += nameAnalysis.riskScore;
        analysisResult.reasons.push(...nameAnalysis.reasons);
      }

      // Analyze token contract (basic checks)
      const contractAnalysis = await this.analyzeTokenContract(tokenAddress);
      analysisResult.riskScore += contractAnalysis.riskScore;
      analysisResult.reasons.push(...contractAnalysis.reasons);

      // Analyze market data
      const marketAnalysis = await this.analyzeMarketData(tokenAddress);
      analysisResult.riskScore += marketAnalysis.riskScore;
      analysisResult.reasons.push(...marketAnalysis.reasons);

      // Calculate final risk score and confidence
      analysisResult.riskScore = Math.min(100, Math.max(0, analysisResult.riskScore));
      analysisResult.confidence = this.calculateConfidence(analysisResult.reasons.length);
      analysisResult.isScam = analysisResult.riskScore >= this.riskThreshold;

      logger.info(`Token analysis completed for ${tokenAddress}: Risk Score ${analysisResult.riskScore}`);
      return analysisResult;
    } catch (error) {
      logger.error(`Failed to analyze token ${tokenAddress}:`, error);
      throw error;
    }
  }

  private analyzeTokenName(name: string, symbol: string): { riskScore: number; reasons: string[] } {
    const reasons: string[] = [];
    let riskScore = 0;

    const combinedText = `${name} ${symbol}`.toLowerCase();

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (combinedText.includes(pattern)) {
        riskScore += 15;
        reasons.push(`Contains suspicious keyword: "${pattern}"`);
      }
    }

    // Check for excessive use of special characters
    const specialCharCount = (combinedText.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    if (specialCharCount > 3) {
      riskScore += 10;
      reasons.push('Excessive use of special characters');
    }

    // Check for numbers that might indicate pump schemes
    if (/\d{3,}/.test(combinedText)) {
      riskScore += 10;
      reasons.push('Contains large numbers (potential pump scheme)');
    }

    // Check for all caps (often used in scam tokens)
    if (symbol.length > 3 && symbol === symbol.toUpperCase()) {
      riskScore += 5;
      reasons.push('Symbol is all uppercase');
    }

    return { riskScore, reasons };
  }

  private async analyzeTokenContract(tokenAddress: string): Promise<{ riskScore: number; reasons: string[] }> {
    const reasons: string[] = [];
    let riskScore = 0;

    try {
      // Basic address validation
      if (!this.isValidAddress(tokenAddress)) {
        riskScore += 50;
        reasons.push('Invalid token address format');
        return { riskScore, reasons };
      }

      // Check if address is too new or has suspicious patterns
      if (this.isNewAddress(tokenAddress)) {
        riskScore += 20;
        reasons.push('Token address appears to be recently created');
      }

      // Check for common scam contract patterns
      if (this.hasScamAddressPattern(tokenAddress)) {
        riskScore += 30;
        reasons.push('Address follows common scam patterns');
      }

      return { riskScore, reasons };
    } catch (error) {
      logger.error('Contract analysis failed:', error);
      riskScore += 25;
      reasons.push('Failed to analyze contract (suspicious)');
      return { riskScore, reasons };
    }
  }

  private async analyzeMarketData(tokenAddress: string): Promise<{ riskScore: number; reasons: string[] }> {
    const reasons: string[] = [];
    let riskScore = 0;

    try {
      // Mock market data analysis (in real implementation, you'd fetch from DEX APIs)
      const mockMarketData = {
        volume24h: Math.random() * 1000000,
        holders: Math.floor(Math.random() * 10000),
        liquidityUSD: Math.random() * 100000,
        priceChange24h: (Math.random() - 0.5) * 200,
      };

      // Analyze volume
      if (mockMarketData.volume24h < 1000) {
        riskScore += 20;
        reasons.push('Very low trading volume');
      }

      // Analyze holder count
      if (mockMarketData.holders < 50) {
        riskScore += 25;
        reasons.push('Very few token holders');
      }

      // Analyze liquidity
      if (mockMarketData.liquidityUSD < 10000) {
        riskScore += 30;
        reasons.push('Low liquidity (potential rug pull risk)');
      }

      // Analyze price volatility
      if (Math.abs(mockMarketData.priceChange24h) > 100) {
        riskScore += 20;
        reasons.push('Extreme price volatility');
      }

      return { riskScore, reasons };
    } catch (error) {
      logger.error('Market data analysis failed:', error);
      riskScore += 15;
      reasons.push('Failed to analyze market data');
      return { riskScore, reasons };
    }
  }

  private isValidAddress(address: string): boolean {
    // Basic Aptos address validation
    const aptosAddressRegex = /^0x[a-fA-F0-9]{1,64}$/;
    return aptosAddressRegex.test(address);
  }

  private isNewAddress(address: string): boolean {
    // Simple heuristic: check if address has many trailing zeros (often indicates new/generated address)
    const trailingZeros = address.match(/0+$/);
    return trailingZeros ? trailingZeros[0].length > 8 : false;
  }

  private hasScamAddressPattern(address: string): boolean {
    // Check for common scam patterns
    const lowerAddress = address.toLowerCase();
    
    // Repeating patterns
    if (/(.)\1{6,}/.test(lowerAddress)) {
      return true;
    }

    // Common scam prefixes/suffixes
    const scamPatterns = ['dead', 'beef', 'babe', 'cafe', 'face'];
    return scamPatterns.some(pattern => lowerAddress.includes(pattern));
  }

  private calculateConfidence(reasonCount: number): number {
    // Confidence increases with more analysis points
    const baseConfidence = 60;
    const confidenceBoost = Math.min(40, reasonCount * 8);
    return Math.min(100, baseConfidence + confidenceBoost);
  }

  public async checkTokenSafety(tokenAddress: string): Promise<boolean> {
    try {
      const analysis = await this.analyzeToken(tokenAddress);
      return !analysis.isScam;
    } catch (error) {
      logger.error(`Token safety check failed for ${tokenAddress}:`, error);
      return false; // Assume unsafe if analysis fails
    }
  }

  public async batchAnalyzeTokens(tokenAddresses: string[]): Promise<ScamAnalysisResult[]> {
    const results: ScamAnalysisResult[] = [];
    
    for (const address of tokenAddresses) {
      try {
        const result = await this.analyzeToken(address);
        results.push(result);
      } catch (error) {
        logger.error(`Batch analysis failed for ${address}:`, error);
        results.push({
          tokenAddress: address,
          riskScore: 100,
          confidence: 50,
          reasons: ['Analysis failed'],
          isScam: true,
          checkedAt: new Date(),
        });
      }
    }

    return results;
  }
} 