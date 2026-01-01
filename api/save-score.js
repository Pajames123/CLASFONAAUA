import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { name, score } = req.body;

    if (!name || score === undefined) {
        return res.status(400).json({ error: 'Missing Name or Score' });
    }

    try {
        // ZADD adds the player to the 'leaderboard' set. 
        // If the player already exists, it updates their score only if it's higher.
        await kv.zadd('leaderboard', { score: parseInt(score), member: name });
        
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("KV Store Error:", error);
        return res.status(500).json({ error: 'The Scribe failed to record the score.' });
    }
}