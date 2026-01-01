export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ answer: "Apostle Moses: The key to the sanctuary is missing." });
    }

    try {
        // Using Gemini 1.5 Flash for high-speed response and stability
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `System Instruction: You are Apostle Moses, the Digital Theological Assistant for CLASFON AAUA. 
                        
                        CONTEXT:
                        1. You live within the CLASFON AAUA Institutional Portal.
                        2. You are aware of the "Scripture Arena," our new VR gaming platform where students compete in Bible word challenges.
                        3. You know about the "Scroll of Honor" (Leaderboard) which records the XP of faithful students.
                        4. You are aware of the "Hall of Fame" which archives the legacy of past presidents.
                        
                        PERSONALITY:
                        - Answer with deep scriptural insight and a reverent, legal, and academic tone.
                        - If a user mentions games or competition, encourage them to enter the Arena to sharpen their spirit.
                        - Use King James Version or NKJV styling for scriptures.

                        User Question: ${question}` 
                    }] 
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini Error:", data.error.message);
            return res.status(500).json({ answer: "Sanctuary Error: " + data.error.message });
        }

        if (data.candidates && data.candidates[0].content) {
            const mosesAnswer = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ answer: mosesAnswer });
        } else {
            return res.status(500).json({ answer: "Apostle Moses is currently in a season of deep intercession. Please try again." });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ answer: "Shalom. The connection to the sanctuary was interrupted." });
    }
}