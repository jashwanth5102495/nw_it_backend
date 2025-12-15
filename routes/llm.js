const express = require('express');

const router = express.Router();

// Detect provider from env; default to Ollama
const PROVIDER = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();
const MODEL = process.env.LLM_MODEL || 'deepseek-coder-v2';

// Ollama defaults
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
// LM Studio (OpenAI-compatible) defaults
const LMSTUDIO_URL = process.env.LMSTUDIO_URL || 'http://localhost:1234/v1';

async function getOllamaModels() {
  try {
    const resp = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!resp.ok) return [];
    const data = await resp.json();
    const names = (data?.models || []).map(m => m.name || m.model).filter(Boolean);
    return names;
  } catch (_) {
    return [];
  }
}

router.post('/chat', async (req, res) => {
  try {
    const { question, history = [] } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    let answer = '';

    if (PROVIDER === 'ollama') {
      // Check available models and fallback if requested is missing
      const available = await getOllamaModels();
      let effectiveModel = MODEL;
      if (!available.includes(MODEL)) {
        // Prefer known small coder models or the first available
        const preferred = ['qwen2.5-coder:1.5b', 'llama3.1', 'llama3.1:8b'];
        effectiveModel = preferred.find(p => available.includes(p)) || available[0];
      }
      if (!effectiveModel) {
        throw new Error(`No Ollama models installed. Install one like 'ollama pull qwen2.5-coder:1.5b'`);
      }

      // Build Ollama chat payload
      const messages = [
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: question }
      ];

      const resp = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: effectiveModel, messages, stream: false })
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Ollama error ${resp.status}: ${text}`);
      }
      const data = await resp.json();
      // Non-streaming chat returns { message: { role, content } }
      answer = data?.message?.content || '';
    } else if (PROVIDER === 'lmstudio') {
      const messages = [
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: question }
      ];

      const resp = await fetch(`${LMSTUDIO_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.2,
          stream: false
        })
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`LM Studio error ${resp.status}: ${text}`);
      }
      const data = await resp.json();
      answer = data?.choices?.[0]?.message?.content || '';
    } else {
      throw new Error(`Unsupported LLM_PROVIDER: ${PROVIDER}`);
    }

    res.json({ success: true, provider: PROVIDER, model: MODEL, answer });
  } catch (err) {
    console.error('LLM chat error:', err);
    res.status(500).json({ success: false, message: 'Failed to get answer from LLM', error: err.message });
  }
});

module.exports = router;