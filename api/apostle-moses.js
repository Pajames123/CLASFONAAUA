export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ answer: "Apostle Moses: The key to the sanctuary is missing." });
    }

    try {
        // Switching to the Stable v1 API and the 1.5 Flash Model
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: "You are Apostle Moses, a biblical expert for CLASFON AAUA. Answer the following question with scripture and a reverent tone: " + question 
                    }] 
                }]
            })
        });

        const data = await response.json();

        // Error Handling for Google API
        if (data.error) {
            console.error("Gemini Error:", data.error.message);
            return res.status(500).json({ answer: "The sanctuary is under maintenance. Error: " + data.error.message });
        }

        // Response check
        if (data.candidates && data.candidates[0].content) {
            const mosesAnswer = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ answer: mosesAnswer });
        } else {
            return res.status(500).json({ answer: "Apostle Moses is currently in a season of silence. Please try again." });
        }

    } catch (error) {
        return res.status(500).json({ answer: "Shalom. The connection to the sanctuary was interrupted." });
    }
}