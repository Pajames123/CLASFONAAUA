export default async function handler(req, res) {
    // Only allow POST requests for security
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { question } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // Premium Check: Verify API Key existence before attempting fetch
    if (!API_KEY) {
        return res.status(500).json({ 
            answer: "Apostle Moses: The key to the sanctuary is missing. Please check environment variables." 
        });
    }

    try {
        /**
         * BUG FIX & PREMIUM OPTIMIZATION:
         * 1. Uses 'v1beta' endpoint for enhanced 2026 compatibility.
         * 2. Uses 'gemini-2.0-flash-lite' to significantly reduce token usage and avoid quota errors.
         */
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `System Instruction: You are Apostle Moses, the Digital Theological Assistant for CLASFON AAUA. 
                        Respond as a biblical and legal scholar with a reverent tone. 
                        Always include relevant scripture to support your counsel.
                        
                        User Question: ${question}` 
                    }] 
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024, // Optimized for comprehensive but efficient responses
                }
            })
        });

        const data = await response.json();

        // COMPREHENSIVE ERROR HANDLING
        if (data.error) {
            // Handle Quota Exceeded specifically to inform the user gently
            if (data.error.message.includes("quota") || data.error.code === 429) {
                return res.status(429).json({ 
                    answer: "Apostle Moses is currently attending to many seekers. Please wait a few moments before seeking counsel again." 
                });
            }
            
            // Handle Model Not Found or Maintenance errors
            return res.status(500).json({ 
                answer: "The sanctuary is undergoing maintenance. (Error: " + data.error.message + ")" 
            });
        }

        // Validate response structure before accessing data
        if (data.candidates && data.candidates[0].content) {
            const mosesAnswer = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ answer: mosesAnswer });
        }
        
        return res.status(500).json({ answer: "Apostle Moses is deep in meditation. Please try again later." });

    } catch (error) {
        // Catch network or unexpected server-side interruptions
        console.error("Sanctuary Connection Error:", error);
        return res.status(500).json({ answer: "Shalom. The connection to the sanctuary was interrupted." });
    }
}