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
  // Let's remove the hardcoded patterns as the AI service will handle this logic
  // private readonly suspiciousPatterns: string[] = [ ... ];

  private readonly aiServiceUrl: string;

  constructor() {
    // Read the AI service URL from environment variables
    this.aiServiceUrl = process.env.AI_SERVICE_URL || '';
    if (!this.aiServiceUrl) {
      logger.warn('AI_SERVICE_URL is not set. Scam detection will be unavailable.');
    }
  }

  public async analyzeToken(tokenAddress: string, tokenName?: string, tokenSymbol?: string): Promise<ScamAnalysisResult> {
    if (!this.aiServiceUrl) {
      // If the AI service is not configured, return a default "unavailable" response
      logger.error('Scam detection service is unavailable because AI_SERVICE_URL is not configured.');
      throw new Error('Scam detection service is currently unavailable.');
    }

    try {
      // Call the external AI service
      const response = await axios.post(`${this.aiServiceUrl}/predict`, {
        wallet_address: tokenAddress,
      });

      const aiData = response.data;

      // Map the AI service response to our ScamAnalysisResult interface
      const analysisResult: ScamAnalysisResult = {
        tokenAddress: aiData.wallet_address,
        isScam: aiData.prediction === 'Sybil',
        // The AI service provides a confidence score, which we can use.
        // We'll map the sybil_probability to riskScore for consistency.
        riskScore: Math.round(aiData.sybil_probability * 100),
        confidence: Math.round(aiData.confidence * 100),
        reasons: [
          `AI Prediction: ${aiData.prediction}`,
          `Sybil Probability: ${Math.round(aiData.sybil_probability * 100)}%`
        ],
        checkedAt: new Date(),
      };

      logger.info(`AI analysis completed for ${tokenAddress}: Risk Score ${analysisResult.riskScore}`);
      return analysisResult;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Error calling AI service for token ${tokenAddress}: ${error.response?.data?.error || error.message}`);
        throw new Error(`Failed to get analysis from AI service: ${error.response?.data?.error || error.message}`);
      }
      logger.error(`Failed to analyze token ${tokenAddress} with AI service:`, error);
      throw error;
    }
  }

  // The following methods are no longer needed as the AI service handles the logic.
  // We can remove them to clean up the code.
  /*
  private analyzeTokenName(tokenName: string, tokenSymbol: string): { riskScore: number; reasons: string[] } {
    // ... logic removed ...
  }

  private calculateConfidence(reasonCount: number): number {
    // ... logic removed ...
  }

  private async analyzeTokenContract(tokenAddress: string): Promise<{ riskScore: number; reasons: string[] }> {
    // ... logic removed ...
  }

  private async analyzeMarketData(tokenAddress: string): Promise<{ riskScore: number; reasons: string[] }> {
    // ... logic removed ...
  }

  private isValidAddress(address: string): boolean {
    // ... logic removed ...
  }

  private isNewAddress(address: string): boolean {
    // ... logic removed ...
  }

  private hasScamAddressPattern(address: string): boolean {
    // ... logic removed ...
  }
  */

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