# Complete Production Setup Guide

This guide will walk you through the **complete process** of setting up your Theme Content Merger app from scratch to production, including:

1. Creating the Shopify app in Partners dashboard
2. Deploying to Render
3. Installing the app on a client's store

**Estimated time**: 30-45 minutes

---

## Part 1: Create Your Shopify App

### Step 1.1: Access Shopify Partners Dashboard

1. Go to https://partners.shopify.com/
2. Log in with your Partner account (or create one if you don't have it)
3. If you don't have a Partner account, click **"Join Now"** and complete the signup

### Step 1.2: Create a New App

1. In the Partners dashboard, click **"Apps"** in the left sidebar
2. Click the **"Create app"** button (top right)
3. Select **"Create app manually"**

### Step 1.3: Configure Basic App Settings

Fill in the following details:

- **App name**: `Theme Content Merger` (or your preferred name)
- **App URL**: Leave blank for now (we'll update this after deploying to Render)
- **Allowed redirection URL(s)**: Leave blank for now

**Important**: Under "App setup", make sure:

- **Distribution**: Custom app (for specific stores)
- **App loading**: Standalone (not embedded - opens in new window/tab)

Click **"Create app"**

### Step 1.4: Get Your API Credentials

1. Once the app is created, you'll see the **Configuration** tab
2. Scroll to **"Client credentials"** section
3. **IMPORTANT**: Copy and save these somewhere safe:

   - **Client ID** (this is your `SHOPIFY_API_KEY`)
   - **Client secret** (this is your `SHOPIFY_API_SECRET`)

   ⚠️ You won't be able to see the Client secret again, so save it now!

### Step 1.5: Configure API Scopes

1. Scroll down to **"Admin API access scopes"**
2. Search for and enable these scopes:

   - ✅ `read_themes` - View themes
   - ✅ `write_themes` - Modify themes

3. Click **"Save"** at the bottom

**✅ Part 1 Complete!** Keep your credentials handy for Part 2.

---

## Part 2: Deploy to Render

### Step 2.1: Prepare Your Code Repository

Your code needs to be in a Git repository (GitHub, GitLab, or Bitbucket).

**If using GitHub:**

1. Go to https://github.com/new
2. Create a new repository (e.g., `theme-content-merger`)
3. On your local machine, in your project folder:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit"

# Add your GitHub repo as remote (replace with your username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/theme-content-merger.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2.2: Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up using your GitHub account (recommended for easier deployment)

### Step 2.3: Create a New Web Service

1. In Render dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Authorize Render to access your GitHub repositories
5. Find and select your `theme-content-merger` repository
6. Click **"Connect"**

### Step 2.4: Configure Your Web Service

Fill in these settings:

**Basic Settings:**

- **Name**: `theme-content-merger` (or your preferred name)
- **Region**: Choose closest to your location
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Environment**: `Node`
- **Build Command**:
  ```
  npm install && npm run build
  ```
- **Start Command**:
  ```
  npm start
  ```

**Instance Type:**

- Select **"Free"** (for testing) or **"Starter"** ($7/month - recommended for production)

### Step 2.5: Add Environment Variables

Scroll down to the **"Environment Variables"** section and click **"Add Environment Variable"**.

Add each of these (click "Add Environment Variable" for each one):

| Key                  | Value                            | Notes                      |
| -------------------- | -------------------------------- | -------------------------- |
| `SHOPIFY_API_KEY`    | Your Client ID from Step 1.4     | Paste the exact value      |
| `SHOPIFY_API_SECRET` | Your Client secret from Step 1.4 | Paste the exact value      |
| `SCOPES`             | `read_themes,write_themes`       | Type exactly as shown      |
| `NODE_ENV`           | `production`                     | Type exactly as shown      |
| `SESSION_SECRET`     | Generate a random string         | See note below ⬇️          |
| `HOST`               | Leave blank for now              | We'll add this in Step 2.7 |

**To generate SESSION_SECRET:**

Open your terminal and run:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `SESSION_SECRET`.

### Step 2.6: Deploy Your App

1. Click **"Create Web Service"** at the bottom
2. Render will start building and deploying your app
3. Wait for the deployment to complete (5-10 minutes)
4. Look for **"Your service is live 🎉"** message

### Step 2.7: Get Your App URL

1. Once deployed, you'll see your app URL at the top of the page
2. Your URL is: `https://update-theme.onrender.com`
3. **Copy this URL** - you'll need it for the next steps

### Step 2.8: Update HOST Environment Variable

1. In Render dashboard, go to **"Environment"** tab (left sidebar)
2. Find the `HOST` variable
3. Click **"Edit"** and paste your Render URL (from Step 2.7)
4. Value: `https://update-theme.onrender.com`
5. Click **"Save Changes"**
6. Render will automatically redeploy

**✅ Part 2 Complete!** Your app is now live on Render.

---

## Part 3: Update Shopify App Settings

### Step 3.1: Configure App URLs

1. Go back to https://partners.shopify.com/
2. Navigate to **Apps** → Select your **Theme Content Merger** app
3. Click **"Configuration"** tab
4. Scroll to **"App URL"** section

Fill in:

- **App URL**: `https://update-theme.onrender.com`

  ⚠️ **Important**: This is for when users access your app from Shopify admin. Since this is a standalone app, you may want to leave this blank or use the base URL.

- **Allowed redirection URL(s)**: `https://update-theme.onrender.com/api/auth/callback`

  ⚠️ **Critical**: This MUST match exactly including the path

5. Click **"Save and release"** at the bottom

### Step 3.2: Verify App Status

1. In the Configuration tab, check that:
   - ✅ App URL is set
   - ✅ Redirect URL is set
   - ✅ API scopes are enabled (read_themes, write_themes)
   - ✅ App status shows as "Active"

**✅ Part 3 Complete!** Your Shopify app is now configured.

---

## Part 4: Install on Client's Store

### Step 4.1: Get the Installation URL

Your installation URL format is:

```
https://update-theme.onrender.com/?shop=CLIENT_STORE.myshopify.com
```

Replace `CLIENT_STORE` with your client's actual store name.

**Example for a store called "acme-store":**

```
https://update-theme.onrender.com/?shop=acme-store.myshopify.com
```

### Step 4.2: Send Installation Link to Client

**Option A: You install it yourself (if you have access)**

1. Visit the installation URL in your browser
2. Continue to Step 4.3

**Option B: Client installs it (if they have admin access)**

Send your client this message:

```
Hi [Client Name],

I've created a custom app to help manage theme content.
To install it:

1. Click this link: [YOUR_INSTALLATION_URL]
2. Log in to your Shopify admin if prompted
3. Review the permissions (read and write themes)
4. Click "Install"

The app will help us merge content between themes safely.
Let me know if you have any questions!
```

### Step 4.3: Complete Installation

1. When you/client visits the installation URL, you'll see the Shopify OAuth screen
2. The screen will show:

   - App name: "Theme Content Merger"
   - Required permissions: "Read themes" and "Write themes"
   - Your store name

3. Click **"Install"** (or "Install app")
4. You'll be redirected to the app interface

### Step 4.4: Verify Installation

After installation, you should see:

- The app loads successfully
- A list of available themes appears
- You can select themes and compare them

**✅ Part 4 Complete!** The app is now installed and ready to use.

---

## Using the App

Now that everything is set up, here's how to use it:

### Step 1: Select Themes

1. **Source Theme**: Select the theme you want to copy content FROM
   - Usually a staging/development copy with new content
2. **Target Theme**: Select the theme you want to copy content TO
   - Usually your main/live theme

### Step 2: Compare Themes

1. Click **"Compare Themes"** button
2. Wait for the comparison to complete
3. Review the differences:
   - **New files**: Files in source but not in target
   - **Modified files**: Files that differ between themes
   - **Files only in target**: Reference only (not merged)

### Step 3: Select Files to Merge

1. Review the list of changed files
2. Check the boxes next to files you want to merge
3. Or click **"Select All"** to merge everything

### Step 4: Merge Content

1. Click **"Merge X Selected File(s)"** button
2. Wait for the merge to complete
3. Check the success message
4. Verify changes in your Shopify admin

---

## Testing Your Setup

### Test 1: Check App is Running

Visit your Render URL directly:

```
https://update-theme.onrender.com
```

You should see a redirect or the app interface.

### Test 2: Check OAuth Flow

Visit with a shop parameter:

```
https://update-theme.onrender.com/?shop=your-store.myshopify.com
```

You should see the Shopify login/permission screen.

### Test 3: Complete a Test Merge

1. Create a test/duplicate theme
2. Make a small content change
3. Use the app to merge that change to another theme
4. Verify the change was applied

---

## Troubleshooting

### "App not found" Error

**Problem**: When visiting the app URL, you see "App not found"

**Solutions**:

- Check that your Render service is running (green status in dashboard)
- Verify the `HOST` environment variable matches your Render URL exactly
- Check Render logs for errors: Dashboard → Logs tab

### "Invalid OAuth request" Error

**Problem**: OAuth flow fails with an error

**Solutions**:

- Verify `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` are correct
- Check that redirect URL in Shopify Partners matches exactly: `https://your-url.onrender.com/api/auth/callback`
- Ensure no trailing slashes in URLs

### "Not authenticated" Error

**Problem**: After installing, the app shows "Not authenticated"

**Solutions**:

- Clear browser cookies and try again
- Verify API scopes are set correctly in Partners dashboard
- Check that `SESSION_SECRET` is set in Render environment variables
- Try reinstalling the app

### App Loads Slowly

**Problem**: The app takes a long time to load

**Solutions**:

- Render free tier spins down after inactivity (takes ~30 seconds to wake up)
- Consider upgrading to Starter plan ($7/month) for always-on service
- First load after inactivity will always be slower

### "Failed to merge themes" Error

**Problem**: Merge operation fails

**Solutions**:

- Check Shopify API rate limits (wait a few minutes and try again)
- Try merging fewer files at once
- Check Render logs for specific error messages
- Verify the target theme is not locked or published

### "Cannot GET /" or "admin.shopify.com refused to connect"

**Problem**: App shows errors when accessed from Shopify admin or via installation link

**Solution**:

This app is designed as a **standalone app** (not embedded). This means:

1. **Don't access it from Shopify admin Apps menu** - it won't work there
2. **Use the direct installation URL** instead:
   ```
   https://update-theme.onrender.com/?shop=CLIENT_STORE.myshopify.com
   ```
3. The app will open in a new window/tab (not inside Shopify admin)

**To Fix Shopify Partners Configuration:**

1. Go to Partners dashboard → Your App → Configuration
2. **App URL**: Can leave blank or set to `https://update-theme.onrender.com`
3. **Allowed redirection URL(s)**: MUST be `https://update-theme.onrender.com/api/auth/callback`
4. **Distribution**: Custom app
5. **App loading**: Should be "Standalone" (not embedded)
6. Click **"Save and release"**

**Other causes**:

- The server isn't serving static files in production mode
- Check that `NODE_ENV=production` is set in environment variables
- Verify the build created a `dist` folder with your frontend files

### "vite: not found" Build Error

**Problem**: Build fails with "sh: vite: not found"

**Solution**:

- This means `vite` is in `devDependencies` instead of `dependencies`
- Render doesn't install dev dependencies in production builds
- Move `vite` and `@vitejs/plugin-react` to `dependencies` in `package.json`
- Commit and push the change to trigger a new deployment

### Check Render Logs

To see detailed error messages:

1. Go to Render dashboard
2. Select your web service
3. Click **"Logs"** tab (left sidebar)
4. Look for red error messages
5. Copy any error messages for debugging

---

## Maintenance & Updates

### Updating the App

When you make changes to your code:

```bash
# Commit your changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

Render will automatically detect the push and redeploy your app (usually takes 5-10 minutes).

### Monitoring

**In Render Dashboard:**

- Monitor uptime and performance in **"Metrics"** tab
- Check for errors in **"Logs"** tab
- View deployment history in **"Events"** tab

**In Shopify:**

- Check API rate limit usage in Partners dashboard under your app

### Upgrading for Production

For serious production use, consider:

1. **Upgrade Render Plan**: Move from Free to Starter ($7/month) or higher
2. **Add Redis**: For persistent session storage
3. **Add Monitoring**: Set up error tracking (Sentry, etc.)
4. **Custom Domain**: Add your own domain name
5. **Backups**: Set up automated backups if using database

---

## Security Checklist

Before going live with clients:

- [ ] All environment variables are set correctly
- [ ] `SESSION_SECRET` is a strong random string
- [ ] `NODE_ENV` is set to `production`
- [ ] Shopify app URLs are using HTTPS
- [ ] API scopes are limited to only what's needed (read_themes, write_themes)
- [ ] Tested on a development store first
- [ ] Render service is on a paid plan (if handling multiple clients)

---

## Cost Breakdown

**Development (Free)**

- Shopify Partner account: Free
- Development store: Free
- Render Free tier: Free
- **Total**: $0/month

**Production (Recommended)**

- Shopify Partner account: Free
- Render Starter: $7/month
- (Optional) Custom domain: ~$12/year
- (Optional) Redis for sessions: ~$10/month
- **Total**: ~$7-20/month

---

## Next Steps

Now that your app is set up and running:

1. **Test thoroughly** on a development store
2. **Document your workflow** for team members
3. **Create backups** before using on live themes
4. **Monitor performance** in the first few days
5. **Gather feedback** from users

---

## Support

If you run into issues:

1. Check the **Troubleshooting** section above
2. Review **Render logs** for error messages
3. Check **Shopify API status**: https://status.shopify.com
4. Review the full documentation in `README.md` and `DEPLOYMENT.md`

---

## Quick Reference

**Important URLs:**

- Shopify Partners: https://partners.shopify.com/
- Render Dashboard: https://dashboard.render.com/
- Your App URL (for Shopify config): `https://update-theme.onrender.com` (optional for standalone apps)
- Installation URL: `https://update-theme.onrender.com/?shop=STORE.myshopify.com`
- OAuth Callback URL: `https://update-theme.onrender.com/api/auth/callback` (MUST be exact)

**Important Files:**

- `SETUP.md` - Local development setup
- `README.md` - App documentation and usage
- `DEPLOYMENT.md` - Detailed deployment options
- `WORKFLOW.md` - Common workflows and examples

**Environment Variables:**

```
SHOPIFY_API_KEY=your_client_id
SHOPIFY_API_SECRET=your_client_secret
SCOPES=read_themes,write_themes
HOST=https://update-theme.onrender.com
NODE_ENV=production
SESSION_SECRET=your_random_secret
```

---

**Congratulations! Your Theme Content Merger app is now live and ready to use! 🎉**
