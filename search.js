const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Helper: DuckDuckGo Instant Answer API (no key needed)
async function duckduckgoInstantAnswer(query) {
  const url = `https://api.duckduckgo.com/?format=json&no_html=1&skip_disambig=1&q=${encodeURIComponent(query)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`DuckDuckGO error: ${resp.status}`);
  const data = await resp.json();
  const abstract = data.AbstractText || '';
  const related = data.RelatedTopics
    .filter(t => t.Text)
    .map(t => t.Text)
    .slice(0, 3)
    .join(' ');
  const firstUrl = (data.RelatedTopics[0] && data.RelatedTopics[0].FirstURL) || '';
  return { abstract, related, firstUrl };
}

// Helper: Hugging Face Inference API (free tier) – uses google/flan-t5-large
async function hfSummarise(prompt) {
  const HF_API_URL = process.env.HF_API_URL || 'https://api-inference.huggingface.co/models/google/flan-t5-large';
  const HF_TOKEN = process.env.HF_API_TOKEN; // optional but recommended for higher rate limits

  const payload = {
    inputs: prompt,
    parameters: { max_new_tokens: 256, temperature: 0.2 },
    options: { wait_for_model: true }
  };

  const headers = {
    'Content-Type': 'application/json'
  };
  if (HF_TOKEN) {
    headers.Authorization = `Bearer ${HF_TOKEN}`;
  }

  const resp = await fetch(HF_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`HF error ${resp.status}: ${errText}`);
  }

  const json = await resp.json();
  // HF returns array of objects with generated_text
  let text = '';
  if (Array.isArray(json) && json.length > 0) {
    text = json[0].generated_text || '';
  } else if (typeof json === 'object' && json.generated_text !== undefined) {
    text = json.generated_text;
  } else {
    // fallback: try to join any strings
    text = String(json);
  }
  return text;
}

// Main route mimicking Anthropic's /v1/messages endpoint
router.post('/v1/messages', async (req, res) => {
  try {
    const { model, max_tokens, tools, messages } = req.body;
    // Extract the last user message (the prompt)
    const userMsg = messages.find(m => m.role === 'user');
    if (!userMsg) {
      return res.status(400).json({ error: 'No user message found' });
    }
    const prompt = userMsg.content;

    // 1️⃣ Perform free web search via DuckDuckGo
    const { abstract, related, firstUrl } = await duckduckgoInstantAnswer(prompt);

    // 2️⃣ Build a prompt for the HF model to extract structured info
    const summarisePrompt = `
You are a business‑intelligence assistant. Given the following raw search information about a company, produce a JSON object with exactly these keys:
- status: one of "active", "closed", "merged", "renamed"
- newUrl: the current URL if the company rebranded or changed domain, otherwise empty string
- country: the exact country name (e.g. "Germany", "USA")
- isPoster: true if the company is a recruitment/headhunter/staffing/executive search/talent acquisition firm, else false
- notes: a short 1‑2 sentence factual summary of what you found

Raw search data:
Abstract: ${abstract}
Related snippets: ${related}
First result URL: ${firstUrl}

Respond ONLY with a valid JSON object, no extra text.
`;

    const rawSummary = await hfSummarise(summarisePrompt);

    // 3️⃣ Extract JSON from the model's output (same regex the frontend uses)
    let summaryObj;
    try {
      const match = rawSummary.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON found in model output');
      summaryObj = JSON.parse(match[0]);
    } catch (e) {
      // Fallback safe object so the UI doesn't break
      console.warn('Failed to parse model output:', rawSummary);
      summaryObj = {
        status: 'unknown',
        newUrl: '',
        country: 'Unknown',
        isPoster: false,
        notes: 'Could not parse model response.'
      };
    }

    // 4️⃣ Shape the response to mimic Anthropic's format
    const anthropicStyleResponse = {
      id: `msg_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      model: model || 'claude-sonnet-4-6',
      content: [
        {
          type: 'text',
          text: JSON.stringify(summaryObj)
        }
      ],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 0, output_tokens: 0 }
    };

    res.json(anthropicStyleResponse);
  } catch (err) {
    console.error('Error in /v1/messages:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;