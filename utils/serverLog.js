/**
 * Production-grade server-side logging helper.
 *
 * – Outputs structured logs via console.log so Vercel captures them.
 * – Never throws (wrapped in try/catch).
 * – Never includes sensitive data (tokens, passwords, full request bodies).
 * – Every log line is prefixed with [requestId] for easy grep/filter.
 */

/**
 * @param {string} requestId  – Unique identifier for this request
 * @param {string} step       – Human-readable step description
 * @param {object} [data={}]  – Optional metadata (will be JSON-stringified safely)
 */
function serverLog(requestId, step, data = {}) {
  try {
    const timestamp = new Date().toISOString();
    const meta = Object.keys(data).length > 0 ? ` | ${safeStringify(data)}` : '';
    console.log(`[${timestamp}] [${requestId}] ${step}${meta}`);
  } catch (_) {
    // Never let logging break the request
    try {
      console.log(`[LOGGER-ERROR] Failed to log step for ${requestId}`);
    } catch (__) {
      // absolute last resort – swallow silently
    }
  }
}

/**
 * JSON.stringify that never throws and truncates large values.
 */
function safeStringify(obj, maxLen = 1000) {
  try {
    const raw = JSON.stringify(obj, (_key, value) => {
      if (typeof value === 'string' && value.length > 200) {
        return `${value.substring(0, 40)}…[truncated, len=${value.length}]`;
      }
      return value;
    });
    if (raw && raw.length > maxLen) {
      return `${raw.substring(0, maxLen)}…[truncated]`;
    }
    return raw;
  } catch {
    return '[unserializable]';
  }
}

/**
 * Generate a unique request ID for a given prefix.
 * @param {string} [prefix='REQ'] – e.g. 'GOOGLE', 'LOGIN', 'REG'
 * @returns {string}
 */
function generateRequestId(prefix = 'REQ') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Log environment configuration at startup (safe — never prints secrets).
 */
function logEnvironmentConfig() {
  const divider = '════════════════════════════════════════';
  console.log(`\n${divider}`);
  console.log('🔧 ENVIRONMENT CONFIGURATION CHECK');
  console.log(divider);
  console.log(`  NODE_ENV              : ${process.env.NODE_ENV || 'not set (defaults to development)'}`);
  console.log(`  GOOGLE_CLIENT_ID      : ${process.env.GOOGLE_CLIENT_ID ? '✓ SET' : '✗ NOT SET'}`);
  console.log(`  VITE_GOOGLE_CLIENT_ID : ${process.env.VITE_GOOGLE_CLIENT_ID ? '✓ SET' : '✗ NOT SET'}`);
  console.log(`  JWT_SECRET            : ${process.env.JWT_SECRET ? '✓ SET' : '✗ NOT SET (using fallback)'}`);
  console.log(`  BACKEND BASE URL      : ${process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || 'not set'}`);
  console.log(`  PORT                  : ${process.env.PORT || '5000 (default)'}`);
  console.log(divider);

  if (!process.env.GOOGLE_CLIENT_ID && !process.env.VITE_GOOGLE_CLIENT_ID) {
    console.warn('⚠️  WARNING: No Google Client ID configured — Google OAuth will fail!');
  }
  console.log('');
}

module.exports = { serverLog, generateRequestId, logEnvironmentConfig };
