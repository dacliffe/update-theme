# Shopify Theme Content Merger

A Shopify app that allows you to merge content changes between themes without overwriting code. Perfect for workflows where you:

- Maintain a main theme connected to GitHub
- Create theme copies for content staging
- Need to merge content back to main without losing code changes

## Features

- 🔄 **Smart Content Merging**: Only merges JSON content files (settings, sections, templates)
- 🎯 **Selective Sync**: Choose exactly which files to merge
- 🔒 **Code-Safe**: Never touches your Liquid, CSS, or JavaScript files
- 📊 **Visual Comparison**: See all changes before merging
- ⚡ **Fast & Reliable**: Batch processing with rate limit handling

## What Gets Merged

The app specifically targets **content files only**:

- `config/settings_data.json` (with intelligent merging)
- Section JSON files (`sections/*.json`)
- Template JSON files (`templates/*.json`)

**Code files are never touched**, including:

- Liquid files (`.liquid`)
- CSS/SCSS files
- JavaScript files
- Assets (images, fonts, etc.)

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Shopify Partner account
- A development store or access to a Shopify store

### 1. Create a Shopify App

1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Click **Apps** → **Create App**
3. Choose **Custom App**
4. Fill in the app details:

   - **App name**: Theme Content Merger
   - **App URL**: Your app URL (use ngrok or Cloudflare Tunnel for local dev)
   - **Allowed redirection URL(s)**: `https://your-app-url.com/api/auth/callback`

5. In the **API credentials** section, note:

   - API key
   - API secret key

6. Set the **API scopes**:
   - `read_themes`
   - `write_themes`

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in your credentials:

```env
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SCOPES=read_themes,write_themes
HOST=https://your-app-url.com
PORT=3000
NODE_ENV=development
SESSION_SECRET=generate_a_random_string_here
```

### 4. Set Up Local Development Tunnel

For local development, you need to expose your local server. Choose one:

**Option A: Cloudflare Tunnel (Recommended)**

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Run tunnel
npm run tunnel
```

**Option B: ngrok**

```bash
# Install ngrok
brew install ngrok

# Run tunnel
ngrok http 3000
```

Use the provided URL as your `HOST` in `.env`.

### 5. Run the App

```bash
# Development mode (runs both server and client)
npm run dev

# Production mode
npm run build
npm start
```

The app will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### 6. Install on Your Store

1. Visit: `https://your-app-url.com/?shop=your-store.myshopify.com`
2. Click "Connect Store"
3. Approve the app permissions

## Usage Guide

### Step 1: Connect Your Store

- Enter your shop domain (e.g., `my-store.myshopify.com`)
- Click "Connect Store" and approve permissions

### Step 2: Select Themes

- **Source Theme**: The theme you want to copy content FROM (usually a staging/copy theme)
- **Target Theme**: The theme you want to copy content TO (usually your main theme)

### Step 3: Compare Themes

- Click "Compare Themes" to see all content differences
- The app will show:
  - **New Files**: Content files that exist in source but not in target
  - **Modified Files**: Content files that differ between themes
  - **Files Only in Target**: Informational only (not merged)

### Step 4: Select Files to Merge

- Review the list of changed files
- Select specific files to merge, or click "Select All"
- Use checkboxes to choose only what you need

### Step 5: Merge Content

- Click "Merge X Selected File(s)"
- Wait for the process to complete
- Check the success message for results

## Smart Merging for settings_data.json

The app uses intelligent merging for `config/settings_data.json`:

- Preserves theme settings from the target
- Updates content sections from the source
- Maintains structural integrity

## Best Practices

1. **Test First**: Always test merges on a non-live theme first
2. **Backup**: Theme files are backed up by Shopify, but consider additional backups
3. **Review Changes**: Always review the comparison before merging
4. **Small Batches**: Merge in small batches for easier troubleshooting
5. **Version Control**: Keep your main theme in GitHub for code changes

## Common Workflows

### Workflow 1: Content Staging to Main

1. Duplicate main theme → Create "Staging" theme
2. Make content changes in Staging theme
3. Use app to merge Staging → Main
4. Publish main theme

### Workflow 2: Multiple Content Editors

1. Create theme copies for each editor
2. Each editor makes their changes
3. Merge each copy to main theme one at a time
4. Review and publish

## Troubleshooting

### "Not authenticated" Error

- Ensure your app credentials are correct in `.env`
- Try reconnecting your store
- Check that your app has the correct scopes

### "Failed to merge themes" Error

- Check rate limits (Shopify API has rate limits)
- Try merging fewer files at once
- Verify file permissions

### Files Not Showing Up

- Only JSON content files are shown
- Code files (Liquid, CSS, JS) are intentionally excluded
- Ensure files exist in the source theme

## Production Deployment

### Deploy to Heroku

1. Create a Heroku app:

```bash
heroku create your-app-name
```

2. Set environment variables:

```bash
heroku config:set SHOPIFY_API_KEY=your_key
heroku config:set SHOPIFY_API_SECRET=your_secret
heroku config:set SCOPES=read_themes,write_themes
heroku config:set HOST=https://your-app-name.herokuapp.com
heroku config:set SESSION_SECRET=your_secret
```

3. Deploy:

```bash
git push heroku main
```

### Deploy to Railway/Render/Fly.io

Similar process - set environment variables in the platform's dashboard and deploy.

### Session Storage for Production

The app uses in-memory session storage for development. For production:

- Implement Redis or database-backed session storage
- Update `server/index.js` to use persistent storage
- Consider using Shopify's session storage libraries

## API Endpoints

### Authentication

- `GET /api/auth/shopify?shop={shop}` - Start OAuth flow
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/session?shop={shop}` - Check session

### Themes

- `GET /api/themes/list?shop={shop}` - List all themes
- `POST /api/themes/compare?shop={shop}` - Compare two themes
- `POST /api/themes/merge?shop={shop}` - Merge content between themes
- `GET /api/themes/:themeId/assets?shop={shop}` - Get theme assets

## Security Considerations

- **Session Management**: Use secure session storage in production
- **Rate Limiting**: Implement rate limiting on your endpoints
- **Input Validation**: Always validate shop domains
- **HTTPS Only**: Always use HTTPS in production
- **Scope Minimization**: Only request necessary API scopes

## Support & Contributing

This is a custom solution built for theme content management. Feel free to:

- Fork and modify for your needs
- Report issues or suggest improvements
- Adapt for your specific workflow

## License

MIT License - Feel free to use and modify as needed.

## Acknowledgments

Built with:

- [Shopify API Node](https://github.com/Shopify/shopify-api-node)
- [Express](https://expressjs.com/)
- [React](https://react.dev/)
- [Shopify Polaris](https://polaris.shopify.com/)
