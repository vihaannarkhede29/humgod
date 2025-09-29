// Usage tracking API endpoint
// Simple in-memory usage tracking (in production, use a real database)
const usageDB = new Map();

// Get user's current usage
function getUserUsage(userId) {
    const today = new Date().toDateString();
    const key = `${userId}-${today}`;
    return usageDB.get(key) || { generations: 0, totalSeconds: 0, isPremium: false };
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
        const { userId = 'anonymous' } = req.body;
        const usage = getUserUsage(userId);
        
        return res.json({
            success: true,
            usage: usage
        });
        
    } catch (error) {
        console.error('Usage tracking error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};