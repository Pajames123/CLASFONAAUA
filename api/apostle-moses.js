export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ answer: "Apostle Moses: The key to the sanctuary is missing (API Key Not Set)." });
    }

    try {
        // Updated to the most stable 2026 endpoint and model string
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `You are Apostle Moses, a Digital Theological Assistant for CLASFON AAUA. 
                        Give a scriptural and reverent response to this: ${question}` 
                    }] 
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();

        // Check for specific API errors
        if (data.error) {
            console.error("Gemini API Error:", data.error.message);
            return res.status(500).json({ 
                answer: "The sanctuary is undergoing maintenance. (Error: " + data.error.message + ")" 
            });
        }

        if (data.candidates && data.candidates[0].content) {
            const mosesAnswer = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ answer: mosesAnswer });
        } else {
            return res.status(500).json({ answer: "The oracle is currently silent. Please try again." });
        }

    } catch (error) {
        console.error("Server-side Error:", error);
        return res.status(500).json({ answer: "Shalom. The connection to the sanctuary was interrupted." });
    }
}