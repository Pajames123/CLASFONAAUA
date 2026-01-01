export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ answer: "Apostle Moses: The key to the sanctuary is missing." });
    }

    try {
        // Updated to v1beta with the standard gemini-1.5-flash model ID
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `You are Apostle Moses, the Digital Theological Assistant for CLASFON AAUA. Answer with scripture and a reverent tone. 

                        User Question: ${question}` 
                    }] 
                }]
            })
        });

        const data = await response.json();

        // Check for specific API errors
        if (data.error) {
            console.error("Gemini Error:", data.error.message);
            // This will help us see the exact error if it fails again
            return res.status(500).json({ answer: "Sanctuary Error: " + data.error.message });
        }

        // Validate content
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const mosesAnswer = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ answer: mosesAnswer });
        } else {
            return res.status(500).json({ answer: "Apostle Moses is currently in silent prayer. Please try again." });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ answer: "Shalom. The connection to the sanctuary was interrupted." });
    }
}