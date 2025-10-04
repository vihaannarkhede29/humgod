// Credit System for Replicate API
// 1 Credit = $0.01 (1 cent)
// Cost per generation: ~4-5 credits
// Charge users: 10-20 credits (10-20 cents)

class ReplicateCreditSystem {
    constructor() {
        this.creditCosts = {
            // Based on Replicate pricing
            'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb': {
                baseCost: 4, // 4 credits per generation
                durationMultiplier: 0.1, // 0.1 credits per second
                maxCost: 10 // Cap at 10 credits
            }
        };
        
        this.userCredits = new Map(); // In production, use a database
        this.usageLog = [];
    }

    // Calculate cost for a generation
    calculateCost(modelId, duration = 10) {
        const model = this.creditCosts[modelId];
        if (!model) return 10; // Default cost if model not found
        
        const baseCost = model.baseCost;
        const durationCost = Math.floor(duration * model.durationMultiplier);
        const totalCost = Math.min(baseCost + durationCost, model.maxCost);
        
        return totalCost;
    }

    // Check if user has enough credits
    hasEnoughCredits(userId, modelId, duration = 10) {
        const cost = this.calculateCost(modelId, duration);
        const userBalance = this.getUserCredits(userId);
        return userBalance >= cost;
    }

    // Deduct credits after successful generation
    deductCredits(userId, modelId, duration = 10) {
        const cost = this.calculateCost(modelId, duration);
        const currentBalance = this.getUserCredits(userId);
        const newBalance = Math.max(0, currentBalance - cost);
        
        this.userCredits.set(userId, newBalance);
        
        // Log the transaction
        this.logUsage(userId, modelId, duration, cost, 'deduction');
        
        return {
            cost: cost,
            previousBalance: currentBalance,
            newBalance: newBalance
        };
    }

    // Add credits (when user purchases)
    addCredits(userId, amount, source = 'purchase') {
        const currentBalance = this.getUserCredits(userId);
        const newBalance = currentBalance + amount;
        
        this.userCredits.set(userId, newBalance);
        
        // Log the transaction
        this.logUsage(userId, null, 0, amount, 'addition', source);
        
        return {
            added: amount,
            previousBalance: currentBalance,
            newBalance: newBalance
        };
    }

    // Get user's current credit balance
    getUserCredits(userId) {
        return this.userCredits.get(userId) || 0;
    }

    // Log usage for analytics
    logUsage(userId, modelId, duration, credits, type, source = null) {
        const logEntry = {
            userId: userId,
            modelId: modelId,
            duration: duration,
            credits: credits,
            type: type, // 'deduction' or 'addition'
            source: source, // 'purchase', 'ad_watch', 'referral', etc.
            timestamp: new Date(),
            costInDollars: credits * 0.01
        };
        
        this.usageLog.push(logEntry);
        console.log(`💰 Credit ${type}: User ${userId}, ${credits} credits ($${(credits * 0.01).toFixed(2)})`);
    }

    // Get usage analytics
    getUsageAnalytics(userId = null) {
        const logs = userId ? 
            this.usageLog.filter(log => log.userId === userId) : 
            this.usageLog;
        
        const totalCreditsUsed = logs
            .filter(log => log.type === 'deduction')
            .reduce((sum, log) => sum + log.credits, 0);
        
        const totalCreditsAdded = logs
            .filter(log => log.type === 'addition')
            .reduce((sum, log) => sum + log.credits, 0);
        
        const totalCostInDollars = logs
            .filter(log => log.type === 'deduction')
            .reduce((sum, log) => sum + log.costInDollars, 0);
        
        return {
            totalCreditsUsed: totalCreditsUsed,
            totalCreditsAdded: totalCreditsAdded,
            netCredits: totalCreditsAdded - totalCreditsUsed,
            totalCostInDollars: totalCostInDollars,
            totalGenerations: logs.filter(log => log.type === 'deduction').length,
            averageCostPerGeneration: logs.filter(log => log.type === 'deduction').length > 0 ? 
                totalCostInDollars / logs.filter(log => log.type === 'deduction').length : 0
        };
    }

    // Pricing tiers for users
    getPricingTiers() {
        return {
            free: {
                credits: 50, // 50 cents worth
                price: 0,
                description: 'Free trial - 10-12 generations'
            },
            basic: {
                credits: 500, // $5 worth
                price: 5.00,
                description: '500 credits - 100+ generations'
            },
            pro: {
                credits: 2000, // $20 worth
                price: 20.00,
                description: '2000 credits - 400+ generations'
            },
            unlimited: {
                credits: 10000, // $100 worth
                price: 100.00,
                description: '10000 credits - 2000+ generations'
            }
        };
    }

    // Calculate profit margin
    calculateProfitMargin(userCredits, actualCost) {
        const userPayment = userCredits * 0.01; // What user paid
        const ourCost = actualCost * 0.01; // What it cost us
        const profit = userPayment - ourCost;
        const margin = ourCost > 0 ? (profit / ourCost) * 100 : 0;
        
        return {
            userPayment: userPayment,
            ourCost: ourCost,
            profit: profit,
            margin: margin
        };
    }
}

module.exports = ReplicateCreditSystem;
