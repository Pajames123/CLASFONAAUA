export default async function handler(req, res) {
    const { stallTitle, difficulty } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // Mapping titles to specific Bible focuses for Gemini
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

    const prompt = `You are a Biblical Scribe. Generate 5 unique word scrambles for the category: "${stallTitle}".
    Focus strictly on ${focus}.
    Difficulty Level: ${difficulty} (Novice = common, Disciple = intermediate, Apostle = rare/theological).
    Return ONLY a JSON array: [{"w": "WORD", "h": "Theological hint"}].`;

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
        res.status(500).json({ error: "The Scribe is offline." });
    }
}