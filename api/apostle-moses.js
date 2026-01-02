export default async function handler(req, res) {
    // 1. Method Check
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ answer: "Method Not Allowed" });
    }

    const type = req.query.type || req.body?.type;
    const question = req.body?.question || req.query.question;
    const API_KEY = process.env.GEMINI_API_KEY;

    // --- MODE 1: DAILY NEWS (STATIC FALLBACK) ---
    // Since the API is hitting quota limits, we serve the "Daily Revelation" directly.
    // This ensures the Homepage and News Page NEVER crash.
    if (type === 'daily-news') {
        return res.status(200).json({
            verse: "John 1:29 — 'The next day John seeth Jesus coming unto him, and saith, Behold the Lamb of God, which taketh away the sin of the world.'",
            charge: "Justice must flower in our days; we govern with the Spirit to rescue the lowly.",
            storyTitle: "The Lamb’s Precedent: Evidence of Divine Substitution",
            storyText: "In the Gospel according to John, we find the ultimate legal testimony. John the Baptist stands as the chief witness, declaring the arrival of the 'Lamb of God.' This title is not merely metaphorical; it is a statutory reference to the sacrificial system that required a substitute to satisfy the debt of the Law. John's testimony provides the evidentiary basis for our faith. As legal practitioners, we understand the weight of a reliable witness. In the court of Heaven, Christ appeared not to abolish the Law but to fulfill its stringent requirements as our Substitute.",
            implication: "John 1:29-34 establishes the necessity of 'witness and testimony.' In law, integrity is the alignment of one's witness with the objective truth.",
            globalNewsTitle: "Passion 2026 Ignites as Youth Seek 'Christ Alone'",
            globalNewsSummary: "The Passion Conference 2026 opened with Earl McClellan urging thousands of students to move beyond 'emotional highs' and anchor their lives in Jesus. Simultaneously, the World Council of Churches has issued a global call for prayer following a tragic New Year's Day fire in Switzerland."
        });
    }

    // --- MODE 2: CHAT (ATTEMPT LIVE API) ---
    // We try to chat. If Quota fails, we return a polite "Busy" message instead of a crash.
    if (!API_KEY) return res.status(200).json({ answer: "The Scribe's ink is dry (System Configuration Error)." });

    try {
        // Using the "Lite" model as it's the most likely to work if quota returns
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent?key=${API_KEY}`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are Apostle Moses, Legal-Spiritual AI. User: ${question}` }] }]
            })
        });

        const data = await response.json();

        // Graceful Error Handling for Chat
        if (data.error) {
            console.error("Gemini Quota Error:", data.error.message);
            return res.status(200).json({ 
                answer: "The Scribe is currently meditating (Daily API Quota Reached). Please consult the Constitution in the Library or try again tomorrow." 
            });
        }

        if (data.candidates && data.candidates[0].content) {
            return res.status(200).json({ answer: data.candidates[0].content.parts[0].text });
        }

        return res.status(200).json({ answer: "The Scribe is silent." });

    } catch (error) {
        return res.status(200).json({ answer: "Connection to the Sanctuary is temporarily unavailable." });
    }
}