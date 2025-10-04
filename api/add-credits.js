// Add credits API endpoint
const ReplicateCreditSystem = require('./credit-system-replicate');

// Initialize credit system
const creditSystem = new ReplicateCreditSystem();

// Security: Admin password protection
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HumGod2024!Secret';

function checkAdminAccess(password) {
    return password === ADMIN_PASSWORD;
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
        const { userId = 'anonymous', amount, source = 'purchase', password } = req.body;
        
        // Security check: Require admin password for adding credits
        if (!checkAdminAccess(password)) {
            return res.status(401).json({ 
                error: 'Unauthorized access. Admin password required.',
                message: 'Only admin can add credits.',
                requiresAdminPassword: true
            });
        }
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid credit amount' });
        }
        
        const result = creditSystem.addCredits(userId, amount, source);
        
        res.json({
            success: true,
            ...result,
            message: `Added ${amount} credits to user ${userId}`
        });
        
    } catch (error) {
        console.error('Error adding credits:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error during credit addition.',
            details: error.message 
        });
    }
};
