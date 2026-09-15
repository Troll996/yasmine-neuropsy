// Vercel Serverless Function to proxy Google Gemini API requests cleanly and securely

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { messages, system, apiKey: bodyApiKey, model = 'gemini-3.6-flash' } = req.body;

    const apiKey = bodyApiKey || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ 
        error: 'Clé API Google AI Studio manquante. Cliquez sur le bouton "Clé API" en haut à droite pour la saisir.' 
      });
    }

    // Convert messages for Gemini format (role "assistant" -> "model")
    const geminiContents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const targetModel = (model && model.includes('gemini')) ? model : 'gemini-3.6-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: system }]
        },
        contents: geminiContents
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || `Erreur API Gemini (${response.status})` 
      });
    }

    // Extract text from candidates
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.find(p => p.text);
    const generatedText = textPart ? textPart.text : 'Pas de réponse générée.';

    return res.status(200).json({
      content: [{ text: generatedText }]
    });

  } catch (err) {
    console.error('Gemini Serverless Error:', err);
    return res.status(500).json({ error: 'Erreur serveur: ' + err.message });
  }
}
