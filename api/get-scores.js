import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Only allow GET requests to retrieve the public scroll
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        /**
         * FETCHING THE TOP 10 WITNESSES
         * We fetch from the 'leaderboard' key in Vercel KV.
         * rev: true ensures the highest XP holders appear first.
         */
        const topPlayers = await kv.zrange('leaderboard', 0, 9, { 
            rev: true, 
            withScores: true 
        });

        // If the scroll is currently empty, return a graceful message
        if (!topPlayers || topPlayers.length === 0) {
            return res.status(200).json([]);
        }

        // Format the Redis response into a clean, developer-friendly JSON array
        const formattedScores = [];
        for (let i = 0; i < topPlayers.length; i += 2) {
            formattedScores.push({
                member: topPlayers[i],
                score: topPlayers[i + 1]
            });
        }

        /**
         * PREMIUM HEADER: Ensuring the browser caches the leaderboard 
         * for 60 seconds to improve speed and reduce database costs.
         */
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        
        return res.status(200).json(formattedScores);

    } catch (error) {
        console.error("The Scribe failed to read the KV Scroll:", error);
        
        // Return a 500 error if the database connection is lost
        return res.status(500).json({ 
            error: 'The Scroll of Honor is temporarily sealed. Please try again soon.' 
        });
    }
}