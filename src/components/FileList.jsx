import React from 'react';
import { ResourceList, ResourceItem, Badge, InlineStack, BlockStack, Text } from '@shopify/polaris';

export function FileList({ files, selectedFiles, onToggleFile }) {
  return (
    <ResourceList
      resourceName={{ singular: 'file', plural: 'files' }}
      items={files}
      renderItem={(item) => {
        const { key, status, size, updated_at } = item;
        const isSelected = selectedFiles.includes(key);

        return (
          <ResourceItem id={key} onClick={() => onToggleFile(key)} verticalAlignment="center">
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack align="start" blockAlign="center" gap="200">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleFile(key)}
                  onClick={(e) => e.stopPropagation()}
                />
                <BlockStack gap="100">
                  <Text fontWeight="medium">{key}</Text>
                  {updated_at && (
                    <Text variant="bodySm" tone="subdued">
                      Updated: {new Date(updated_at).toLocaleDateString()}
                    </Text>
                  )}
                </BlockStack>
              </InlineStack>
              <InlineStack align="end" gap="200">
                {size && (
                  <Text variant="bodySm" tone="subdued">
                    {(size / 1024).toFixed(1)} KB
                  </Text>
                )}
                <Badge status={status === 'added' ? 'success' : 'attention'}>{status}</Badge>
              </InlineStack>
            </InlineStack>
          </ResourceItem>
        );
      }}
    />
  );
}
