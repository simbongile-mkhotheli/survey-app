# ⚙️ Vercel Environment Variables Configuration

## Add these variables to your Vercel project

Go to: https://vercel.com/simbongile-mkhotheli/survey-app/settings/environment-variables

### Required Variables

1. **VITE_API_URL**
   - Value: `https://survey-app-1ihh.onrender.com`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **VITE_APP_NAME**
   - Value: `Survey Application`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **VITE_NODE_ENV**
   - Value: `production`
   - Environments: ✅ Production only

## Quick Setup Steps

1. Click "Add New" in Vercel Environment Variables
2. Copy each variable name and value from above
3. Select the appropriate environments for each
4. Click "Save"
5. Go to Deployments → Click ⋯ → Redeploy

## Verify Configuration

After redeploying, your frontend at:
- https://survey-app-beta-ivory.vercel.app/

Will connect to your backend at:
- https://survey-app-1ihh.onrender.com

Test the connection:
1. Open browser console on your Vercel app
2. Submit a survey
3. Check for successful API calls (no CORS errors)
4. Verify responses are saved by checking /results page

## Backend CORS Configuration

Make sure your Render backend has CORS configured to allow your Vercel domain:

```typescript
// backend/src/server.ts or similar
app.use(cors({
  origin: [
    'https://survey-app-beta-ivory.vercel.app',
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
```

## Troubleshooting

- **Network Error**: Check VITE_API_URL is correct (no trailing slash)
- **CORS Error**: Update backend CORS to allow Vercel domain
- **404 Error**: Verify Render backend is running at the URL
- **Environment not updating**: Redeploy after changing variables
