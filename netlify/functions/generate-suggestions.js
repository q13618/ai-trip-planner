// File: netlify/functions/generate-suggestions.js

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { destination, interests } = JSON.parse(event.body);

    // === Azure OpenAI 配置 ===
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT; // 例如 https://eastus.api.cognitive.microsoft.com/
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT; // 例如 gpt-4-mini-deployment
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

    if (!endpoint || !deployment || !apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Azure OpenAI 环境变量未正确配置',
          error: 'MISSING_AZURE_CONFIG'
        })
      };
    }

    console.log('Using Azure OpenAI endpoint:', endpoint);

    // === 构建请求体 ===
    const prompt = `You are a JSON generation bot. Your only purpose is to create a valid JSON object based on user requirements. Do not add any extra text or explanations.\n\nUser Requirements:\n- Destination: ${destination}\n- Interests: ${interests}\n- Flight: UA2384 on August 13th\n- Traveling with: 18-year-old daughter\n\nJSON Output Specification:\nYou MUST generate a single, complete, and valid JSON object. This object MUST contain three top-level keys: \"packingList\", \"activities\", and \"emailDraft\".\n\n1.  **packingList**: An array of objects. Each object must have:\n    - \`category\` (string)\n    - \`items\` (array of strings)\n2.  **activities**: An array of 3-4 objects. Each object must have:\n    - \`name\` (string)\n    - \`description\` (string)\n    - \`type\` (string)\n3.  **emailDraft**: An object with \"subject\" and \"body\" fields. The body must mention flight number (UA2384), destination, date (August 13th), and free bag perks.\n\nCRITICAL: The entire response must be a single JSON object.`;

    const azureUrl = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const payload = {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that outputs only JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    };

    const response = await fetch(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    console.log('Azure response status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: 'Azure OpenAI API Error', details: errText })
      };
    }

    const result = await response.json();

    // Azure 返回格式: { choices: [ { message: { content: '{...json...}' } } ] }
    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'No content from Azure OpenAI' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: content // 直接返回 JSON 字符串
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
};