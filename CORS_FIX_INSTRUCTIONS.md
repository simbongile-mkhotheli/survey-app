# CORS Configuration Fix

## Problem
Your frontend (https://survey-app-beta-ivory.vercel.app) cannot access your backend (https://survey-app-1ihh.onrender.com) due to CORS restrictions.

## Solution

### Option 1: Update Environment Variable on Render (Recommended)

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your backend service: `survey-app-1ihh`
3. Navigate to **Environment** tab
4. Find or add the `CORS_ORIGINS` environment variable
5. Set the value to include your Vercel frontend URL:
   ```
   https://survey-app-beta-ivory.vercel.app,http://localhost:3000,http://localhost:5173
   ```
6. Click **Save Changes**
7. Render will automatically redeploy your backend

### Option 2: Update Code (If env var doesn't work)

If the environment variable approach doesn't work, update the CORS configuration in the code:

**File: `backend/src/server.ts`** (around line 70)

Replace:
```typescript
app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      if (!incomingOrigin) return callback(null, true);
      if (origins.includes(incomingOrigin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS denied: ${incomingOrigin}`));
    },
```

With:
```typescript
app.use(
  cors({
    origin: [
      'https://survey-app-beta-ivory.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ],
```

### Verify the Fix

After updating, test by:
1. Open your frontend: https://survey-app-beta-ivory.vercel.app/results
2. Open browser DevTools (F12) → Network tab
3. Refresh the page
4. Check if the API requests succeed (status 200)

### Common Issues

1. **Still seeing CORS error?**
   - Wait 2-3 minutes for Render to redeploy
   - Clear browser cache (Ctrl+Shift+Delete)
   - Check that the URL in CORS_ORIGINS exactly matches your Vercel URL (no trailing slash)

2. **Multiple Vercel URLs?**
   - Add all URLs (preview and production) separated by commas:
   ```
   https://survey-app-beta-ivory.vercel.app,https://your-production-domain.vercel.app
   ```

3. **Custom domain?**
   - Add your custom domain to CORS_ORIGINS as well

### Current Configuration

- **Backend URL**: https://survey-app-1ihh.onrender.com
- **Frontend URL**: https://survey-app-beta-ivory.vercel.app
- **Environment Variable**: `CORS_ORIGINS`

### Security Note

Never use `origin: '*'` in production as it allows any website to access your API.
