export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ answer: "Apostle Moses: The key to the sanctuary is missing." });
    }

    try {
        // Updated model name to 'gemini-pro' for better v1beta compatibility
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "You are Apostle Moses, a biblical expert for CLASFON AAUA. Answer with scripture: " + question }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ answer: "The sanctuary is under maintenance. Error: " + data.error.message });
        }

        // Gemini-pro response structure check
        if (data.candidates && data.candidates[0].content) {
            const mosesAnswer = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ answer: mosesAnswer });
        } else {
            return res.status(500).json({ answer: "Apostle Moses is in deep meditation. Please try again." });
        }

    } catch (error) {
        return res.status(500).json({ answer: "Shalom. The connection failed. Please redeploy the portal." });
    }
}