export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        // BUG FIX: Updated to gemini-2.0-flash (stable) for 2026 support
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `System Instruction: You are Apostle Moses, the Digital Theological Assistant for CLASFON AAUA. Respond with scripture and a reverent tone. 
                        
                        User Question: ${question}` 
                    }] 
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ answer: "Sanctuary Error: " + data.error.message });
        }

        if (data.candidates && data.candidates[0].content) {
            return res.status(200).json({ answer: data.candidates[0].content.parts[0].text });
        }
        
        return res.status(500).json({ answer: "The oracle is silent. Please try again." });

    } catch (error) {
        return res.status(500).json({ answer: "Shalom. The connection was interrupted." });
    }
}