// File: netlify/functions/generate-suggestions.js

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { destination, interests } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY; // Securely access the API key

    if (!apiKey) {
        throw new Error("API key is not configured.");
    }
    
    const prompt = `You are a helpful travel assistant. A user is traveling to ${destination} on August 13th with their 18-year-old daughter. Their flight is UA2384. Their interests are: ${interests}. Provide a travel plan in JSON format. The JSON object should contain three keys: "packingList", "activities", and "emailDraft".
    - The "packingList" should be an array of objects, where each object has a "category" (e.g., "Clothing", "Essentials") and an array of "items".
    - The "activities" should be an array of objects, each with a "name", a "description", and a "type" (e.g., "Museum", "Food", "Music"). Suggest 3-4 varied activities based on their interests.
    - The "emailDraft" should be an object with a "subject" and a "body". The body should be a friendly email from the user to their daughter summarizing the flight details (Flight UA2384 to Houston, Aug 13) and mentioning the key perks they'll get (free carry-on and checked bags).`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            packingList: { type: "ARRAY", items: { type: "OBJECT", properties: { category: { type: "STRING" }, items: { type: "ARRAY", items: { type: "STRING" } } } } },
            activities: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" }, type: { type: "STRING" } } } },
            emailDraft: { type: "OBJECT", properties: { subject: { type: "STRING" }, body: { type: "STRING" } } }
          }
        }
      }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        return { statusCode: response.status, body: JSON.stringify({ message: `API Error: ${response.statusText}`, details: errorBody }) };
    }
    
    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};