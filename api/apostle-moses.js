export default async function handler(req, res) {
    // 1. Support both POST and GET
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ answer: "Method Not Allowed" });
    }

    // 2. Verify Key
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ answer: "System Error: API Key missing." });
    }

    // 3. Extract Params
    const type = req.query.type || req.body?.type;
    const question = req.body?.question || req.query.question;

    try {
        // --- THE FIX: Using 'gemini-pro' (Universal Support) ---
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
        
        const isNews = type === 'daily-news';

        // 4. Construct Prompt
        const systemInstruction = isNews
            ? `You are the Scribe of CLASFON AAUA. Date: ${new Date().toDateString()}.
               TASK: Generate Daily Revelation.
               1. NEWS: Summarize one positive Christian global event.
               2. NARRATIVE: Write a 150-word Biblical story linking scripture to legal integrity.
               3. TICKER: Select a Bible Verse and a short charge.
               
               IMPORTANT: Return ONLY valid JSON with these keys: 
               {"verse":"", "charge":"", "storyTitle":"", "storyText":"", "implication":"", "globalNewsTitle":"", "globalNewsSummary":""}`
            : `You are Apostle Moses, Legal-Spiritual AI. 
               - Address user as 'Future Advocate'.
               - Provide a 'Statutory Precedent' (Old Testament) and 'Testamental Application' (New Testament).
               - Keep it brief and professional.`;

        // 5. Fetch from Google
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Input: ${question || 'Generate Content'}` }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ],
                generationConfig: { 
                    temperature: 0.7 
                }
            })
        });

        const data = await response.json();

        // 6. Handle Errors from Google Side
        if (data.error) {
            console.error("Gemini Error:", data.error);
            // Return the specific error message to the frontend so you can see it
            return res.status(500).json({ answer: `Model Error: ${data.error.message}` });
        }

        // 7. Success! Send data back
        if (data.candidates && data.candidates[0].content) {
            let text = data.candidates[0].content.parts[0].text;

            if (isNews) {
                // Try to clean JSON markdown if present
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        return res.status(200).json(JSON.parse(jsonMatch[0]));
                    } catch (e) {
                        return res.status(500).json({ error: "Scribe Handwriting Unclear" });
                    }
                }
            }
            return res.status(200).json({ answer: text });
        }

        return res.status(500).json({ answer: "The Scribe is silent." });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ answer: "Connection Error to Sanctuary." });
    }
}