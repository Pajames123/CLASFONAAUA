export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ answer: "Method Not Allowed" });
    }

    const type = req.query.type || req.body?.type;
    const question = req.body?.question || req.query.question;
    
    // 1. GET THE GROQ KEY
    const API_KEY = process.env.GROQ_API_KEY;

    // --- STATIC FALLBACK (If Key is missing, site still works) ---
    if (!API_KEY) {
        if (type === 'daily-news') {
             return res.status(200).json({
                verse: "Isaiah 33:22 — 'For the LORD is our Judge, the LORD is our Lawgiver, the LORD is our King; he will save us.'",
                charge: "We do not bow to the statutes of compromise; we stand on the Rock of Ages.",
                storyTitle: "The Gavel of the Almighty",
                storyText: "In the halls of eternity, there is but one Supreme Court. When earthly laws fail and justice is perverted, we remember the Ancient of Days who sits upon the throne of judgment. As advocates in training, we are not merely learning codes and statutes; we are learning the character of the Lawgiver Himself. Let your advocacy be a reflection of His righteous nature.",
                implication: "Legal integrity stems from accountability to the Divine Judge, not just human courts.",
                globalNewsTitle: "Global Awakening: Faith in the Public Square",
                globalNewsSummary: "Reports from across the nations indicate a rising tide of professionals boldly declaring their faith in secular marketplaces, bringing ethical renewal to corporate and legal systems."
            });
        }
        return res.status(200).json({ answer: "The Scribe is offline (Key Missing). Please check Vercel settings." });
    }

    try {
        // 2. GROQ API CONFIGURATION
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // High intelligence, massive free tier
                messages: [
                    {
                        role: "system",
                        content: type === 'daily-news'
                            ? `You are the Scribe of CLASFON AAUA. Date: ${new Date().toDateString()}.
                               TASK: Generate Daily Revelation.
                               OUTPUT RAW JSON ONLY (No markdown): {"verse":"", "charge":"", "storyTitle":"", "storyText":"", "implication":"", "globalNewsTitle":"", "globalNewsSummary":""}`
                            : `You are Apostle Moses, Legal-Spiritual AI. Address user as 'Future Advocate'. Provide a 'Statutory Precedent' (OT) and 'Testamental Application' (NT). Tone: Authoritative, Biblical, Professional.`
                    },
                    {
                        role: "user",
                        content: question || "Generate Daily News"
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024,
                response_format: type === 'daily-news' ? { type: "json_object" } : { type: "text" }
            })
        });

        const data = await response.json();

        // 3. ERROR HANDLING
        if (data.error) {
            console.error("Groq Error:", data.error);
            return res.status(200).json({ answer: "The Scribe is meditating on a higher law. (System Error)" });
        }

        // 4. SUCCESS
        const content = data.choices[0].message.content;
        
        if (type === 'daily-news') {
            return res.status(200).json(JSON.parse(content));
        }

        return res.status(200).json({ answer: content });

    } catch (error) {
        console.error("Connection Error:", error);
        return res.status(200).json({ answer: "Connection to the Sanctuary is unstable." });
    }
}