const express = require('express');

const router = express.Router();

// Environment configuration
const PROVIDER = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();
const MODEL = process.env.LLM_MODEL || 'qwen2.5-coder:3b';

// Ollama configuration - supports both local and remote (proxy) deployments
// Remove trailing slash from URL to prevent double slashes
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/+$/, '');
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || ''; // For authenticated proxies
const OLLAMA_API_KEY_HEADER = process.env.OLLAMA_API_KEY_HEADER || 'X-API-Key'; // Header name for API key (default: X-API-Key)

// LM Studio (OpenAI-compatible) defaults
const LMSTUDIO_URL = process.env.LMSTUDIO_URL || 'http://localhost:1234/v1';

// Default system prompt for the AI tutor
const DEFAULT_SYSTEM_PROMPT = `You are a patient, clear coding and IT tutor for beginners and intermediates.
Always explain concepts step-by-step, provide complete runnable code examples when relevant,
and adapt your teaching style to the student's level. Be encouraging and supportive.`;

/**
 * Fetch available models from Ollama
 */
async function getOllamaModels() {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (OLLAMA_API_KEY) {
      headers[OLLAMA_API_KEY_HEADER] = OLLAMA_API_KEY;
    }
    
    const resp = await fetch(`${OLLAMA_URL}/api/tags`, { headers });
    if (!resp.ok) return [];
    const data = await resp.json();
    const names = (data?.models || []).map(m => m.name || m.model).filter(Boolean);
    return names;
  } catch (_) {
    return [];
  }
}

/**
 * Build messages array with system prompt
 */
function buildMessages(question, history = [], systemPrompt = null) {
  const messages = [];
  
  // Add system prompt if provided, otherwise use default
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  } else {
    messages.push({ role: 'system', content: DEFAULT_SYSTEM_PROMPT });
  }
  
  // Add conversation history (filter out any existing system messages to avoid duplicates)
  const filteredHistory = history.filter(m => m.role !== 'system');
  messages.push(...filteredHistory.map(m => ({ role: m.role, content: m.content })));
  
  // Add current question
  messages.push({ role: 'user', content: question });
  
  return messages;
}

/**
 * Call Ollama API (works with both local and remote/proxy deployments)
 */
async function callOllama(messages, model) {
  console.log('   📡 callOllama() - Starting request');
  console.log('   🎯 Target:', `${OLLAMA_URL}/api/chat`);
  console.log('   📦 Model:', model);
  console.log('   💬 Messages count:', messages.length);
  
  const headers = { 'Content-Type': 'application/json' };
  if (OLLAMA_API_KEY) {
    headers[OLLAMA_API_KEY_HEADER] = OLLAMA_API_KEY;
    console.log('   🔑 Using API key: Yes (header:', OLLAMA_API_KEY_HEADER + ')');
  } else {
    console.log('   🔑 Using API key: No');
  }

  try {
    console.log('   ⏳ Sending request to Ollama...');
    const resp = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        model, 
        messages, 
        stream: false,
        options: {
          temperature: 0.4,
          num_predict: 1024
        }
      })
    });

    console.log('   📬 Ollama response status:', resp.status);
    
    if (!resp.ok) {
      const text = await resp.text();
      console.log('   ❌ Ollama error response:', text.substring(0, 200));
      throw new Error(`Ollama error ${resp.status}: ${text}`);
    }
    
    const data = await resp.json();
    console.log('   ✅ Ollama response parsed successfully');
    console.log('   📄 Response content length:', data?.message?.content?.length || 0);
    return data?.message?.content || '';
  } catch (err) {
    console.log('   ❌ callOllama() ERROR:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log('   ⚠️ HINT: Is Ollama running? Try: ollama serve');
    }
    throw err;
  }
}

/**
 * Call OpenAI-compatible API (LM Studio, or Ollama's OpenAI-compatible endpoint)
 */
