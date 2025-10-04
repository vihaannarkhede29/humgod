// Get credits API endpoint
const ReplicateCreditSystem = require('./credit-system-replicate');

// Initialize credit system
const creditSystem = new ReplicateCreditSystem();

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { userId = 'anonymous' } = req.query;
        const credits = creditSystem.getUserCredits(userId);
        const analytics = creditSystem.getUsageAnalytics(userId);
        
        res.json({
            userId: userId,
            credits: credits,
            analytics: analytics,
            pricing: creditSystem.getPricingTiers()
        });
        
    } catch (error) {
        console.error('Error getting credits:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error during credit retrieval.',
            details: error.message 
        });
    }
};
