// Credit System Implementation for MusicGen App
// Handles user credits, payments, and generation limits

class CreditSystem {
    constructor() {
        this.creditPackages = {
            starter: { credits: 100, price: 500, name: "Starter Pack" },
            popular: { credits: 400, price: 1500, name: "Popular Pack" },
            pro: { credits: 1000, price: 3500, name: "Pro Pack" },
            creator: { credits: 2500, price: 7500, name: "Creator Pack" }
        };
        
        this.generationCosts = {
            5: 1,    // 5 seconds = 1 credit
            10: 2,   // 10 seconds = 2 credits
            15: 3,   // 15 seconds = 3 credits
            20: 4,   // 20 seconds = 4 credits
            30: 5    // 30 seconds = 5 credits
        };
    }

    // Calculate credits needed for generation
    calculateCreditsNeeded(duration) {
        return Math.ceil(duration / 5); // 1 credit per 5 seconds
    }

    // Check if user has enough credits
    async checkCredits(userId, duration) {
        const user = await this.getUser(userId);
        const creditsNeeded = this.calculateCreditsNeeded(duration);
        
        return {
            hasEnough: user.credits >= creditsNeeded,
            creditsNeeded: creditsNeeded,
            userCredits: user.credits,
            remaining: user.credits - creditsNeeded
        };
    }

    // Deduct credits from user account
    async deductCredits(userId, amount) {
        const user = await this.getUser(userId);
        
        if (user.credits < amount) {
            throw new Error(`Insufficient credits. Need ${amount}, have ${user.credits}`);
        }
        
        await this.updateUser(userId, {
            credits: user.credits - amount,
            totalSpent: user.totalSpent + amount,
            lastGeneration: new Date()
        });
        
        return {
            success: true,
            newBalance: user.credits - amount,
            deducted: amount
        };
    }

    // Add credits to user account
    async addCredits(userId, amount, source = 'purchase') {
        const user = await this.getUser(userId);
        
        await this.updateUser(userId, {
            credits: user.credits + amount,
            creditHistory: [...(user.creditHistory || []), {
                amount: amount,
                source: source,
                date: new Date()
            }]
        });
        
        return {
            success: true,
            newBalance: user.credits + amount,
            added: amount
        };
    }

    // Generate music with credit check
    async generateMusicWithCredits(userId, audioData, instrument, duration) {
        try {
            const creditCheck = await this.checkCredits(userId, duration);
            
            if (!creditCheck.hasEnough) {
                return {
                    success: false,
                    error: 'Insufficient credits',
                    creditsNeeded: creditCheck.creditsNeeded,
                    userCredits: creditCheck.userCredits,
                    action: 'buy_credits'
                };
            }

            // Call your MusicGen API here
            const result = await this.callMusicGenAPI(audioData, instrument, duration);
            
            if (result.success) {
                // Only deduct credits on successful generation
                await this.deductCredits(userId, creditCheck.creditsNeeded);
                
                return {
                    ...result,
                    creditsUsed: creditCheck.creditsNeeded,
                    remainingCredits: creditCheck.remaining
                };
            }
            
            return result;
            
        } catch (error) {
            console.error('Credit system error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get user's credit status
    async getUserCreditStatus(userId) {
        const user = await this.getUser(userId);
        const freeCreditsToday = await this.getFreeCreditsToday(userId);
        
        return {
            totalCredits: user.credits,
            freeCreditsToday: freeCreditsToday,
            totalSpent: user.credits,
            plan: user.plan || 'free',
            lastGeneration: user.lastGeneration,
            canGenerate: user.credits > 0 || freeCreditsToday > 0
        };
    }

    // Handle daily free credits
    async getFreeCreditsToday(userId) {
        const user = await this.getUser(userId);
        const today = new Date().toDateString();
        
        if (user.plan === 'free' && user.lastFreeCreditDate !== today) {
            // Give 1 free credit per day for free users
            await this.addCredits(userId, 1, 'daily_free');
            await this.updateUser(userId, { lastFreeCreditDate: today });
            return 1;
        }
        
        return 0;
    }

    // Create Stripe checkout session
    async createCheckoutSession(userId, packageId) {
        const pkg = this.creditPackages[packageId];
        if (!pkg) {
            throw new Error('Invalid package');
        }

        // This would integrate with Stripe
        const session = {
            id: `cs_${Date.now()}`,
            url: `https://checkout.stripe.com/pay/${packageId}`,
            package: pkg,
            userId: userId
        };

        return session;
    }

    // Handle successful payment
    async handlePaymentSuccess(sessionId, userId, credits) {
        await this.addCredits(userId, credits, 'purchase');
        
        // Send confirmation email
        await this.sendConfirmationEmail(userId, credits);
        
        return {
            success: true,
            creditsAdded: credits,
            newBalance: await this.getUserCredits(userId)
        };
    }

    // Mock API calls (replace with real implementations)
    async getUser(userId) {
        // Mock user data - replace with real database
        return {
            id: userId,
            credits: 10,
            totalSpent: 0,
            plan: 'free',
            creditHistory: [],
            lastGeneration: null,
            lastFreeCreditDate: null
        };
    }

    async updateUser(userId, updates) {
        // Mock update - replace with real database
        console.log(`Updating user ${userId}:`, updates);
        return true;
    }

    async callMusicGenAPI(audioData, instrument, duration) {
        // Mock MusicGen call - replace with real API
        return {
            success: true,
            audioData: 'mock_audio_data',
            duration: duration,
            instrument: instrument
        };
    }

    async sendConfirmationEmail(userId, credits) {
        // Mock email - replace with real email service
        console.log(`Sending confirmation email to user ${userId} for ${credits} credits`);
        return true;
    }

    async getUserCredits(userId) {
        const user = await this.getUser(userId);
        return user.credits;
    }
}

// Express.js integration
const express = require('express');
const app = express();
const creditSystem = new CreditSystem();

// Generate music endpoint with credits
app.post('/generate-music', async (req, res) => {
    try {
        const { userId, audioData, instrument, duration } = req.body;
        
        const result = await creditSystem.generateMusicWithCredits(
            userId, 
            audioData, 
            instrument, 
            duration
        );
        
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user credit status
app.get('/credits/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const status = await creditSystem.getUserCreditStatus(userId);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buy credits
app.post('/buy-credits', async (req, res) => {
    try {
        const { userId, packageId } = req.body;
        const session = await creditSystem.createCheckoutSession(userId, packageId);
        res.json({ checkoutUrl: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Payment success webhook
app.post('/webhook/payment-success', async (req, res) => {
    try {
        const { sessionId, userId, credits } = req.body;
        const result = await creditSystem.handlePaymentSuccess(sessionId, userId, credits);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = { CreditSystem, creditSystem };

