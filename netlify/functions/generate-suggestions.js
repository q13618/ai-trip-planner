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
    
    const prompt = `You are a helpful travel assistant. A user is traveling to ${destination} on August 13th with their 18-year-old daughter. Their flight is UA2384. Their interests are: ${interests}. 

CRITICAL: You MUST return a COMPLETE and VALID JSON object. The response must include ALL THREE sections: packingList, activities, AND emailDraft. Do not stop halfway through the JSON.

Return ONLY a valid JSON object with this exact structure:

{
  "packingList": [
    {
      "category": "Clothing",
      "items": ["Lightweight shirts", "Comfortable pants", "Walking shoes", "Sweater"]
    },
    {
      "category": "Essentials",
      "items": ["Toothbrush", "Toothpaste", "Sunscreen", "Phone charger"]
    },
    {
      "category": "Documents",
      "items": ["Flight tickets", "ID", "Hotel reservation"]
    }
  ],
  "activities": [
    {
      "name": "Visit Space Center Houston",
      "description": "Explore NASA's official visitor center with interactive exhibits and space artifacts",
      "type": "Museum"
    },
    {
      "name": "Try Local BBQ",
      "description": "Sample authentic Texas BBQ at popular local restaurants",
      "type": "Food"
    },
    {
      "name": "Museum District Tour",
      "description": "Visit multiple museums in Houston's cultural district",
      "type": "Culture"
    }
  ],
  "emailDraft": {
    "subject": "Our Trip to ${destination} - Flight Details and Perks",
    "body": "Hi honey! Just wanted to share the details for our trip to ${destination} on August 13th. We're flying United Airlines flight UA2384. The great news is that with our United Business Card, we get free carry-on bags and our first checked bag is free too! This will save us money and make traveling easier. I'm excited for our adventure together!"
  }
}

Remember: Include ALL THREE sections (packingList, activities, emailDraft) in your response. Do not omit any section.`;

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