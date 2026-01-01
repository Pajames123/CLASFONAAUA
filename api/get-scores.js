import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        /**
         * FETCHING THE SCROLL:
         * Fetches top 10 scores from the 'clasfon_scores' sorted set.
         * { rev: true } ensures the highest XP appears at the top.
         */
        const topScores = await kv.zrange('clasfon_scores', 0, 9, { 
            rev: true, 
            withScores: true 
        });

        /**
         * DATA FORMATTING:
         * Standardizes the Redis output into a clean array of objects
         * for the Scripture Arena's VR leaderboard.
         */
        const formattedScores = [];
        for (let i = 0; i < topScores.length; i += 2) {
            formattedScores.push({
                member: topScores[i],
                score: topScores[i + 1]
            });
        }

        /**
         * CACHE OPTIMIZATION:
         * Prevents browsers from showing stale leaderboard data.
         * 's-maxage=1' tells Vercel to revalidate the data every second.
         */
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        
        return res.status(200).json(formattedScores);

    } catch (error) {
        // Log the error for sanctuary maintenance
        console.error("Leaderboard Fetch Error:", error);
        
        return res.status(500).json({ 
            error: "The Scroll is currently being sealed. Please try again later." 
        });
    }
}