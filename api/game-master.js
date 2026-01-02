export default async function handler(req, res) {
    // Security: Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { stallTitle, difficulty } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "The Scribe's key is missing." });
    }

    const prompts = {
        "Torah": "the first five books of the Bible (Genesis to Deuteronomy)",
        "Gospels": "the life and teachings of Jesus (Matthew, Mark, Luke, John)",
        "Prophets": "the Major and Minor prophets of the Old Testament",
        "Acts": "the early church, the Apostles, and the Holy Spirit's work",
        "Wisdom": "Psalms, Proverbs, Ecclesiastes, and Job",
        "Epistles": "the letters written by Paul, Peter, John, and others",
        "Heroes": "great men and women of faith across the whole Bible",
        "Miracles": "supernatural signs and wonders in both Testaments",
        "Parables": "the allegories and stories told by Jesus",
        "Revelation": "the visions of John and the end times"
    };

    const focus = prompts[stallTitle] || "the whole Bible";

    /**
     * PREMIUM APOSTOLIC PROMPT
     * Forces the AI to generate legally-flavored spiritual hints.
     */
    const prompt = `You are Apostle Moses, Scribe of the CLASFON Arena. 
    Generate 5 unique word scrambles for the category: "${stallTitle}" (Focus: ${focus}).
    Difficulty: ${difficulty}.
    
    STRICT DATA FORMAT: Return ONLY a raw JSON array. No markdown, no preamble.
    Example: [{"w": "WORD", "h": "Statutory Precedent: [OT Verse] | Testamental Application: [NT Verse]"}]
    
    The hint (h) MUST include:
    1. A Statutory Precedent (Old Testament reference).
    2. A Testamental Application (New Testament/Grace reference).
    3. Use a high-authority legal-spiritual tone.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        const data = await response.json();

        if (!data.candidates || !data.candidates[0].content) {
            throw new Error("Invalid AI Response");
        }

        // Clean the AI response of any markdown backticks
        let textResponse = data.candidates[0].content.parts[0].text;
        textResponse = textResponse.replace(/```json|```/gi, "").trim();

        // Parse and send
        const cleanedData = JSON.parse(textResponse);
        res.status(200).json(cleanedData);

    } catch (error) {
        console.error("Scribe Error:", error);
        res.status(500).json({ error: "The Scribe is in deep meditation. Try again." });
    }
}