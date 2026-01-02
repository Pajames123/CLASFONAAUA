export default async function handler(req, res) {
    // Support POST (Frontend Chat) and GET (Vercel Cron / Daily News)
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Extract Parameters from Query (Cron) or Body (Chat)
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

        // Define specific instructions based on request type
        const isNewsRequest = type === 'daily-news';
        
        const systemInstruction = isNewsRequest
            ? `You are the Scribe of CLASFON AAUA. Today is ${new Date().toDateString()}.
               1. Use your search capability to find positive global Christian news from the last 24 hours.
               2. Write a 150-word Biblical Narrative linking a scripture story to legal integrity.
               3. Select a Bible Verse for the ticker and an apostolic charge.
               OUTPUT MUST BE ONLY RAW JSON: 
               {"verse": "Verse + Ref", "charge": "1-sentence command", "storyTitle": "Title", "storyText": "Narrative", "globalNewsTitle": "Headline", "globalNewsSummary": "Summary", "implication": "Takeaway"}`
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
                // Enable tools for the news request to allow web searching
                tools: isNewsRequest ? [{ google_search: {} }] : [],
                generationConfig: {
                    temperature: isNewsRequest ? 1.0 : 0.7, // Higher creativity for stories
                    maxOutputTokens: 1500,
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            if (data.error.code === 429) {
                return res.status(429).json({ answer: "The inner court is full. Please wait a moment." });
            }
            throw new Error(data.error.message);
        }

        if (data.candidates && data.candidates[0].content) {
            let mosesAnswer = data.candidates[0].content.parts[0].text;
            
            if (isNewsRequest) {
                // Regex to pull JSON out even if Gemini adds prose around it
                const jsonMatch = mosesAnswer.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const newsObject = JSON.parse(jsonMatch[0]);
                        return res.status(200).json(newsObject);
                    } catch (e) {
                        return res.status(500).json({ error: "Scribe's scroll was corrupted." });
                    }
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