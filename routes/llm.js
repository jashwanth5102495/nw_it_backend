const express = require('express');
const router = express.Router();

// Lightweight local LLM proxy: tries LM Studio then Ollama
// Returns a concise CS-focused answer.

const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function tryLMStudio(question, overrideModel) {
  const base = process.env.LLM_LMSTUDIO_URL || 'http://localhost:1234';
  const model = overrideModel || process.env.LLM_LMSTUDIO_MODEL || 'lmstudio-community/Meta-Llama-3-8B-Instruct';
  const url = `${base}/v1/chat/completions`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are a helpful computer science tutor. Answer clearly, factually, and concisely.' },
          { role: 'user', content: question }
        ]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return content ? content.trim() : null;
  } catch (e) {
    return null;
  }
}

async function tryOllama(question, overrideModel) {
  const base = process.env.LLM_OLLAMA_URL || 'http://localhost:11434';
  const model = overrideModel || process.env.LLM_OLLAMA_MODEL || 'qwen2.5-coder:1.5b';
  const url = `${base}/api/chat`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        options: { temperature: 0.2 },
        messages: [
          { role: 'system', content: 'You are a helpful computer science tutor. Provide a clear, factual answer without revealing hidden reasoning steps.' },
          { role: 'user', content: question }
        ]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.message?.content || data?.choices?.[0]?.message?.content || '';
    return content ? content.trim() : null;
  } catch (e) {
    return null;
  }
}

router.post('/answer', async (req, res) => {
  try {
    const question = (req.body?.question || '').trim();
    const preferredProvider = (req.body?.provider || '').toLowerCase(); // 'ollama' | 'lmstudio'
    const preferredModel = (req.body?.model || '').trim();
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    // Choose provider order, default prefers Ollama for DeepSeek-R1
    let answer = null;
    const tryProviders = preferredProvider === 'lmstudio' ? ['lmstudio', 'ollama'] : ['ollama', 'lmstudio'];
    for (const p of tryProviders) {
      if (p === 'ollama') {
        answer = await Promise.race([tryOllama(question, preferredModel), timeout(7000).then(() => null)]);
      } else {
        answer = await Promise.race([tryLMStudio(question, preferredModel), timeout(7000).then(() => null)]);
      }
      if (answer) break;
    }

    if (answer) {
      return res.json({ success: true, answer });
    }
    return res.json({ success: false, message: 'Local LLM unavailable' });
  } catch (error) {
    console.error('LLM proxy error:', error);
    res.status(500).json({ success: false, message: 'LLM proxy failed' });
  }
});

module.exports = router;