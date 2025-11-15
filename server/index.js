import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { createProxyMiddleware } from 'http-proxy-middleware';
import themeRoutes from './routes/theme.js';
import authRoutes from './routes/auth.js';

// ES Module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Shopify API
export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(','),
  hostName: process.env.HOST.replace(/https?:\/\//, ''),
  hostScheme: 'https',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true, // Embedded app for loading in Shopify admin
});

// Log configuration (without secrets)
console.log('🔧 Shopify API Configuration:');
console.log('   Host:', process.env.HOST);
console.log('   Hostname:', process.env.HOST.replace(/https?:\/\//, ''));
console.log('   Scopes:', process.env.SCOPES);
console.log('   API Version:', LATEST_API_VERSION);

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Store sessions in memory (use a database for production)
export const sessionStorage = new Map();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/themes', themeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle Shopify app installation/access
// This catches requests from Shopify admin when app is clicked
app.get('/shopify', (req, res) => {
  const { shop, host } = req.query;
  
  if (!shop) {
    return res.status(400).send('Missing shop parameter. Please install this app from your Shopify admin.');
  }
  
  // Redirect to OAuth flow
  res.redirect(`/api/auth/shopify?shop=${shop}${host ? `&host=${host}` : ''}`);
});

// In development, proxy non-API requests to Vite dev server
if (process.env.NODE_ENV !== 'production') {
  console.log('📦 Development mode: Proxying to Vite dev server on port 5173');

  // Create proxy middleware ONCE (not on every request)
  const viteProxy = createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    ws: true, // proxy websockets for HMR
    logLevel: 'silent', // reduce noise in logs
  });

  app.use('/', (req, res, next) => {
    // Don't proxy API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }

    // Use the pre-created proxy middleware
    viteProxy(req, res, next);
  });
} else {
  // In production, serve static files from dist folder
  console.log('🏭 Production mode: Serving static files from dist/');
  
  const distPath = path.join(__dirname, '..', 'dist');
  
  // Serve static files
  app.use(express.static(distPath));
  
  // Handle client-side routing - send all non-API requests to index.html
  app.get('*', (req, res, next) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Inject API key into HTML for App Bridge
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Theme Content Merger</title>
    <script>
      window.ENV = {
        SHOPIFY_API_KEY: '${process.env.SHOPIFY_API_KEY}'
      };
    </script>
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
</head>
<body>
    <div id="root"></div>
</body>
</html>
    `.trim();
    
    res.send(html);
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});
