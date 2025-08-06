const User = require('../models/User');
const logger = require('../utils/logger');

class UserDataService {
    // User Preferences Management
    async updateUserPreferences(userId, preferences) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            user.preferences = {
                ...user.preferences,
                ...preferences
            };

            await user.save();
            logger.info(`Updated preferences for user ${userId}`);
            
            return user.preferences;
        } catch (error) {
            logger.error('Error updating user preferences:', error);
            throw error;
        }
    }

    async getUserPreferences(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            return user.preferences || {};
        } catch (error) {
            logger.error('Error getting user preferences:', error);
            throw error;
        }
    }

    // Favorite Tokens Management
    async addFavoriteToken(userId, tokenData) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Check if token already exists in favorites
            const existingToken = user.favoriteTokens?.find(
                token => token.address === tokenData.address
            );

            if (existingToken) {
                throw new Error('Token already in favorites');
            }

            if (!user.favoriteTokens) {
                user.favoriteTokens = [];
            }

            user.favoriteTokens.push({
                address: tokenData.address,
                symbol: tokenData.symbol,
                name: tokenData.name,
                addedAt: new Date(),
                notes: tokenData.notes || '',
                alertPrice: tokenData.alertPrice || null,
                isActive: true
            });

            await user.save();
            logger.info(`Added favorite token for user ${userId}: ${tokenData.symbol}`);
            
            return user.favoriteTokens;
        } catch (error) {
            logger.error('Error adding favorite token:', error);
            throw error;
        }
    }

    async removeFavoriteToken(userId, tokenAddress) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            user.favoriteTokens = user.favoriteTokens?.filter(
                token => token.address !== tokenAddress
            ) || [];

            await user.save();
            logger.info(`Removed favorite token for user ${userId}: ${tokenAddress}`);
            
            return user.favoriteTokens;
        } catch (error) {
            logger.error('Error removing favorite token:', error);
            throw error;
        }
    }

    async getFavoriteTokens(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            return user.favoriteTokens || [];
        } catch (error) {
            logger.error('Error getting favorite tokens:', error);
            throw error;
        }
    }

    // User Activity Tracking
    async logUserActivity(userId, activity) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (!user.activityLog) {
                user.activityLog = [];
            }

            user.activityLog.push({
                action: activity.action,
                metadata: activity.metadata || {},
                timestamp: new Date(),
                ipAddress: activity.ipAddress,
                userAgent: activity.userAgent
            });

            // Keep only last 100 activities
            if (user.activityLog.length > 100) {
                user.activityLog = user.activityLog.slice(-100);
            }

            await user.save();
            logger.info(`Logged activity for user ${userId}: ${activity.action}`);
        } catch (error) {
            logger.error('Error logging user activity:', error);
            // Don't throw error for activity logging
        }
    }

    async getUserActivity(userId, limit = 50) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            return (user.activityLog || []).slice(-limit);
        } catch (error) {
            logger.error('Error getting user activity:', error);
            throw error;
        }
    }

    // Swap History Management
    async saveSwapHistory(userId, swapData) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (!user.swapHistory) {
                user.swapHistory = [];
            }

            user.swapHistory.push({
                transactionHash: swapData.transactionHash,
                walletAddress: swapData.walletAddress,
                fromToken: {
                    address: swapData.fromToken.address,
                    symbol: swapData.fromToken.symbol,
                    amount: swapData.fromToken.amount,
                    price: swapData.fromToken.price
                },
                toToken: {
                    address: swapData.toToken.address,
                    symbol: swapData.toToken.symbol,
                    amount: swapData.toToken.amount,
                    price: swapData.toToken.price
                },
                swapProvider: swapData.swapProvider,
                gasUsed: swapData.gasUsed,
                gasPrice: swapData.gasPrice,
                totalCost: swapData.totalCost,
                timestamp: new Date(),
                status: swapData.status
            });

            // Keep only last 50 swaps
            if (user.swapHistory.length > 50) {
                user.swapHistory = user.swapHistory.slice(-50);
            }

            await user.save();
            logger.info(`Saved swap history for user ${userId}: ${swapData.transactionHash}`);
            
            return user.swapHistory;
        } catch (error) {
            logger.error('Error saving swap history:', error);
            throw error;
        }
    }

    async getSwapHistory(userId, limit = 20) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            return (user.swapHistory || []).slice(-limit);
        } catch (error) {
            logger.error('Error getting swap history:', error);
            throw error;
        }
    }

    // Analytics and Statistics
    async getUserStats(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const swapHistory = user.swapHistory || [];
            const activityLog = user.activityLog || [];

            // Calculate statistics
            const totalSwaps = swapHistory.length;
            const totalVolume = swapHistory.reduce((sum, swap) => {
                return sum + (swap.fromToken.amount * swap.fromToken.price);
            }, 0);

            const totalGasUsed = swapHistory.reduce((sum, swap) => {
                return sum + (swap.gasUsed * swap.gasPrice);
            }, 0);

            const favoriteTokens = user.favoriteTokens || [];
            const totalActivities = activityLog.length;

            return {
                totalSwaps,
                totalVolume,
                totalGasUsed,
                favoriteTokensCount: favoriteTokens.length,
                totalActivities,
                lastActivity: activityLog[activityLog.length - 1]?.timestamp,
                lastSwap: swapHistory[swapHistory.length - 1]?.timestamp
            };
        } catch (error) {
            logger.error('Error getting user stats:', error);
            throw error;
        }
    }

    // Price Alerts Management
    async setPriceAlert(userId, tokenAddress, alertPrice) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const favoriteToken = user.favoriteTokens?.find(
                token => token.address === tokenAddress
            );

            if (!favoriteToken) {
                throw new Error('Token not in favorites');
            }

            favoriteToken.alertPrice = alertPrice;
            await user.save();
            
            logger.info(`Set price alert for user ${userId}: ${tokenAddress} at $${alertPrice}`);
            return favoriteToken;
        } catch (error) {
            logger.error('Error setting price alert:', error);
            throw error;
        }
    }

    async removePriceAlert(userId, tokenAddress) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const favoriteToken = user.favoriteTokens?.find(
                token => token.address === tokenAddress
            );

            if (!favoriteToken) {
                throw new Error('Token not in favorites');
            }

            favoriteToken.alertPrice = null;
            await user.save();
            
            logger.info(`Removed price alert for user ${userId}: ${tokenAddress}`);
            return favoriteToken;
        } catch (error) {
            logger.error('Error removing price alert:', error);
            throw error;
        }
    }
}

module.exports = new UserDataService(); 