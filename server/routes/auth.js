import express from 'express';
import { shopify, sessionStorage } from '../index.js';

const router = express.Router();

// Start OAuth flow
router.get('/shopify', async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }

  try {
    const sanitizedShop = shopify.utils.sanitizeShop(shop, true);
    console.log('🔐 Starting OAuth for shop:', sanitizedShop);

    // shopify.auth.begin handles the redirect when rawRequest/rawResponse are provided
    await shopify.auth.begin({
      shop: sanitizedShop,
      callbackPath: '/api/auth/callback',
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });

    console.log('✅ OAuth redirect sent');
    // No need to call res.redirect() - shopify.auth.begin already did it
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    console.error('Full error:', error);

    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to start authentication',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
});

// OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callback;

    console.log('✅ OAuth callback successful for shop:', session.shop);
    console.log('   Session ID:', session.id);
    console.log('   Access token:', session.accessToken ? 'Present ✓' : 'Missing ✗');

    // Store session (use a proper database in production)
    sessionStorage.set(session.shop, session);
    console.log('   Session stored. Total sessions:', sessionStorage.size);

    // Redirect to app with shop parameter (standalone app)
    res.redirect(`/?shop=${session.shop}`);
  } catch (error) {
    console.error('❌ Callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current session
router.get('/session', (req, res) => {
  const { shop } = req.query;

  console.log('🔍 Session check for shop:', shop);
  console.log('   Available sessions:', Array.from(sessionStorage.keys()));

  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }

  const session = sessionStorage.get(shop);

  if (!session) {
    console.log('❌ No session found for:', shop);
    return res.status(401).json({ error: 'Not authenticated' });
  }

  console.log('✅ Session found:', session.shop);
  console.log('   Is active:', session.isActive());

  res.json({
    shop: session.shop,
    isActive: session.isActive(),
    expiresAt: session.expires,
  });
});

export default router;
