import React, { useMemo } from 'react';
import { Provider } from '@shopify/app-bridge-react';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';

export function AppBridgeProvider({ children }) {
  // Get config from URL params
  const config = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const host = params.get('host');
    const shop = params.get('shop');

    // API key should come from environment or be hardcoded
    // For embedded apps, we need to use the Shopify API key
    const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY || window.ENV?.SHOPIFY_API_KEY;

    if (!apiKey) {
      console.warn('No API key found for App Bridge');
    }

    return {
      apiKey: apiKey || '', // This will be injected from server
      host: host || window.btoa(`${shop}/admin`) || '',
      forceRedirect: true,
    };
  }, []);

  return (
    <Provider config={config}>
      <AppProvider i18n={enTranslations}>{children}</AppProvider>
    </Provider>
  );
}

