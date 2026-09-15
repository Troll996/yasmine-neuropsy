// Vercel Serverless Function to proxy Anthropic API requests cleanly and securely

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, system, apiKey: bodyApiKey, model = 'claude-3-5-sonnet-20241022' } = req.body;

    // Use API key from request body, environment variable, or fallback header
    const apiKey = bodyApiKey || process.env.ANTHROPIC_API_KEY || req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ 
        error: 'Clé API Anthropic manquante. Veuillez saisir votre clé API dans les paramètres.' 
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4096,
        system: system,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || 'Erreur lors de la communication avec l\'API Anthropic' 
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Serverless Error:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur: ' + err.message });
  }
}
