export default async function handler(req, res) {
    // 1. CORS & Method Protection
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ answer: "Method Not Allowed" });
    }

    // 2. Critical Environment Check
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ 
            answer: "Scribe Error: GEMINI_API_KEY is missing from Vercel Environment Variables." 
        });
    }

    const type = req.query.type || req.body?.type;
    const question = req.body?.question || req.query.question;

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        const isNews = type === 'daily-news';

        const prompt = isNews 
            ? "Generate a JSON response for CLASFON news with keys: verse, charge, storyTitle, storyText, implication, globalNewsTitle, globalNewsSummary."
            : `You are Apostle Moses. Answer: ${question}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7 }
            })
        });

        const data = await response.json();

        // Check if Gemini returned an error
        if (data.error) {
            return res.status(500).json({ answer: `Gemini API Error: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content) {
            const output = data.candidates[0].content.parts[0].text;
            if (isNews) {
                const cleanJson = output.match(/\{[\s\S]*\}/)[0];
                return res.status(200).json(JSON.parse(cleanJson));
            }
            return res.status(200).json({ answer: output });
        }

        return res.status(500).json({ answer: "Scribe is empty-handed." });
    } catch (err) {
        return res.status(500).json({ answer: "Sanctuary Server Crash: " + err.message });
    }
}