import express from 'express';
import { sessionStorage } from '../index.js';
import {
  fetchThemes,
  fetchThemeAssets,
  compareThemes,
  mergeContentChanges,
} from '../services/themeService.js';

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  const { shop } = req.query;

  console.log('🔒 Auth middleware check for:', shop);

  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }

  const session = sessionStorage.get(shop);

  if (!session) {
    console.log('❌ No session found');
    return res.status(401).json({ error: 'Not authenticated or session expired' });
  }

  console.log('   Session found:', session.shop);
  console.log('   Session isActive:', session.isActive());
  console.log('   Session expires:', session.expires);
  console.log('   Session isOnline:', session.isOnline);
  console.log('   Access token:', session.accessToken ? 'Present' : 'Missing');

  // For offline sessions, check if access token exists instead of isActive()
  // Offline sessions may not have proper expiry dates
  if (!session.accessToken) {
    console.log('❌ Session has no access token');
    return res.status(401).json({ error: 'Not authenticated or session expired' });
  }

  // Only check isActive for online sessions
  if (session.isOnline && !session.isActive()) {
    console.log('❌ Online session is not active or expired');
    return res.status(401).json({ error: 'Not authenticated or session expired' });
  }

  console.log('✅ Session validated successfully');
  req.session = session;
  next();
};

// Get all themes for a shop
router.get('/list', requireAuth, async (req, res) => {
  try {
    console.log('📋 Fetching themes for shop:', req.session.shop);
    const themes = await fetchThemes(req.session);
    console.log(`✅ Found ${themes.length} themes`);
    themes.forEach((theme) => {
      console.log(`   - ${theme.name} (ID: ${theme.id}) ${theme.role === 'main' ? '🟢 LIVE' : ''}`);
    });
    res.json({ themes });
  } catch (error) {
    console.error('❌ Error fetching themes:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Failed to fetch themes', details: error.message });
  }
});

// Compare two themes
router.post('/compare', requireAuth, async (req, res) => {
  try {
    const { sourceThemeId, targetThemeId } = req.body;

    if (!sourceThemeId || !targetThemeId) {
      return res.status(400).json({ error: 'Missing sourceThemeId or targetThemeId' });
    }

    const comparison = await compareThemes(req.session, sourceThemeId, targetThemeId);
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing themes:', error);
    res.status(500).json({ error: 'Failed to compare themes', details: error.message });
  }
});

// Merge content changes from source to target
router.post('/merge', requireAuth, async (req, res) => {
  try {
    const { sourceThemeId, targetThemeId, filesToMerge } = req.body;

    if (!sourceThemeId || !targetThemeId || !filesToMerge) {
      return res.status(400).json({
        error: 'Missing required parameters: sourceThemeId, targetThemeId, or filesToMerge',
      });
    }

    const result = await mergeContentChanges(
      req.session,
      sourceThemeId,
      targetThemeId,
      filesToMerge
    );

    res.json(result);
  } catch (error) {
    console.error('Error merging themes:', error);
    res.status(500).json({ error: 'Failed to merge themes', details: error.message });
  }
});

// Get assets for a specific theme
router.get('/:themeId/assets', requireAuth, async (req, res) => {
  try {
    const { themeId } = req.params;
    const assets = await fetchThemeAssets(req.session, themeId);
    res.json({ assets });
  } catch (error) {
    console.error('Error fetching theme assets:', error);
    res.status(500).json({ error: 'Failed to fetch theme assets', details: error.message });
  }
});

// Get diff between a specific file in two themes
router.post('/diff', requireAuth, async (req, res) => {
  try {
    const { sourceThemeId, targetThemeId, fileKey } = req.body;

    if (!sourceThemeId || !targetThemeId || !fileKey) {
      return res.status(400).json({
        error: 'Missing required parameters: sourceThemeId, targetThemeId, or fileKey',
      });
    }

    console.log(`📄 Fetching diff for: ${fileKey}`);

    const { fetchAssetContent } = await import('../services/themeService.js');

    const [sourceContent, targetContent] = await Promise.all([
      fetchAssetContent(req.session, sourceThemeId, fileKey),
      fetchAssetContent(req.session, targetThemeId, fileKey),
    ]);

    // Parse and pretty-print JSON for better readability
    let sourcePretty = sourceContent.value;
    let targetPretty = targetContent.value;

    if (fileKey.endsWith('.json')) {
      try {
        sourcePretty = JSON.stringify(JSON.parse(sourceContent.value), null, 2);
        targetPretty = JSON.stringify(JSON.parse(targetContent.value), null, 2);
      } catch (err) {
        // If parsing fails, use raw content
      }
    }

    res.json({
      fileKey,
      source: sourcePretty,
      target: targetPretty,
      areEqual: sourcePretty === targetPretty,
    });
  } catch (error) {
    console.error('❌ Error fetching diff:', error.message);
    res.status(500).json({ error: 'Failed to fetch file diff', details: error.message });
  }
});

export default router;
