export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const { stallTitle, difficulty } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    const prompt = `You are a Biblical Scribe in a village marketplace. 
    Generate 5 unique challenges for the category: "${stallTitle}" at "${difficulty}" difficulty.
    Taken from the whole Bible. 
    
    Difficulty Guidelines:
    - NOVICE: Famous people/places (e.g., MOSES), simple hints.
    - DISCIPLE: Concepts and events (e.g., PENTECOST), scholarly hints.
    - APOSTLE: Rare names, theological Greek/Hebrew terms (e.g., EXEGESIS, EBENEZER), cryptic/deep hints.

    Return ONLY a JSON array: [{"w": "WORD", "h": "Theological Hint"}]. No markdown or extra text.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const textResponse = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
        res.status(200).json(JSON.parse(textResponse));
    } catch (error) {
        res.status(500).json({ error: "The Scribe is temporarily out of ink." });
    }
}