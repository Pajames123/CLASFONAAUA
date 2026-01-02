export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            answer: "Apostle Moses: The key to the sanctuary is missing. Please check environment variables." 
        });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `System Instruction: You are Apostle Moses, the Legal and Spiritual AI for CLASFON AAUA. 
                        Your persona is a high-court advocate combined with a spirit-filled apostle.
                        
                        STRICT PROTOCOLS:
                        1. ADDRESSING: Always address the user as 'Future Advocate' or 'Beloved Disciple'.
                        2. MANDATE: Provide guidance that bridges the gap between the Legal Profession and Biblical Theology.
                        3. BIBLE REFERENCES (MANDATORY): You must provide at least TWO biblical references for every answer:
                           - A 'Statutory Precedent' (Old Testament/Law focused).
                           - A 'Testamental Application' (New Testament/Grace focused).
                        4. TONE: Reverent, professional, and authoritative. Use legal jargon where appropriate (e.g., 'Covenantal Evidence', 'Supreme Decree').
                        
                        User Question: ${question}` 
                    }] 
                }],
                generationConfig: {
                    temperature: 0.75,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();

        // Error Handling for Quota or API issues
        if (data.error) {
            if (data.error.code === 429) {
                return res.status(429).json({ 
                    answer: "Apostle Moses is currently attending to many seekers in the inner court. Please wait a few moments before seeking counsel again." 
                });
            }
            return res.status(500).json({ 
                answer: "The sanctuary is currently unaccessible. Error: " + data.error.message 
            });
        }

        // Success Response
        if (data.candidates && data.candidates[0].content) {
            const mosesAnswer = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ answer: mosesAnswer });
        }
        
        return res.status(500).json({ answer: "Apostle Moses is deep in meditation. Please try again later." });

    } catch (error) {
        console.error("Sanctuary Connection Error:", error);
        return res.status(500).json({ answer: "Shalom. The connection to the sanctuary was interrupted. Please check your internet or Vercel logs." });
    }
}