export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { question, type } = req.body; // Added 'type' to distinguish between chat and daily news
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            answer: "Apostle Moses: The key to the sanctuary is missing. Please check environment variables." 
        });
    }

    try {
        // Use Gemini 2.0 Flash for Search capabilities and Speed
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        // Dynamic System Prompt based on request type
        const systemInstruction = type === 'daily-news' 
            ? `You are the Scribe of CLASFON AAUA. 
               1. SEARCH THE WEB for positive Christian global news from the last 24 hours.
               2. WRITE a Daily Biblical Narrative (150 words) linking a Bible story to legal integrity.
               3. PROVIDE a Bible Verse for the ticker.
               RETURN ONLY JSON: {"verse": "", "charge": "", "storyTitle": "", "storyText": "", "globalNewsTitle": "", "globalNewsSummary": "", "implication": ""}`
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

        // Premium Error Handling
        if (data.error) {
            if (data.error.code === 429) {
                return res.status(429).json({ answer: "The inner court is full of seekers. Please wait a moment." });
            }
            throw new Error(data.error.message);
        }

        if (data.candidates && data.candidates[0].content) {
            let mosesAnswer = data.candidates[0].content.parts[0].text;
            
            // If it's a news generation request, we ensure it's clean JSON
            if (type === 'daily-news') {
                mosesAnswer = mosesAnswer.replace(/```json|```/gi, "").trim();
                return res.status(200).json(JSON.parse(mosesAnswer));
            }

            return res.status(200).json({ answer: mosesAnswer });
        }
        
        return res.status(500).json({ answer: "Apostle Moses is deep in meditation. Try again." });

    } catch (error) {
        console.error("Sanctuary Error:", error);
        return res.status(500).json({ answer: "Shalom. The sanctuary connection was interrupted." });
    }
}