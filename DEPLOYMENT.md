# Production Deployment Guide

This guide covers deploying your Shopify Theme Content Merger app to production.

## Pre-Deployment Checklist

- [ ] Test thoroughly on development store
- [ ] Review security settings
- [ ] Set up proper session storage (Redis/Database)
- [ ] Configure production environment variables
- [ ] Set up monitoring and logging
- [ ] Create backup strategy

## Deployment Options

### Option 1: Heroku (Easiest)

#### Step 1: Create Heroku App

```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add Node.js buildpack
heroku buildpacks:set heroku/nodejs
```

#### Step 2: Configure Environment Variables

```bash
heroku config:set SHOPIFY_API_KEY=your_api_key
heroku config:set SHOPIFY_API_SECRET=your_api_secret
heroku config:set SCOPES=read_themes,write_themes
heroku config:set HOST=https://your-app-name.herokuapp.com
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
heroku config:set NODE_ENV=production
```

#### Step 3: Deploy

```bash
git push heroku main
```

#### Step 4: Update Shopify App Settings

- App URL: `https://your-app-name.herokuapp.com`
- Redirect URL: `https://your-app-name.herokuapp.com/api/auth/callback`

### Option 2: Railway

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Initialize and Deploy

```bash
railway init
railway up
```

#### Step 3: Set Environment Variables

Go to Railway dashboard and add:

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SCOPES=read_themes,write_themes`
- `HOST=https://your-app.railway.app`
- `SESSION_SECRET`
- `NODE_ENV=production`

### Option 3: Render

#### Step 1: Create Web Service

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: theme-content-merger
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

#### Step 2: Add Environment Variables

In Render dashboard, add the following environment variables:

- `SHOPIFY_API_KEY` - Your Shopify API key
- `SHOPIFY_API_SECRET` - Your Shopify API secret
- `SCOPES` - `read_themes,write_themes`
- `HOST` - Your Render URL (e.g., `https://your-app.onrender.com`)
- `SESSION_SECRET` - Generate with: `openssl rand -base64 32`
- `NODE_ENV` - `production`
- `PORT` - `3000` (optional, Render sets this automatically)

#### Step 3: Deploy

Render will automatically deploy on push to main branch.

### Option 4: DigitalOcean App Platform

#### Step 1: Create App

1. Go to DigitalOcean
2. Create new App
3. Connect GitHub repository

#### Step 2: Configure

- **Build Command**: `npm install && npm run build`
- **Run Command**: `npm start`
- Add environment variables

#### Step 3: Deploy

DigitalOcean will handle deployment automatically.

### Option 5: AWS (Advanced)

For AWS deployment, consider:

- **Elastic Beanstalk**: Easiest AWS option
- **ECS/Fargate**: For containerized deployment
- **Lambda + API Gateway**: Serverless option (requires code modifications)

## Production Considerations

### 1. Session Storage

**IMPORTANT**: Replace in-memory session storage with persistent storage.

#### Using Redis (Recommended)

Install Redis adapter:

```bash
npm install ioredis
```

Update `server/index.js`:

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Replace sessionStorage Map with Redis
export const sessionStorage = {
  async get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  async set(key, value) {
    await redis.set(key, JSON.stringify(value));
  },
  async delete(key) {
    await redis.del(key);
  },
};
```

#### Using Database

Alternatively, use Shopify's session storage utilities or implement your own database storage.

### 2. Rate Limiting

Add rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

Update `server/index.js`:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Logging

Add production logging:

```bash
npm install winston
```

Create `server/utils/logger.js`:

```javascript
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
```

### 4. Security Headers

Add security headers:

```bash
npm install helmet
```

Update `server/index.js`:

```javascript
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: false, // Adjust based on needs
  })
);
```

### 5. Error Monitoring

Consider adding error monitoring:

- **Sentry**: `npm install @sentry/node`
- **Rollbar**: `npm install rollbar`
- **LogRocket**: For frontend monitoring

### 6. Environment Variables

Production environment variables:

```env
SHOPIFY_API_KEY=your_production_api_key
SHOPIFY_API_SECRET=your_production_api_secret
SCOPES=read_themes,write_themes
HOST=https://your-production-domain.com
PORT=3000
NODE_ENV=production
SESSION_SECRET=your_strong_random_secret
REDIS_URL=your_redis_connection_string
```

### 7. SSL/HTTPS

- Heroku, Railway, Render provide SSL automatically
- For custom domains, ensure SSL certificate is configured
- Always use HTTPS in production

### 8. Monitoring

Set up monitoring for:

- Server uptime
- API response times
- Error rates
- Memory usage
- API rate limit usage

Tools:

- Heroku Metrics (built-in)
- DataDog
- New Relic
- Prometheus + Grafana

### 9. Backups

While Shopify maintains theme backups:

- Log all merge operations
- Consider keeping audit logs
- Monitor for failed operations

### 10. Scaling

If you experience high traffic:

- Enable horizontal scaling (multiple instances)
- Use Redis for session sharing
- Consider CDN for static assets
- Implement caching where appropriate

## Post-Deployment

### 1. Test Production App

- Install on a test store
- Test authentication flow
- Test theme operations
- Verify error handling

### 2. Monitor Initial Usage

- Watch error logs
- Monitor API rate limits
- Check performance metrics

### 3. Update Documentation

- Document production URL
- Update Shopify app settings
- Inform users of any changes

## Maintenance

### Regular Tasks

- Monitor error logs weekly
- Check API rate limit usage
- Review security updates
- Update dependencies monthly
- Backup configuration

### Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions carefully
npm install package@latest
```

## Rollback Plan

If issues occur:

1. Revert to previous Heroku release: `heroku rollback`
2. Or redeploy last known good commit
3. Check logs: `heroku logs --tail`
4. Notify affected users

## Support

### Debugging Production Issues

```bash
# View logs (Heroku)
heroku logs --tail --app your-app-name

# View logs (Railway)
railway logs

# SSH into container (if needed)
heroku run bash
```

### Common Production Issues

**High memory usage**

- Check for memory leaks
- Review session storage implementation
- Consider upgrading dyno/instance size

**Slow response times**

- Implement caching
- Optimize database queries
- Add CDN for static assets

**Session issues**

- Verify Redis connection
- Check session expiry settings
- Ensure SESSION_SECRET is set

## Cost Estimates

### Heroku

- **Hobby**: $7/month (good for low traffic)
- **Standard 1X**: $25/month (recommended)
- **Standard 2X**: $50/month (high traffic)

### Railway

- Pay-as-you-go
- ~$5-20/month for typical usage

### Render

- **Free**: Limited (good for testing)
- **Starter**: $7/month
- **Standard**: $25/month

Add costs for:

- Redis: $0-10/month (Redis Labs free tier available)
- Domain: $10-15/year (optional)
- Monitoring: $0-50/month (many free tiers)

## Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] Redis/persistent session storage configured
- [ ] Rate limiting enabled
- [ ] Security headers added
- [ ] Logging configured
- [ ] Error monitoring set up
- [ ] SSL certificate valid
- [ ] Tested on production domain
- [ ] Shopify app URLs updated
- [ ] Documentation updated
- [ ] Backup strategy in place
- [ ] Monitoring dashboards created

## Questions?

If you encounter issues during deployment:

1. Check the logs
2. Verify environment variables
3. Test authentication flow
4. Review Shopify app settings
5. Consult platform-specific documentation

Good luck with your deployment! 🚀
