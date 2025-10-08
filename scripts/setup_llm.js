/*
  Auto LLM setup on npm install
  - Detects Ollama CLI and service
  - Installs Ollama (Windows via winget if available)
  - Pulls model: qwen2.5-coder:1.5b

  This script is designed to be resilient and non-blocking.
  If installation fails, it will log helpful instructions
  but will not fail the overall npm install.
*/

const { spawn } = require('child_process');
const http = require('http');

function log(msg) {
  console.log(`[LLM Setup] ${msg}`);
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    log(`Running: ${cmd} ${args.join(' ')}`);
    const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });
    child.on('error', (err) => {
      log(`Command failed to start: ${err.message}`);
      resolve({ code: 1, error: err });
    });
    child.on('close', (code) => resolve({ code }));
  });
}

async function hasOllamaCli() {
  const res = await run('ollama', ['--version']);
  return res.code === 0;
}

function checkOllamaService(timeoutMs = 3000) {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:11434/api/version', (res) => {
      resolve(res.statusCode === 200);
      res.resume();
    });
    req.on('error', () => resolve(false));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function installOllamaIfPossible() {
  if (process.platform === 'win32') {
    // Try winget (requires Windows 10/11 and admin privileges)
    const wingetCheck = await run('winget', ['--version']);
    if (wingetCheck.code === 0) {
      log('winget detected. Attempting to install Ollama...');
      const install = await run('winget', ['install', '-e', '--id', 'Ollama.Ollama', '--silent']);
      if (install.code === 0) {
        log('Ollama installation via winget completed.');
        return true;
      }
      log('winget install failed. You may need to approve UAC or run as Administrator.');
    } else {
      log('winget not available. Skipping automatic Ollama install.');
    }
  } else if (process.platform === 'darwin') {
    // Try Homebrew if present
    const brewCheck = await run('brew', ['--version']);
    if (brewCheck.code === 0) {
      log('Homebrew detected. Attempting to install Ollama...');
      const install = await run('brew', ['install', 'ollama']);
      if (install.code === 0) {
        log('Ollama installation via Homebrew completed.');
        return true;
      }
      log('brew install failed.');
    } else {
      log('Homebrew not available. Skipping automatic Ollama install.');
    }
  } else if (process.platform === 'linux') {
    // Try official install script
    log('Attempting to install Ollama via official install script...');
    const install = await run('bash', ['-lc', 'curl -fsSL https://ollama.com/install.sh | sh']);
    if (install.code === 0) {
      log('Ollama installation via script completed.');
      return true;
    }
    log('Ollama installation script failed.');
  }
  return false;
}

async function ensureModelPulled(model) {
  log(`Ensuring model is available: ${model}`);
  const pull = await run('ollama', ['pull', model]);
  if (pull.code === 0) {
    log(`Model '${model}' is ready.`);
    return true;
  } else {
    log(`Failed to pull model '${model}'.`);
    return false;
  }
}

async function main() {
  try {
    log('Starting LLM setup...');

    const model = process.env.LLM_OLLAMA_MODEL || 'qwen2.5-coder:1.5b';

    let cliAvailable = await hasOllamaCli();
    if (!cliAvailable) {
      log('Ollama CLI not found. Attempting installation...');
      const installed = await installOllamaIfPossible();
      if (!installed) {
        log('Automatic installation failed or unavailable.');
        log('Please install Ollama manually: https://ollama.com');
        log('After installing, rerun: npm install (or run: ollama pull ' + model + ')');
        return; // Do not fail the install
      }
      cliAvailable = await hasOllamaCli();
    }

    const serviceUp = await checkOllamaService();
    if (!serviceUp) {
      log('Ollama service not reachable at http://localhost:11434.');
      if (process.platform === 'linux') {
        log('Try starting the service: `ollama serve`');
      } else {
        log('Ensure Ollama is running (it should auto-start after install).');
      }
      // Continue to try pulling; CLI may start service automatically
    }

    await ensureModelPulled(model);
    log('LLM setup completed.');
  } catch (err) {
    log(`Unexpected error: ${err.message}`);
  }
}

main();