import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        // Fetches top scores in reverse order (highest first)
        const topScores = await kv.zrange('clasfon_scores', 0, 9, { rev: true, withScores: true });
        return res.status(200).json(topScores);
    } catch (error) {
        return res.status(500).json({ error: "Could not retrieve the Scroll." });
    }
}