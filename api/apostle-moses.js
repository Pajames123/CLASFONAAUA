export default async function handler(req, res) {
    // 1. Method & Key Check
    if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ answer: "Method Not Allowed" });
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).json({ answer: "System Error: API Key missing in Vercel." });

    const type = req.query.type || req.body?.type;
    const question = req.body?.question || req.query.question;

    // --- CONFIGURATION ---
    // We try the most common model first.
    const MODEL_NAME = "gemini-1.5-flash"; 
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    try {
        const isNews = type === 'daily-news';
        const systemInstruction = isNews
            ? `You are the Scribe. Date: ${new Date().toDateString()}.
               OUTPUT JSON ONLY: {"verse":"John 11:35", "charge":"Weep with those who weep.", "storyTitle":"Lazarus Rises", "storyText":"Jesus showed power over death...", "implication":"God is final judge.", "globalNewsTitle":"Peace in Region", "globalNewsSummary":"Nations agree to talk."}`
            : `You are Apostle Moses. Answer: ${question}`;

        // 2. Attempt Generation
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemInstruction }] }],
                generationConfig: { temperature: 0.7 }
            })
        });

        const data = await response.json();

        // 3. ERROR HANDLER: If Model Not Found, LIST AVAILABLE MODELS
        if (data.error) {
            console.error("Gemini Error:", data.error);

            // If the specific model wasn't found, let's list what IS available
            if (data.error.code === 404 || data.error.message.includes("not found")) {
                const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
                const listResp = await fetch(listModelsUrl);
                const listData = await listResp.json();
                
                // Format the available models for the user to see
                const availableModels = listData.models 
                    ? listData.models.map(m => m.name.replace('models/', '')).join(', ')
                    : "No models found. Check API Key permissions.";

                return res.status(500).json({ 
                    answer: `Configuration Error: Model '${MODEL_NAME}' not found. Your Key has access to: [ ${availableModels} ]. Please update the code with one of these names.` 
                });
            }

            return res.status(500).json({ answer: `Google API Error: ${data.error.message}` });
        }

        // 4. Success Response
        if (data.candidates && data.candidates[0].content) {
            let text = data.candidates[0].content.parts[0].text;
            if (isNews) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) return res.status(200).json(JSON.parse(jsonMatch[0]));
            }
            return res.status(200).json({ answer: text });
        }

        return res.status(500).json({ answer: "The Scribe is silent (Empty Response)." });

    } catch (error) {
        return res.status(500).json({ answer: "Server Connection Error: " + error.message });
    }
}