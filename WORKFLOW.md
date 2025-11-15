# Workflow Guide

## The Problem This App Solves

Your clients currently face this challenge:

```
Main Theme (Live)           Copy Theme (Staging)
    ↓                              ↓
Connected to GitHub         Client makes content changes
    ↓                              ↓
Code changes via GitHub     Content stuck in copy theme
    ↓                              ↓
Needs manual merge    ←→    OR publish copy theme directly
    ↓                              ↓
Wait for developer          Lose GitHub code changes
```

## The Solution

With this app:

```
Main Theme (Live)           Copy Theme (Staging)
    ↓                              ↓
Connected to GitHub         Client makes content changes
    ↓                              ↓
Code changes via GitHub     Use Theme Merger App
    ↓                              ↓
                    App merges content only
                              ↓
            Main theme gets content updates
                              ↓
            Code changes preserved!
```

## Typical Workflow

### Scenario 1: Single Content Update

```
Day 1: Client duplicates main theme → "Spring Sale 2024"
Day 2: Client adds new sections and content
Day 3: Client uses app to merge content back to main
Day 4: Main theme published with new content + latest code
```

### Scenario 2: Multiple Editors

```
Team Member A: Duplicates main → "Product Launch"
Team Member B: Duplicates main → "Blog Updates"

Both work independently on content

Developer:
  1. Use app to merge "Product Launch" → Main
  2. Use app to merge "Blog Updates" → Main
  3. Main theme has all changes + latest code
```

### Scenario 3: Content Staging with Code Development

```
Week 1:
  - Developer pushes code to GitHub → Main theme
  - Client works on "Holiday Campaign" copy

Week 2:
  - Developer continues code updates
  - Client finalizes content

Week 3:
  - Developer uses app to merge content
  - Main theme has: Latest code + Holiday content
```

## Step-by-Step User Journey

### For Clients (Non-Technical)

1. **Prepare Content**

   - Duplicate main theme in Shopify admin
   - Make content changes (text, images, sections)
   - Preview changes

2. **Request Merge**

   - Open Theme Merger app
   - Select their copy theme as source
   - Select main theme as target
   - Click "Compare Themes"

3. **Review Changes**

   - See list of all content files changed
   - Select which changes to merge
   - Click "Merge"

4. **Publish**
   - Check main theme preview
   - Publish when ready

### For Developers

1. **Setup** (One-time)

   - Install and configure app
   - Share access with clients
   - Train team on usage

2. **Normal Workflow**

   - Continue GitHub workflow as usual
   - Code changes go to main theme
   - Clients merge content via app

3. **Monitor**
   - Check app logs if needed
   - No more manual content merging
   - No more merge conflicts

## What Gets Merged vs. What Doesn't

### ✅ Files That Get Merged (Content)

```
config/
  └── settings_data.json     ← Theme settings, content sections

sections/
  ├── hero-banner.json       ← Section settings
  ├── featured-products.json
  └── testimonials.json

templates/
  ├── index.json             ← Page configurations
  ├── product.json
  └── collection.json
```

### ❌ Files That Don't Get Merged (Code)

```
layout/
  └── theme.liquid           ← Liquid templates (safe!)

sections/
  └── hero-banner.liquid     ← Section code (safe!)

snippets/
  └── product-card.liquid    ← Snippets (safe!)

assets/
  ├── theme.css              ← Styles (safe!)
  ├── theme.js               ← Scripts (safe!)
  └── logo.png               ← Images (safe!)

config/
  └── settings_schema.json   ← Theme configuration (safe!)
```

## Smart Merging for settings_data.json

The app intelligently merges `settings_data.json`:

**From Source Theme (Staging):**

- Content sections
- Section placements
- Homepage content

**From Target Theme (Main):**

- Theme configuration
- Color schemes
- Typography settings

**Result:**

- Content updated
- Theme settings preserved
- No configuration lost

## Common Questions

### Q: Will this overwrite my code changes?

**A:** No! The app only touches JSON content files. Your Liquid, CSS, and JavaScript files are never modified.

### Q: Can I undo a merge?

**A:** Shopify keeps theme version history. You can restore previous versions from the Shopify admin.

### Q: What if both themes have different code versions?

**A:** The target theme's code is preserved. Only content is copied from the source theme.

### Q: Can I merge specific files only?

**A:** Yes! The app shows all changed files and you can select exactly which ones to merge.

### Q: What happens to sections that only exist in one theme?

**A:** New sections are copied over. The app shows these as "added" files.

### Q: Is this safe to use on my live theme?

**A:** Yes, but always test first. Merge to a development theme first to verify results.

## Best Practices

### ✅ Do's

- Test on a non-live theme first
- Review changes before merging
- Merge small batches for easier tracking
- Keep main theme connected to GitHub for code
- Use descriptive names for copy themes

### ❌ Don'ts

- Don't merge to live theme without testing
- Don't make code changes in copy themes
- Don't delete source theme until merge is verified
- Don't merge if you see unexpected file changes
- Don't use for themes with different code bases

## Timeline Comparison

### Before This App

```
Client: Makes content changes in copy theme (1 day)
        ↓
Client: Emails developer with changes (waiting...)
        ↓
Developer: Manually reviews changes (30-60 min)
           ↓
Developer: Manually copies content (1-2 hours)
           ↓
Developer: Tests and fixes issues (30 min)
           ↓
Developer: Publishes changes

Total time: 1-3 days
Developer time: 2-3 hours
```

### With This App

```
Client: Makes content changes in copy theme (1 day)
        ↓
Client: Uses app to merge (5 minutes)
        ↓
Client: Previews and publishes

Total time: 1 day
Developer time: 0 hours (setup time only)
```

## Use Cases

### 1. **Content Staging**

Marketing team prepares seasonal content in advance without affecting live site.

### 2. **A/B Testing**

Create multiple theme versions with different content, merge winner to main.

### 3. **Client Previews**

Let clients preview content changes without touching live theme.

### 4. **Multi-Store Management**

Merge content between different stores with similar themes.

### 5. **Emergency Updates**

Quickly pull urgent content changes from any theme copy.

## Success Metrics

Track these to measure impact:

- Time saved on manual merges
- Reduction in merge-related bugs
- Client independence (fewer developer requests)
- Faster content deployment
- Reduced risk of code conflicts

## Getting Help

- **Setup Issues**: See `SETUP.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Full Documentation**: See `README.md`
- **Contributing**: See `CONTRIBUTING.md`

---

**Ready to get started?** Follow the quick setup guide in `SETUP.md`!



