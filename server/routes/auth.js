import express from 'express';
import { shopify, sessionStorage } from '../index.js';

const router = express.Router();

// Store OAuth state temporarily (in production, use Redis)
const oauthStates = new Map();

// Start OAuth flow
router.get('/shopify', async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }

  try {
    const sanitizedShop = shopify.utils.sanitizeShop(shop, true);
    console.log('🔐 Starting OAuth for shop:', sanitizedShop);
    
    // Generate a random state for CSRF protection
    const state = Buffer.from(Date.now().toString() + Math.random().toString()).toString('base64').substring(0, 40);
    
    // Store state temporarily (for 5 minutes)
    oauthStates.set(state, { shop: sanitizedShop, timestamp: Date.now() });
    
    // Clean up old states (older than 5 minutes)
    for (const [key, value] of oauthStates.entries()) {
      if (Date.now() - value.timestamp > 5 * 60 * 1000) {
        oauthStates.delete(key);
      }
    }
    
    // Build OAuth URL manually
    const redirectUri = `${process.env.HOST}/api/auth/callback`;
    const scopes = process.env.SCOPES;
    
    const authUrl = `https://${sanitizedShop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&grant_options[]=`;
    
    console.log('📍 Redirecting to OAuth URL');
    
    // Redirect to Shopify OAuth
    res.redirect(authUrl);
    
    console.log('✅ OAuth redirect sent');
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    console.error('Full error:', error);

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
    const { code, state, shop: queryShop, host } = req.query;
    
    console.log('📥 OAuth callback received');
    console.log('   Shop:', queryShop);
    console.log('   State:', state);
    console.log('   Code:', code ? 'Present ✓' : 'Missing ✗');
    
    // Verify state to prevent CSRF
    const storedState = oauthStates.get(state);
    if (!storedState) {
      console.error('❌ Invalid state - possible CSRF attack');
      return res.status(403).json({ error: 'Invalid state parameter' });
    }
    
    // Clean up used state
    oauthStates.delete(state);
    
    const shop = storedState.shop;
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.status(400).json({ error: 'No authorization code' });
    }
    
    // Exchange code for access token
    console.log('🔄 Exchanging code for access token...');
    
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('❌ Token exchange failed:', error);
      return res.status(500).json({ error: 'Failed to get access token' });
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token, scope } = tokenData;
    
    console.log('✅ Access token received');
    console.log('   Scopes:', scope);
    
    // Create a session object
    const session = {
      id: `offline_${shop}`,
      shop,
      accessToken: access_token,
      scope,
      isOnline: false,
      isActive: () => true,
    };
    
    // Store session
    sessionStorage.set(shop, session);
    console.log('   Session stored. Total sessions:', sessionStorage.size);
    
    // Redirect back to app
    res.redirect(`/?shop=${shop}${host ? `&host=${host}` : ''}`);
    
    console.log('✅ OAuth flow completed successfully');
  } catch (error) {
    console.error('❌ Callback error:', error);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
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
