import { useState, useCallback } from 'react';

export function useShopify(shop) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(
    async (endpoint, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}shop=${shop}`;
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...options,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Request failed with status ${response.status}`);
        }

        setLoading(false);
        return data;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        throw err;
      }
    },
    [shop]
  );

  return { apiCall, loading, error };
}



