export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ answer: "Apostle Moses: The key to the sanctuary is missing." });
    }

    try {
        // BUG FIX: Changed endpoint to v1beta and ensured model string is correct
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `System Instruction: You are Apostle Moses, the Digital Theological Assistant for CLASFON AAUA. 
                        Answer with scripture and a reverent tone. 
                        User Question: ${question}` 
                    }] 
                }]
            })
        });

        const data = await response.json();

        // Error Handling for Model Not Found
        if (data.error) {
            console.error("Gemini API Error:", data.error.message);
            return res.status(500).json({ 
                answer: "Apostle Moses is currently in a season of silence (API Error: " + data.error.message + ")" 
            });
        }

        if (data.candidates && data.candidates[0].content) {
            const mosesAnswer = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ answer: mosesAnswer });
        } else {
            return res.status(500).json({ answer: "The oracle is silent. Please try again later." });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ answer: "Shalom. The connection to the sanctuary was interrupted." });
    }
}