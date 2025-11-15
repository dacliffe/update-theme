import { shopify } from '../index.js';

// Fetch all themes for a shop
export async function fetchThemes(session) {
  const client = new shopify.clients.Rest({ session });
  const response = await client.get({ path: 'themes' });
  return response.body.themes;
}

// Fetch all assets for a theme
export async function fetchThemeAssets(session, themeId) {
  const client = new shopify.clients.Rest({ session });
  const response = await client.get({
    path: `themes/${themeId}/assets`,
  });
  return response.body.assets;
}

// Fetch a specific asset's content with retry logic
export async function fetchAssetContent(session, themeId, assetKey, retries = 3) {
  const client = new shopify.clients.Rest({ session });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client.get({
        path: `themes/${themeId}/assets`,
        query: { 'asset[key]': assetKey },
      });
      return response.body.asset;
    } catch (error) {
      // If it's a rate limit error and we have retries left
      if (error.response?.code === 429 && attempt < retries) {
        const retryAfter = error.response?.retryAfter || 2;
        const delay = retryAfter * 1000 * (attempt + 1); // Exponential backoff
        console.log(`   ⏳ Rate limited, retrying ${assetKey} in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      // If not a rate limit or out of retries, throw the error
      throw error;
    }
  }
}

// Update an asset
export async function updateAsset(session, themeId, assetKey, value) {
  const client = new shopify.clients.Rest({ session });
  const response = await client.put({
    path: `themes/${themeId}/assets`,
    data: {
      asset: {
        key: assetKey,
        value: value,
      },
    },
  });
  return response.body.asset;
}

// Compare two themes and identify content changes
export async function compareThemes(session, sourceThemeId, targetThemeId) {
  const [sourceAssets, targetAssets] = await Promise.all([
    fetchThemeAssets(session, sourceThemeId),
    fetchThemeAssets(session, targetThemeId),
  ]);

  // Filter for content files (JSON files in config, sections, templates)
  const contentPaths = ['config/settings_data.json', 'sections/', 'templates/'];

  const isContentFile = (key) => {
    return (
      contentPaths.some((path) => key.startsWith(path)) &&
      (key.endsWith('.json') || (key.includes('/') && key.split('/').pop().endsWith('.json')))
    );
  };

  const sourceContentFiles = sourceAssets.filter((asset) => isContentFile(asset.key));
  const targetContentFiles = targetAssets.filter((asset) => isContentFile(asset.key));

  // Create maps for easier lookup
  const sourceMap = new Map(sourceContentFiles.map((asset) => [asset.key, asset]));
  const targetMap = new Map(targetContentFiles.map((asset) => [asset.key, asset]));

  // Find differences
  const differences = {
    added: [], // Files in source but not in target
    modified: [], // Files that exist in both but are different
    deleted: [], // Files in target but not in source (informational)
  };

  // Collect files that need content comparison
  const filesToCompareByContent = [];

  for (const [key, sourceAsset] of sourceMap) {
    const targetAsset = targetMap.get(key);

    if (!targetAsset) {
      differences.added.push({
        key,
        size: sourceAsset.size,
        updated_at: sourceAsset.updated_at,
      });
    } else if (sourceAsset.size !== targetAsset.size) {
      // Files with different sizes might still have same content (whitespace differences)
      filesToCompareByContent.push({ key, sourceAsset, targetAsset });
    } else if (sourceAsset.updated_at !== targetAsset.updated_at) {
      // Same size but different timestamps - could be duplicated theme
      filesToCompareByContent.push({ key, sourceAsset, targetAsset });
    }
  }

  console.log(`📊 Comparing content for ${filesToCompareByContent.length} files...`);

  // Compare actual content for files
  const contentComparisonPromises = filesToCompareByContent.map(
    async ({ key, sourceAsset, targetAsset }) => {
      try {
        const [sourceContent, targetContent] = await Promise.all([
          fetchAssetContent(session, sourceThemeId, key),
          fetchAssetContent(session, targetThemeId, key),
        ]);

        // For JSON files, parse and compare the actual JSON objects (ignoring whitespace)
        let areEqual = false;

        if (key.endsWith('.json')) {
          try {
            const sourceJson = JSON.parse(sourceContent.value);
            const targetJson = JSON.parse(targetContent.value);
            // Deep comparison by re-stringifying with same formatting
            const sourceStr = JSON.stringify(sourceJson);
            const targetStr = JSON.stringify(targetJson);
            areEqual = sourceStr === targetStr;

            if (areEqual) {
              console.log(`   ✓ ${key} - identical content (different timestamps only)`);
            } else {
              console.log(`   ✗ ${key} - content differs`);
            }
          } catch (err) {
            // If JSON parsing fails, compare as strings
            console.log(`   ⚠️  ${key} - JSON parse failed, comparing as strings`);
            areEqual = sourceContent.value === targetContent.value;
          }
        } else {
          // Non-JSON files: direct string comparison
          areEqual = sourceContent.value === targetContent.value;
        }

        if (!areEqual) {
          return {
            key,
            sourceSize: sourceAsset.size,
            targetSize: targetAsset.size,
            sourceUpdated: sourceAsset.updated_at,
            targetUpdated: targetAsset.updated_at,
          };
        }
        return null; // Files are identical
      } catch (error) {
        console.error(`❌ Error comparing ${key}:`, error.message);
        console.error('   Full error:', error);
        // On error, assume files are different to be safe
        return {
          key,
          sourceSize: sourceAsset.size,
          targetSize: targetAsset.size,
          sourceUpdated: sourceAsset.updated_at,
          targetUpdated: targetAsset.updated_at,
          error: error.message,
        };
      }
    }
  );

  // Process content comparisons in batches to respect rate limits
  // Shopify limit: 2 calls per second, so we do 1 file at a time with 600ms delay
  const batchSize = 1;
  const modifiedFiles = [];

  for (let i = 0; i < contentComparisonPromises.length; i += batchSize) {
    const batch = contentComparisonPromises.slice(i, i + batchSize);
    const results = await Promise.all(batch);
    modifiedFiles.push(...results.filter((result) => result !== null));

    // Longer delay to respect rate limits (600ms = ~1.6 calls/sec, safely under 2/sec)
    if (i + batchSize < contentComparisonPromises.length) {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  differences.modified = modifiedFiles;
  console.log(`✅ Content comparison complete: ${modifiedFiles.length} files actually differ`);

  if (modifiedFiles.length > 0) {
    console.log('   Modified files:');
    modifiedFiles.forEach((f) => {
      console.log(`     - ${f.key}${f.error ? ' (error: ' + f.error + ')' : ''}`);
    });
  }

  // Check for deleted files (informational only)
  for (const [key, targetAsset] of targetMap) {
    if (!sourceMap.has(key)) {
      differences.deleted.push({
        key,
        size: targetAsset.size,
        updated_at: targetAsset.updated_at,
      });
    }
  }

  return {
    summary: {
      added: differences.added.length,
      modified: differences.modified.length,
      deleted: differences.deleted.length,
      total: differences.added.length + differences.modified.length,
    },
    differences,
  };
}

// Merge content changes from source theme to target theme
export async function mergeContentChanges(session, sourceThemeId, targetThemeId, filesToMerge) {
  const results = {
    success: [],
    failed: [],
  };

  // Process files in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < filesToMerge.length; i += batchSize) {
    const batch = filesToMerge.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map(async (fileKey) => {
        try {
          // Fetch content from source theme
          const sourceAsset = await fetchAssetContent(session, sourceThemeId, fileKey);

          if (!sourceAsset.value) {
            throw new Error('No content found in source asset');
          }

          // Handle JSON content merging intelligently
          let contentToMerge = sourceAsset.value;

          // For settings_data.json, we might want to merge more carefully
          if (fileKey === 'config/settings_data.json') {
            // Fetch target to see if we need intelligent merging
            const targetAsset = await fetchAssetContent(session, targetThemeId, fileKey);

            if (targetAsset.value) {
              const sourceData = JSON.parse(sourceAsset.value);
              const targetData = JSON.parse(targetAsset.value);

              // Merge: keep target's theme settings but update content sections
              const merged = {
                ...targetData,
                current: sourceData.current || targetData.current,
                sections: sourceData.sections || targetData.sections,
                content_for_index: sourceData.content_for_index || targetData.content_for_index,
              };

              contentToMerge = JSON.stringify(merged, null, 2);
            }
          }

          // Update target theme with source content
          await updateAsset(session, targetThemeId, fileKey, contentToMerge);

          return { fileKey, status: 'success' };
        } catch (error) {
          return { fileKey, status: 'failed', error: error.message };
        }
      })
    );

    // Categorize results
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.status === 'success') {
        results.success.push(result.value.fileKey);
      } else {
        const error = result.status === 'fulfilled' ? result.value.error : result.reason.message;
        results.failed.push({
          fileKey: result.value?.fileKey || 'unknown',
          error,
        });
      }
    });

    // Add a small delay between batches to respect rate limits
    if (i + batchSize < filesToMerge.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return {
    summary: {
      total: filesToMerge.length,
      successful: results.success.length,
      failed: results.failed.length,
    },
    results,
  };
}
