// Cost estimation API endpoint
const ReplicateCreditSystem = require('./credit-system-replicate');

// Initialize credit system
const creditSystem = new ReplicateCreditSystem();

// Security: Password protection
const REQUIRED_PASSWORD = process.env.REQUIRED_PASSWORD || 'HumGod2024!Secret';

function checkRequiredPassword(password) {
    return password === REQUIRED_PASSWORD;
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { duration = 10, instrument = 'piano', userId = 'anonymous', password } = req.body;
        
        // Security check: Require password for cost estimation
        if (!checkRequiredPassword(password)) {
            return res.status(401).json({ 
                error: 'Unauthorized access. Password required.',
                message: 'This service is currently in private beta. Contact admin for access.',
                requiresPassword: true
            });
        }
        
        const modelId = "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb";
        const generationDuration = parseInt(duration) || 10;
        
        const cost = creditSystem.calculateCost(modelId, generationDuration);
        const userCredits = creditSystem.getUserCredits(userId);
        const hasEnoughCredits = creditSystem.hasEnoughCredits(userId, modelId, generationDuration);
        const userCharge = Math.max(cost + 5, Math.ceil(cost * 1.5));
        
        res.json({
            success: true,
            estimation: {
                duration: generationDuration,
                instrument: instrument,
                costToUs: cost,
                costToUsDollars: (cost * 0.01).toFixed(2),
                chargeToUser: userCharge,
                chargeToUserDollars: (userCharge * 0.01).toFixed(2),
                profit: userCharge - cost,
                profitDollars: ((userCharge - cost) * 0.01).toFixed(2),
                profitMargin: cost > 0 ? (((userCharge - cost) / cost) * 100).toFixed(1) : 0
            },
            user: {
                credits: userCredits,
                hasEnoughCredits: hasEnoughCredits,
                canGenerate: hasEnoughCredits
            },
            message: hasEnoughCredits ? 
                `Ready to generate! Will cost ${userCharge} credits ($${(userCharge * 0.01).toFixed(2)})` :
                `Insufficient credits. Need ${userCharge} credits, have ${userCredits}. Purchase more credits.`
        });
        
    } catch (error) {
        console.error('Error estimating cost:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error during cost estimation.',
            details: error.message 
        });
    }
};
