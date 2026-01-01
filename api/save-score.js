import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Only allow POST requests for security
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const { name, score } = req.body;

    // VALIDATION: Ensure the name and score are present and valid
    if (!name || name.trim() === "" || score === undefined) {
        return res.status(400).json({ error: "Identification and score are required to update the Scroll." });
    }

    const parsedScore = parseInt(score);

    // ANTI-CHEAT: Prevent negative scores or non-numeric values
    if (isNaN(parsedScore) || parsedScore < 0) {
        return res.status(400).json({ error: "Invalid score detected. Only positive growth is recorded." });
    }
    
    try {
        /**
         * UPDATING THE SCROLL:
         * Uses Redis 'ZADD' to either add a new disciple or update an existing one's XP.
         * The 'clasfon_scores' key manages the global leaderboard.
         */
        await kv.zadd('clasfon_scores', { 
            score: parsedScore, 
            member: name.trim() 
        });

        // Set cache control to ensure the leaderboard refreshes across the network
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        
        return res.status(200).json({ 
            success: true, 
            message: `Glory to God! ${name}'s progress has been etched into the Scroll.` 
        });

    } catch (error) {
        // Detailed server logging for troubleshooting
        console.error("Database Error:", error);
        
        return res.status(500).json({ 
            error: "The sanctuary records are temporarily unreachable. Your progress is known to Heaven, but cannot be displayed yet." 
        });
    }
}