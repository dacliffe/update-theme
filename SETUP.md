# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Your Shopify App

1. Go to https://partners.shopify.com/
2. Navigate to **Apps** → **Create App** → **Custom App**
3. Fill in:
   - **App name**: Theme Content Merger
   - **App URL**: `https://your-tunnel-url.com` (we'll get this in Step 3)
   - **Allowed redirection URL**: `https://your-tunnel-url.com/api/auth/callback`
4. Note your **API key** and **API secret**
5. Set scopes: `read_themes`, `write_themes`

### Step 3: Set Up Local Tunnel

Choose one option:

**Option A: Cloudflare Tunnel (Free, Recommended)**

```bash
# Install once
brew install cloudflare/cloudflare/cloudflared

# Run in a new terminal (keep this running)
cloudflared tunnel --url http://localhost:3000
```

**Option B: ngrok (Requires Account)**

```bash
# Install once
brew install ngrok

# Run in a new terminal
ngrok http 3000
```

Copy the HTTPS URL provided (e.g., `https://abc123.cloudflared.com`)

### Step 4: Configure Environment

1. Open `.env` file
2. Update these values:

```env
SHOPIFY_API_KEY=your_api_key_from_step_2
SHOPIFY_API_SECRET=your_api_secret_from_step_2
HOST=https://your_tunnel_url_from_step_3
SESSION_SECRET=any_random_string_here
```

### Step 5: Update Shopify App URLs

Go back to your Shopify Partner dashboard and update:

- **App URL**: Your tunnel URL from Step 3
- **Allowed redirection URL**: `[your-tunnel-url]/api/auth/callback`

### Step 6: Run the App

```bash
npm run dev
```

The app will start on:

- Frontend: http://localhost:5173 (development)
- Backend: http://localhost:3000

### Step 7: Test the App

1. Visit: `[your-tunnel-url]/?shop=your-store.myshopify.com`
2. Click "Connect Store"
3. Approve permissions
4. Start merging themes!

## 🎯 First Time Usage

1. **Select Source Theme**: Choose the theme with new content (e.g., a staging copy)
2. **Select Target Theme**: Choose where to merge content (e.g., your main theme)
3. **Click "Compare Themes"**: See all content differences
4. **Select Files**: Choose which content files to merge
5. **Click "Merge"**: Content is copied from source to target

## ⚠️ Important Notes

- **Content Only**: This app only merges JSON content files (settings, sections, templates)
- **Code is Safe**: Your Liquid, CSS, and JavaScript files are never touched
- **Test First**: Always test on a non-live theme first
- **Backups**: Shopify keeps version history, but be careful with live themes

## 🐛 Troubleshooting

**"Not authenticated" error**

- Check your API credentials in `.env`
- Make sure your tunnel is running
- Verify the HOST in `.env` matches your tunnel URL

**Can't connect to store**

- Ensure tunnel URL is HTTPS
- Check that redirect URL in Shopify app matches exactly
- Try reconnecting your store

**No themes showing**

- Verify you approved `read_themes` permission
- Check browser console for errors
- Refresh the page

## 📚 Need More Help?

See the full `README.md` for:

- Detailed API documentation
- Production deployment guides
- Advanced usage examples
- Security best practices



