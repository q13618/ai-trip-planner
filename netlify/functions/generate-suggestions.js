// File: netlify/functions/generate-suggestions.js

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { destination, interests } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY; // Securely access the API key

    console.log('Function called with:', { destination, interests });
    console.log('API Key exists:', !!apiKey);

    if (!apiKey) {
        console.error('API key is not configured');
        return { 
          statusCode: 500, 
          body: JSON.stringify({ 
            message: "API key is not configured. Please set GEMINI_API_KEY environment variable in Netlify.",
            error: "MISSING_API_KEY"
          }) 
        };
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

    console.log('Calling Gemini API...');
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('API Error:', response.status, errorBody);
        return { 
          statusCode: response.status, 
          body: JSON.stringify({ 
            message: `API Error: ${response.statusText}`, 
            details: errorBody,
            error: "API_CALL_FAILED"
          }) 
        };
    }
    
    const result = await response.json();
    console.log('API Response received successfully');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Function error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        message: error.message,
        error: "FUNCTION_ERROR"
      }) 
    };
  }
};