export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ answer: "Apostle Moses: The key to the sanctuary is missing." });
    }

    try {
        // FIX: Using gemini-1.5-flash-latest and v1beta endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `System Instruction: You are Apostle Moses, the Digital Theological Assistant for CLASFON AAUA. 
                        Respond as a biblical and legal scholar with a reverent tone. 
                        Always include relevant scripture.
                        
                        User Question: ${question}` 
                    }] 
                }]
            })
        });

        const data = await response.json();

        // Handle specific API errors
        if (data.error) {
            console.error("Gemini API Error Detail:", data.error);
            return res.status(500).json({ 
                answer: "The sanctuary gates are heavy. (Error: " + data.error.message + ")" 
            });
        }

        if (data.candidates && data.candidates[0].content) {
            const mosesAnswer = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ answer: mosesAnswer });
        } else {
            return res.status(500).json({ answer: "Apostle Moses is deep in meditation. Please seek counsel again in a moment." });
        }

    } catch (error) {
        console.error("Server-side Fetch Error:", error);
        return res.status(500).json({ answer: "Shalom. The connection to the sanctuary was interrupted." });
    }
}