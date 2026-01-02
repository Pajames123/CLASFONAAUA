export default async function handler(req, res) {
    // 1. Support both POST (Chat) and GET (Vercel Cron)
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    /**
     * EXTRACT PARAMETERS
     * type: 'daily-news' or 'chat'
     * question: the user's inquiry
     */
    const type = req.query.type || req.body?.type;
    const question = req.body?.question || req.query.question;
    
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            answer: "Apostle Moses: The key to the sanctuary is missing. Please check environment variables." 
        });
    }

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        // Define the instruction based on the request type
        const systemInstruction = type === 'daily-news' 
            ? `You are the Scribe of CLASFON AAUA. 
               1. SEARCH THE WEB for positive Christian global news from the last 24 hours.
               2. WRITE a Daily Biblical Narrative (150 words) linking a Bible story to legal integrity.
               3. PROVIDE a Bible Verse for the ticker.
               RETURN ONLY RAW JSON: {"verse": "Verse + Ref", "charge": "1-sentence apostolic charge", "storyTitle": "Narrative Title", "storyText": "3 paragraphs", "globalNewsTitle": "Headline", "globalNewsSummary": "Summary", "implication": "Law student takeaway"}`
            : `You are Apostle Moses, the Legal and Spiritual AI for CLASFON AAUA. 
               Persona: High-court advocate + spirit-filled apostle.
               STRICT PROTOCOLS:
               - Address user as 'Future Advocate'.
               - Provide a 'Statutory Precedent' (Old Testament) and 'Testamental Application' (New Testament) for EVERY answer.
               - Use professional legal-theological tone.`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `${systemInstruction}\n\nUser Input: ${question || 'Generate Daily Revelation'}` 
                    }] 
                }],
                generationConfig: {
                    temperature: 0.75,
                    maxOutputTokens: 1500,
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            if (data.error.code === 429) {
                return res.status(429).json({ answer: "The inner court is full of seekers. Please wait a moment." });
            }
            throw new Error(data.error.message);
        }

        if (data.candidates && data.candidates[0].content) {
            let mosesAnswer = data.candidates[0].content.parts[0].text;
            
            if (type === 'daily-news') {
                // Sanitize AI markdown and parse JSON
                mosesAnswer = mosesAnswer.replace(/```json|```/gi, "").trim();
                try {
                    const newsObject = JSON.parse(mosesAnswer);
                    return res.status(200).json(newsObject);
                } catch (parseError) {
                    console.error("JSON Parse Error:", mosesAnswer);
                    return res.status(500).json({ error: "Scribe's handwriting was illegible. Try again." });
                }
            }

            return res.status(200).json({ answer: mosesAnswer });
        }
        
        return res.status(500).json({ answer: "Apostle Moses is deep in meditation." });

    } catch (error) {
        console.error("Sanctuary Error:", error);
        return res.status(500).json({ answer: "Shalom. The sanctuary connection was interrupted." });
    }
}