export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const type = req.query.type || req.body?.type;
    const question = req.body?.question || req.query.question;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ answer: "Sanctuary Key Missing." });

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        const isNews = type === 'daily-news';
        const sysMsg = isNews 
            ? `Role: CLASFON Scribe. Date: ${new Date().toDateString()}.
               1. SEARCH: Factual global Christian news (last 24h).
               2. WRITE: 150-word Biblical narrative linking scripture to law.
               3. TICKER: Verse & Charge.
               OUTPUT JSON: {"verse":"", "charge":"", "storyTitle":"", "storyText":"", "implication":"", "globalNewsTitle":"", "globalNewsSummary":""}`
            : `Role: Apostle Moses, Legal-Spiritual AI. 
               - Address user: 'Future Advocate'.
               - Provide: 'Statutory Precedent' (OT) & 'Testamental Application' (NT).`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${sysMsg}\nInput: ${question || 'Generate Daily News'}` }] }],
                tools: isNews ? [{ google_search: {} }] : [],
                generationConfig: { temperature: isNews ? 1.0 : 0.7 }
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            let text = data.candidates[0].content.parts[0].text;
            if (isNews) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) return res.status(200).json(JSON.parse(jsonMatch[0]));
            }
            return res.status(200).json({ answer: text });
        }
        return res.status(500).json({ answer: "Scribe Silent." });
    } catch (e) { return res.status(500).json({ answer: "Connection Error." }); }
}