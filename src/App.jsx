import React, { useState, useCallback, useEffect } from 'react';
import {
  Page,
  Card,
  Layout,
  Select,
  Button,
  Banner,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  BlockStack,
  InlineStack,
  Spinner,
  Frame,
  Toast,
  EmptyState,
} from '@shopify/polaris';

function App() {
  const [shop, setShop] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [themes, setThemes] = useState([]);
  const [sourceTheme, setSourceTheme] = useState('');
  const [targetTheme, setTargetTheme] = useState('');
  const [comparison, setComparison] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);
  const [viewingDiff, setViewingDiff] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  // Get shop from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopParam = params.get('shop');
    if (shopParam) {
      setShop(shopParam);
      checkAuthentication(shopParam);
    }
  }, []);

  const checkAuthentication = async (shopName) => {
    try {
      console.log('Checking authentication for:', shopName);
      const response = await fetch(`/api/auth/session?shop=${shopName}`);
      console.log('Session check response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Session data:', data);
        setIsAuthenticated(true);
        fetchThemes(shopName);
      } else {
        const error = await response.json();
        console.error('Not authenticated:', error);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    }
  };

  const handleAuthenticate = () => {
    if (!shop) {
      showToast('Please enter your shop domain', true);
      return;
    }
    window.location.href = `/api/auth/shopify?shop=${shop}`;
  };

  const fetchThemes = async (shopName) => {
    setLoading(true);
    try {
      console.log('Fetching themes for:', shopName);
      const response = await fetch(`/api/themes/list?shop=${shopName}`);
      console.log('Themes response:', response.status);
      const data = await response.json();
      console.log('Themes data:', data);

      if (response.ok) {
        setThemes(data.themes);
      } else {
        console.error('Failed to fetch themes:', data);
        showToast(data.error || 'Failed to fetch themes', true);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
      showToast('Error fetching themes', true);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!sourceTheme || !targetTheme) {
      showToast('Please select both source and target themes', true);
      return;
    }

    if (sourceTheme === targetTheme) {
      showToast('Source and target themes cannot be the same', true);
      return;
    }

    setLoading(true);
    setComparison(null);
    setSelectedFiles([]);

    try {
      const response = await fetch(`/api/themes/compare?shop=${shop}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceThemeId: sourceTheme,
          targetThemeId: targetTheme,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setComparison(data);
        showToast(`Found ${data.summary.total} content changes`);
      } else {
        showToast(data.error || 'Failed to compare themes', true);
      }
    } catch (error) {
      showToast('Error comparing themes', true);
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (selectedFiles.length === 0) {
      showToast('Please select files to merge', true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/themes/merge?shop=${shop}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceThemeId: sourceTheme,
          targetThemeId: targetTheme,
          filesToMerge: selectedFiles,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast(`Successfully merged ${data.summary.successful} of ${data.summary.total} files`);
        // Refresh comparison
        handleCompare();
      } else {
        showToast(data.error || 'Failed to merge themes', true);
      }
    } catch (error) {
      showToast('Error merging themes', true);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastActive(true);
  };

  const toggleFileSelection = (fileKey) => {
    setSelectedFiles((prev) =>
      prev.includes(fileKey) ? prev.filter((key) => key !== fileKey) : [...prev, fileKey]
    );
  };

  const selectAllFiles = () => {
    if (!comparison) return;
    const allFiles = [
      ...comparison.differences.added.map((f) => f.key),
      ...comparison.differences.modified.map((f) => f.key),
    ];
    setSelectedFiles(allFiles);
  };

  const deselectAllFiles = () => {
    setSelectedFiles([]);
  };

  const viewFileDiff = async (fileKey) => {
    setViewingDiff(fileKey);
    setLoadingDiff(true);
    setDiffData(null);

    try {
      const response = await fetch(`/api/themes/diff?shop=${shop}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceThemeId: sourceTheme,
          targetThemeId: targetTheme,
          fileKey,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setDiffData(data);
      } else {
        showToast(data.error || 'Failed to load diff', true);
        setViewingDiff(null);
      }
    } catch (error) {
      showToast('Error loading diff', true);
      setViewingDiff(null);
    } finally {
      setLoadingDiff(false);
    }
  };

  const closeDiffView = () => {
    setViewingDiff(null);
    setDiffData(null);
  };

  // Generate line-by-line diff with highlighting
  const generateLineDiff = (source, target) => {
    const sourceLines = source.split('\n');
    const targetLines = target.split('\n');

    const maxLines = Math.max(sourceLines.length, targetLines.length);
    const diffs = [];

    for (let i = 0; i < maxLines; i++) {
      const sourceLine = sourceLines[i] || '';
      const targetLine = targetLines[i] || '';

      let status = 'same';
      if (sourceLine !== targetLine) {
        if (!sourceLine) status = 'added';
        else if (!targetLine) status = 'removed';
        else status = 'changed';
      }

      diffs.push({
        lineNum: i + 1,
        sourceLine,
        targetLine,
        status,
      });
    }

    return diffs;
  };

  const themeOptions = themes.map((theme) => ({
    label: `${theme.name}${theme.role === 'main' ? ' (Live)' : ''}`,
    value: theme.id.toString(),
  }));

  const toast = toastActive ? (
    <Toast content={toastMessage} onDismiss={() => setToastActive(false)} error={toastError} />
  ) : null;

  if (!isAuthenticated) {
    return (
      <Frame>
        <Page title="Shopify Theme Merger">
          <div style={{ paddingBottom: '40px' }}>
            <Layout>
            <Layout.Section>
              <Card sectioned>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Connect Your Shopify Store
                  </Text>
                  <Text>Enter your shop domain to authenticate and start merging themes.</Text>
                  <input
                    type="text"
                    placeholder="your-store.myshopify.com"
                    value={shop}
                    onChange={(e) => setShop(e.target.value)}
                    style={{
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '14px',
                    }}
                  />
                  <Button primary onClick={handleAuthenticate}>
                    Connect Store
                  </Button>
                </BlockStack>
              </Card>
            </Layout.Section>
            </Layout>
          </div>
        </Page>
      </Frame>
    );
  }

  return (
    <Frame>
      <Page title="Theme Content Merger" subtitle={`Connected to: ${shop}`}>
        <div style={{ paddingBottom: '40px' }}>
          <Layout>
            <Layout.Section>
              <Banner status="info">
                <p>
                  This tool merges <strong>content changes only</strong> (JSON files) between
                  themes. Code changes (Liquid, CSS, JS) are not merged. Use this to pull content
                  from staging/draft themes into your main theme without overwriting code.
                </p>
              </Banner>
            </Layout.Section>

            <Layout.Section>
              <Card sectioned>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Select Themes
                  </Text>

                  <Select
                    label="Source Theme (copy content FROM)"
                    options={[{ label: 'Select a theme...', value: '' }, ...themeOptions]}
                    value={sourceTheme}
                    onChange={setSourceTheme}
                  />

                  <Select
                    label="Target Theme (copy content TO)"
                    options={[{ label: 'Select a theme...', value: '' }, ...themeOptions]}
                    value={targetTheme}
                    onChange={setTargetTheme}
                  />

                  <Button
                    primary
                    onClick={handleCompare}
                    loading={loading}
                    disabled={!sourceTheme || !targetTheme}
                  >
                    Compare Themes
                  </Button>
                </BlockStack>
              </Card>
            </Layout.Section>

            {loading && !comparison && (
              <Layout.Section>
                <Card sectioned>
                  <InlineStack align="center" blockAlign="center" gap="400">
                    <Spinner size="large" />
                    <Text>Comparing themes...</Text>
                  </InlineStack>
                </Card>
              </Layout.Section>
            )}

            {comparison && (
              <>
                <Layout.Section>
                  <Card sectioned>
                    <BlockStack gap="400">
                      <Text variant="headingMd" as="h2">
                        Comparison Results
                      </Text>
                      <InlineStack gap="200">
                        <Badge status="success">{comparison.summary.added} New Files</Badge>
                        <Badge status="attention">
                          {comparison.summary.modified} Modified Files
                        </Badge>
                        <Badge>{comparison.summary.deleted} Files Only in Target</Badge>
                      </InlineStack>

                      {comparison.summary.total > 0 && (
                        <InlineStack gap="200">
                          <Button onClick={selectAllFiles} size="slim">
                            Select All
                          </Button>
                          <Button onClick={deselectAllFiles} size="slim">
                            Deselect All
                          </Button>
                          <Button
                            primary
                            onClick={handleMerge}
                            loading={loading}
                            disabled={selectedFiles.length === 0}
                          >
                            Merge {selectedFiles.length} Selected File(s)
                          </Button>
                        </InlineStack>
                      )}
                    </BlockStack>
                  </Card>
                </Layout.Section>

                {comparison.summary.total > 0 ? (
                  <Layout.Section>
                    <Card>
                      <ResourceList
                        resourceName={{ singular: 'file', plural: 'files' }}
                        items={[
                          ...comparison.differences.added.map((f) => ({
                            ...f,
                            status: 'added',
                          })),
                          ...comparison.differences.modified.map((f) => ({
                            ...f,
                            status: 'modified',
                          })),
                        ]}
                        renderItem={(item) => {
                          const { key, status } = item;
                          const isSelected = selectedFiles.includes(key);

                          return (
                            <ResourceItem id={key} verticalAlignment="center">
                              <InlineStack align="space-between" blockAlign="center">
                                <InlineStack align="start" blockAlign="center" gap="200">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      toggleFileSelection(key);
                                    }}
                                  />
                                  <div
                                    onClick={() => toggleFileSelection(key)}
                                    style={{ cursor: 'pointer', flex: 1 }}
                                  >
                                    <Text fontWeight="medium">{key}</Text>
                                  </div>
                                </InlineStack>
                                <InlineStack gap="200">
                                  {status === 'modified' && (
                                    <Button
                                      size="slim"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        viewFileDiff(key);
                                      }}
                                    >
                                      View Diff
                                    </Button>
                                  )}
                                  <Badge status={status === 'added' ? 'success' : 'attention'}>
                                    {status}
                                  </Badge>
                                </InlineStack>
                              </InlineStack>
                            </ResourceItem>
                          );
                        }}
                      />
                    </Card>
                  </Layout.Section>
                ) : (
                  <Layout.Section>
                    <Card sectioned>
                      <EmptyState
                        heading="No content changes found"
                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                      >
                        <p>The selected themes have identical content files.</p>
                      </EmptyState>
                    </Card>
                  </Layout.Section>
                )}
              </>
            )}

            {/* Diff View Modal */}
            {viewingDiff && (
              <Layout.Section>
                <Card>
                  <div style={{ padding: '20px' }}>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text variant="headingMd" as="h3">
                        Comparing: {viewingDiff}
                      </Text>
                      <Button onClick={closeDiffView}>Close</Button>
                    </InlineStack>

                    {loadingDiff && (
                      <div style={{ padding: '40px', textAlign: 'center' }}>
                        <Spinner size="large" />
                        <Text>Loading differences...</Text>
                      </div>
                    )}

                    {diffData && !loadingDiff && (
                      <div style={{ marginTop: '20px' }}>
                        {diffData.areEqual ? (
                          <Banner status="success">
                            <p>Files are identical!</p>
                          </Banner>
                        ) : (
                          <>
                            <Banner status="info">
                              <p>
                                <strong>🟢 Green</strong> = additions/changes in source,{' '}
                                <strong>🔴 Red</strong> = deletions/different in target
                              </p>
                            </Banner>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1px',
                                marginTop: '15px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                background: '#ddd',
                              }}
                            >
                              <div style={{ background: '#f6f6f7', padding: '10px' }}>
                                <Text variant="headingSm" as="h4">
                                  Source Theme (FROM) ← Copy FROM here
                                </Text>
                              </div>
                              <div style={{ background: '#f6f6f7', padding: '10px' }}>
                                <Text variant="headingSm" as="h4">
                                  Target Theme (TO) → Copy TO here
                                </Text>
                              </div>
                            </div>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1px',
                                background: '#ddd',
                                maxHeight: '600px',
                                overflow: 'auto',
                                border: '1px solid #ddd',
                                borderTop: 'none',
                              }}
                            >
                              <div style={{ background: 'white' }}>
                                <pre
                                  style={{
                                    margin: 0,
                                    padding: '15px',
                                    fontSize: '12px',
                                    lineHeight: '1.6',
                                    fontFamily: 'Monaco, Menlo, monospace',
                                  }}
                                >
                                  {generateLineDiff(diffData.source, diffData.target).map(
                                    (line, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          background:
                                            line.status === 'changed' || line.status === 'added'
                                              ? '#d4f4dd'
                                              : line.status === 'removed'
                                              ? '#ffd4d4'
                                              : 'transparent',
                                          padding: '2px 5px',
                                          borderLeft:
                                            line.status === 'changed' || line.status === 'added'
                                              ? '3px solid #22c55e'
                                              : line.status === 'removed'
                                              ? '3px solid #ef4444'
                                              : '3px solid transparent',
                                        }}
                                      >
                                        <span
                                          style={{
                                            display: 'inline-block',
                                            width: '40px',
                                            color: '#999',
                                            userSelect: 'none',
                                          }}
                                        >
                                          {line.lineNum}
                                        </span>
                                        {line.sourceLine || ' '}
                                      </div>
                                    )
                                  )}
                                </pre>
                              </div>
                              <div style={{ background: 'white' }}>
                                <pre
                                  style={{
                                    margin: 0,
                                    padding: '15px',
                                    fontSize: '12px',
                                    lineHeight: '1.6',
                                    fontFamily: 'Monaco, Menlo, monospace',
                                  }}
                                >
                                  {generateLineDiff(diffData.source, diffData.target).map(
                                    (line, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          background:
                                            line.status === 'changed' || line.status === 'removed'
                                              ? '#ffd4d4'
                                              : line.status === 'added'
                                              ? '#d4f4dd'
                                              : 'transparent',
                                          padding: '2px 5px',
                                          borderLeft:
                                            line.status === 'changed' || line.status === 'removed'
                                              ? '3px solid #ef4444'
                                              : line.status === 'added'
                                              ? '3px solid #22c55e'
                                              : '3px solid transparent',
                                        }}
                                      >
                                        <span
                                          style={{
                                            display: 'inline-block',
                                            width: '40px',
                                            color: '#999',
                                            userSelect: 'none',
                                          }}
                                        >
                                          {line.lineNum}
                                        </span>
                                        {line.targetLine || ' '}
                                      </div>
                                    )
                                  )}
                                </pre>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </Layout.Section>
            )}
          </Layout>
        </div>
        {toast}
      </Page>
    </Frame>
  );
}

export default App;