async function callOpenAICompatible(messages, model, baseUrl) {
  const headers = { 'Content-Type': 'application/json' };
  if (OLLAMA_API_KEY) {
    headers[OLLAMA_API_KEY_HEADER] = OLLAMA_API_KEY;
  }

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 1024,
      stream: false
    })
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI-compatible API error ${resp.status}: ${text}`);
  }
  
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || '';
}

/**
 * Main chat endpoint for Personal Teacher feature
 * 
 * Request body:
 * - question: string (required) - The user's question
 * - history: array (optional) - Previous conversation messages [{role, content}]
 * - systemPrompt: string (optional) - Custom system prompt for course context
 * - courseContext: object (optional) - Additional course context {courseName, moduleName, lessonTitle}
 */
router.post('/chat', async (req, res) => {
  console.log('\n========== 🤖 LLM CHAT REQUEST ==========');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🔧 Provider:', PROVIDER);
  console.log('📦 Model:', MODEL);
  console.log('🌐 Ollama URL:', OLLAMA_URL);
  console.log('API KEY: ', OLLAMA_API_KEY);
  
  try {
    const { question, history = [], systemPrompt, courseContext } = req.body || {};
    
    console.log('📝 Question:', question?.substring(0, 100) + (question?.length > 100 ? '...' : ''));
    console.log('📜 History length:', history?.length || 0);
    console.log('🎯 Course context:', courseContext ? JSON.stringify(courseContext).substring(0, 100) : 'None');
    
    if (!question || typeof question !== 'string') {
      console.log('❌ ERROR: Question is missing or invalid');
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    // Build enhanced system prompt if course context is provided
    let effectiveSystemPrompt = systemPrompt;
    if (courseContext && !systemPrompt) {
      const { courseName, moduleName, lessonTitle, lessonContent } = courseContext;
      effectiveSystemPrompt = `You are an expert tutor for the "${courseName || 'IT'}" course.
The student is currently studying:
- Module: ${moduleName || 'N/A'}
- Lesson: ${lessonTitle || 'N/A'}
${lessonContent ? `\nLesson Context:\n${lessonContent.substring(0, 2000)}` : ''}

Provide clear, helpful explanations. Use examples when appropriate.
If the question relates to the current lesson, reference the content.
Be encouraging and adapt to the student's level.`;
    }

    const messages = buildMessages(question, history, effectiveSystemPrompt);
    let answer = '';

    if (PROVIDER === 'ollama') {
      // Check available models and fallback if requested is missing
      const available = await getOllamaModels();
      let effectiveModel = MODEL;
      
      if (available.length > 0 && !available.includes(MODEL)) {
        // Prefer known capable models
        const preferred = ['qwen2.5-coder:3b', 'qwen2.5-coder:1.5b', 'llama3.1', 'llama3.1:8b', 'mistral'];
        effectiveModel = preferred.find(p => available.includes(p)) || available[0];
        console.log(`Model ${MODEL} not found, using ${effectiveModel}`);
      }
      
      if (available.length === 0) {
        // If we can't get models list (might be remote proxy), try with configured model
        effectiveModel = MODEL;
        console.log(`⚠️ Cannot fetch models list, using configured model: ${effectiveModel}`);
      }

      console.log('🚀 Calling Ollama with model:', effectiveModel);
      console.log('📨 Sending request to:', `${OLLAMA_URL}/api/chat`);
      
      answer = await callOllama(messages, effectiveModel);
      console.log('✅ Ollama response received, length:', answer?.length || 0);
      
    } else if (PROVIDER === 'lmstudio') {
      console.log('🚀 Calling LM Studio...');
      answer = await callOpenAICompatible(messages, MODEL, LMSTUDIO_URL);
      console.log('✅ LM Studio response received');
      
    } else if (PROVIDER === 'openai-compatible') {
      // Generic OpenAI-compatible endpoint (can be used with Ollama's OpenAI API too)
      const baseUrl = process.env.OPENAI_COMPATIBLE_URL || OLLAMA_URL + '/v1';
      console.log('🚀 Calling OpenAI-compatible endpoint:', baseUrl);
      answer = await callOpenAICompatible(messages, MODEL, baseUrl);
      console.log('✅ OpenAI-compatible response received');
      
    } else {
      throw new Error(`Unsupported LLM_PROVIDER: ${PROVIDER}`);
    }

    console.log('🎉 SUCCESS - Sending response to client');
    console.log('📤 Answer preview:', answer?.substring(0, 150) + (answer?.length > 150 ? '...' : ''));
    console.log('==========================================\n');
    
    res.json({ 
      success: true, 
      provider: PROVIDER, 
      model: MODEL, 
      answer 
    });
    
  } catch (err) {
    console.log('❌ LLM CHAT ERROR ❌');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.log('==========================================\n');
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get answer from AI tutor', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Service temporarily unavailable'
    });
  }
});

/**
 * Health check endpoint for LLM service
 */
router.get('/health', async (req, res) => {
  try {
    const models = await getOllamaModels();
    res.json({
      success: true,
      provider: PROVIDER,
      model: MODEL,
      ollamaUrl: OLLAMA_URL,
      availableModels: models,
      hasApiKey: !!OLLAMA_API_KEY
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'LLM service health check failed',
      error: err.message
    });
  }
});

module.exports = router;