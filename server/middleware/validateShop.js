import { shopify } from '../index.js';

// Middleware to validate and sanitize shop parameter
export function validateShop(req, res, next) {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' });
  }

  try {
    const sanitizedShop = shopify.utils.sanitizeShop(shop, true);

    if (!sanitizedShop) {
      return res.status(400).json({ error: 'Invalid shop domain' });
    }

    // Add sanitized shop to request
    req.sanitizedShop = sanitizedShop;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid shop domain format' });
  }
}



