import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { name, score } = req.body;
    const GMAIL_RECIPIENT = "your-fellowship-email@gmail.com"; // Replace with your actual Gmail

    if (!name || score === undefined) {
        return res.status(400).json({ error: 'Missing Name or Score' });
    }

    try {
        // 1. UPDATE THE DIGITAL SCROLL (Leaderboard)
        // Keeps the website leaderboard working in real-time
        await kv.zadd('leaderboard', { score: parseInt(score), member: name });

        // 2. SEND ATTESTATION TO GMAIL (via Resend API)
        // We use Resend because it's the standard for Vercel/Next.js
        const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'CLASFON Arena <onboarding@resend.dev>',
                to: GMAIL_RECIPIENT,
                subject: `📜 New Achievement: ${name} earned ${score} XP`,
                html: `
                    <div style="font-family: 'Cinzel', serif; background: #0a0a0b; color: #ffffff; padding: 30px; border: 2px solid #c5a059;">
                        <h2 style="color: #c5a059; text-align: center;">Scripture Arena Attestation</h2>
                        <hr style="border: 0.5px solid #3d2b1f;">
                        <p style="font-size: 1.1rem;">Shalom Executives,</p>
                        <p>A new witness has ascended the ranks of the Scripture Arena.</p>
                        <div style="background: rgba(197, 160, 89, 0.1); padding: 20px; border-radius: 8px;">
                            <p><strong>Witness:</strong> ${name}</p>
                            <p><strong>Spiritual XP:</strong> ${score}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p style="margin-top: 30px; font-style: italic; color: #888;">"Study to shew thyself approved unto God..."</p>
                    </div>
                `
            }),
        });

        return res.status(200).json({ success: true, emailed: emailRes.ok });
    } catch (error) {
        console.error("Scoring/Email Error:", error);
        return res.status(500).json({ error: 'The Scribe failed to record the score.' });
    }
}