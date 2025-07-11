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
    
    const prompt = `You are a JSON generation bot. Your only purpose is to create a valid JSON object based on user requirements. Do not add any extra text or explanations.

User Requirements:
- Destination: ${destination}
- Interests: ${interests}
- Flight: UA2384 on August 13th
- Traveling with: 18-year-old daughter

JSON Output Specification:
You MUST generate a single, complete, and valid JSON object. This object MUST contain three top-level keys: "packingList", "activities", and "emailDraft".

1.  **packingList**: An array of objects. Each object must have:
    - \`category\` (string): e.g., "Clothing", "Essentials".
    - \`items\` (array of strings): e.g., ["Shirts", "Sunscreen"].

2.  **activities**: An array of 3-4 objects. Each object must have:
    - \`name\` (string): The name of the activity.
    - \`description\` (string): A short description.
    - \`type\` (string): e.g., "Food", "Museum", "Outdoor".

3.  **emailDraft**: A single object. It must have:
    - \`subject\` (string): A subject for an email to the daughter.
    - \`body\` (string): The email body. The body must mention the flight number (UA2384), destination, date (August 13th), and the free carry-on/checked bag perks.

CRITICAL: The entire response must be a single JSON object. Do not truncate the output. Ensure all brackets and braces are correctly closed. Generate the full JSON for all three keys.
`;

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

    const model = 'gemini-1.5-flash-latest';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log(`Calling Gemini API with model: ${model}...`);
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