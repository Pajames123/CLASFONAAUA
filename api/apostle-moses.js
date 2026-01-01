export default async function handler(req, res) {
    // Basic Security
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // 1. Check if Key exists in Vercel
    if (!API_KEY) {
        return res.status(500).json({ answer: "Apostle Moses says: The key to the sanctuary is missing (GEMINI_API_KEY not found)." });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "You are Apostle Moses, a biblical expert for CLASFON AAUA. Answer with scripture: " + question }] }]
            })
        });

        const data = await response.json();

        // 2. Check for Google-side errors
        if (data.error) {
            return res.status(500).json({ answer: "The sanctuary is currently under maintenance. Error: " + data.error.message });
        }

        const mosesAnswer = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ answer: mosesAnswer });

    } catch (error) {
        return res.status(500).json({ answer: "Shalom. Connection to the sanctuary failed. Please check your internet or redeploy." });
    }
}