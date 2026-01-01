import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const { name, score } = req.body;
    
    try {
        // Automatically updates the score if the member already exists
        await kv.zadd('clasfon_scores', { score: parseInt(score), member: name });
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: "Heavenly records are temporarily unreachable." });
    }
}