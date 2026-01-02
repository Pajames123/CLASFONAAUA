export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const type = req.query.type || req.body?.type;
    const question = req.body?.question || req.query.question;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ answer: "Sanctuary Key Missing." });

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        const isNews = type === 'daily-news';

        const systemInstruction = isNews
            ? `You are the Scribe of CLASFON AAUA. Date: ${new Date().toDateString()}.
               1. SEARCH: Find factual positive global Christian news (last 24h).
               2. WRITE: 150-word Biblical narrative linking scripture to law.
               3. TICKER: Select a verse and a charge.
               OUTPUT JSON ONLY: {"verse":"", "charge":"", "storyTitle":"", "storyText":"", "implication":"", "globalNewsTitle":"", "globalNewsSummary":""}`
            : `You are Apostle Moses, Legal-Spiritual AI. 
               - Address user as 'Future Advocate'.
               - Provide 'Statutory Precedent' (OT) & 'Testamental Application' (NT).
               - Tone: Authority & Grace.`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\nInput: ${question || 'Generate Daily News'}` }] }],
                tools: isNews ? [{ google_search: {} }] : [],
                generationConfig: { temperature: isNews ? 1.0 : 0.7 }
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            let text = data.candidates[0].content.parts[0].text;
            if (isNews) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const newsObject = JSON.parse(jsonMatch[0]);
                        return res.status(200).json(newsObject);
                    } catch (e) { return res.status(500).json({ error: "Scribe Error" }); }
                }
            }
            return res.status(200).json({ answer: text });
        }
        
        return res.status(500).json({ answer: "The Scribe is silent." });

    } catch (error) { return res.status(500).json({ answer: "Connection Error." }); }
}