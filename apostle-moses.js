export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    
    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // The theological instruction for the AI
    const systemInstruction = "You are Apostle Moses, the Digital Theological Assistant for CLASFON AAUA. Answer reverently with scripture.";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nQuestion: ${question}` }] }]
            })
        });

        const data = await response.json();
        
        // Safety check to ensure Gemini returned a valid candidate
        if (data.candidates && data.candidates[0].content) {
            const answer = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ answer });
        } else {
            throw new Error("Invalid response from Gemini");
        }

    } catch (error) {
        console.error("Apostle Moses Error:", error);
        return res.status(500).json({ answer: "Shalom. I am currently in deep study. Please try your consultation again shortly." });
    }
}