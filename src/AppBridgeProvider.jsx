import React from 'react';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';

export function AppBridgeProvider({ children }) {
  // Get config from URL params for embedded app
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host');
  
  // For embedded apps, configure AppProvider with host
  const config = host ? { host } : {};

  return (
    <AppProvider i18n={enTranslations} {...config}>
      {children}
    </AppProvider>
  );
}

