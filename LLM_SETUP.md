LLM setup for production

Overview
- This project uses a local Large Language Model (LLM) to generate dynamic answers for course Q&A.
- Default provider: `Ollama`
- Default model: `qwen2.5-coder:1.5b`

Backend
- Route: `POST /api/llm/answer`
- File: `nw_it_backend/routes/llm.js`
- Environment variables:
  - `LLM_OLLAMA_URL` (default `http://localhost:11434`)
  - `LLM_OLLAMA_MODEL` (default `qwen2.5-coder:1.5b`)
  - `LLM_LMSTUDIO_URL` (optional, for LM Studio; default `http://localhost:1234`)
  - `LLM_LMSTUDIO_MODEL` (optional, e.g. a local LM Studio model name)

Frontend
- File: `nw_it_frontend/src/components/CourseLearning.tsx`
- Environment variables:
  - `VITE_BACKEND_URL` (default `http://localhost:5000`)
  - `VITE_LLM_PROVIDER` (default `ollama`)
  - `VITE_LLM_MODEL` (default `qwen2.5-coder:1.5b`)

Ollama setup
1. Install Ollama on your server: https://ollama.com
2. Pull the model: `ollama pull qwen2.5-coder:1.5b`
3. (Optional) Verify with a quick chat:
   ```
   curl -X POST http://localhost:11434/api/chat \
     -H "Content-Type: application/json" \
     -d '{
       "model": "qwen2.5-coder:1.5b",
       "stream": false,
       "messages": [
         { "role": "user", "content": "What is JavaScript?" }
       ]
     }'
   ```

Backend usage check
```bash
curl -X POST $BACKEND_URL/api/llm/answer \
  -H "Content-Type: application/json" \
  -d '{ "question": "What is JavaScript?", "provider": "ollama", "model": "qwen2.5-coder:1.5b" }'
```

Deployment notes
- Ensure the LLM provider is reachable from the backend server host.
- For production, set the environment variables above in your process manager or hosting platform.
- CORS and JSON parsing are already configured in `nw_it_backend/server.js`.

Troubleshooting
- If `/api/llm/answer` returns `Local LLM unavailable`, confirm:
  - Ollama is running and listening on `LLM_OLLAMA_URL`
  - The model `qwen2.5-coder:1.5b` is pulled and available
  - Firewall rules allow the backend to reach the Ollama port

