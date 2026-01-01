import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        // ZRANGE fetches the top members from the 'leaderboard' set in descending order
        const topPlayers = await kv.zrange('leaderboard', 0, 9, { 
            rev: true, 
            withScores: true 
        });

        // Format the data into a clean array for the frontend
        const formattedScores = [];
        for (let i = 0; i < topPlayers.length; i += 2) {
            formattedScores.push({
                member: topPlayers[i],
                score: topPlayers[i + 1]
            });
        }

        return res.status(200).json(formattedScores);
    } catch (error) {
        console.error("KV Fetch Error:", error);
        return res.status(500).json({ error: 'Could not read the Scroll of Honor.' });
    }
}