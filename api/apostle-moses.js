export default async function handler(req, res) {
    // 1. Support both POST (Frontend Chat) and GET (Vercel Cron / Daily News)
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Extract Parameters from Query (Cron) or Body (Chat)
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

        // 3. Define Logic based on request type
        const isNewsRequest = type === 'daily-news';
        
        const systemInstruction = isNewsRequest
            ? `You are the Scribe of CLASFON AAUA. Today is ${new Date().toDateString()}.
               TASK: Generate the Daily Revelation Publication.
               1. SEARCH: Find factual positive global Christian news from the last 24 hours.
               2. NARRATIVE: Write a 150-word Biblical story linking scripture to legal integrity.
               3. TICKER: Select a Bible Verse and a short charge.

               STRICT JSON OUTPUT FORMAT:
               {
                 "verse": "The Bible Verse for the ticker",
                 "charge": "A short legal-spiritual command",
                 "storyTitle": "Headline for the Biblical Narrative",
                 "storyText": "The 3-paragraph Biblical story analysis",
                 "implication": "The legal takeaway for students",
                 "globalNewsTitle": "Current 2026 Christian News Headline",
                 "globalNewsSummary": "2-sentence summary of that news"
               }`
            : `You are Apostle Moses, the Legal and Spiritual AI for CLASFON AAUA. 
               Persona: High-court advocate + spirit-filled apostle.
               - Address user as 'Future Advocate'.
               - Provide a 'Statutory Precedent' (Old Testament) and 'Testamental Application' (New Testament) for every answer.
               - Tone: Authority, Grace, and Professionalism.`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `${systemInstruction}\n\nUser Input: ${question || 'Generate Daily Revelation'}` 
                    }] 
                }],
                // Enable Search Tools for the Daily News feature
                tools: isNewsRequest ? [{ google_search: {} }] : [],
                generationConfig: {
                    temperature: isNewsRequest ? 1.0 : 0.7,
                    maxOutputTokens: 1500,
                }
            })
        });

        const data = await response.json();

        // 4. Error Handling
        if (data.error) {
            if (data.error.code === 429) {
                return res.status(429).json({ answer: "The inner court is full. Please wait a moment." });
            }
            throw new Error(data.error.message);
        }

        // 5. Success Response Handling
        if (data.candidates && data.candidates[0].content) {
            let mosesAnswer = data.candidates[0].content.parts[0].text;
            
            if (isNewsRequest) {
                // Securely extract JSON from the AI's response string
                const jsonMatch = mosesAnswer.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const newsObject = JSON.parse(jsonMatch[0]);
                        // Returning the exact structure required by your frontend fetchDailyRevelation()
                        return res.status(200).json({
                            "verse": newsObject.verse,
                            "charge": newsObject.charge,
                            "storyTitle": newsObject.storyTitle,
                            "storyText": newsObject.storyText,
                            "implication": newsObject.implication,
                            "globalNewsTitle": newsObject.globalNewsTitle,
                            "globalNewsSummary": newsObject.globalNewsSummary
                        });
                    } catch (e) {
                        return res.status(500).json({ error: "Scribe's handwriting was corrupted." });
                    }
                }
            }

            // Standard Chat Response
            return res.status(200).json({ answer: mosesAnswer });
        }
        
        return res.status(500).json({ answer: "Apostle Moses is deep in meditation." });

    } catch (error) {
        console.error("Sanctuary Error:", error);
        return res.status(500).json({ answer: "Shalom. The sanctuary connection was interrupted." });
    }
}