const express = require('express');
const { serverLog, generateRequestId } = require('../utils/serverLog');

const router = express.Router();

/**
 * POST /api/log/client-error
 *
 * Lightweight endpoint for the frontend to report errors that only exist
 * in the user's browser.  This makes them visible in Railway server logs
 * so we can debug production issues (Google OAuth failures, fetch errors,
 * CORS blocks, etc.) without access to the user's dev console.
 *
 * Body: { source, action, error, metadata? }
 * Response: always 204 No Content (fire-and-forget from the frontend)
 */
router.post('/client-error', (req, res) => {
  try {
    const requestId = generateRequestId('CLIENT');
    const { source, action, error, metadata } = req.body || {};

    serverLog(requestId, '🖥️  CLIENT-SIDE ERROR REPORT', {
      source:   source   || 'unknown',
      action:   action   || 'unknown',
      error:    error    || 'no error provided',
      metadata: metadata || {},
      ip:       req.ip,
      userAgent: req.get('User-Agent'),
      origin:   req.get('Origin') || req.get('Referer') || 'unknown'
    });
  } catch (_) {
    // Never let this endpoint break — it's purely diagnostic
  }

  // Always return 204 — frontend should not wait on this
  res.status(204).end();
});

module.exports = router;
