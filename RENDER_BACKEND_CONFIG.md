# 🚀 Render Backend Configuration

## Add Vercel Domain to CORS Origins

Your backend at **https://survey-app-1ihh.onrender.com** needs to allow requests from your Vercel frontend.

### Step 1: Update Render Environment Variable

1. Go to: https://dashboard.render.com/
2. Select your service: **survey-app**
3. Click on **Environment** tab
4. Find or add the variable: `CORS_ORIGINS`

### Step 2: Set CORS_ORIGINS Value

Update the `CORS_ORIGINS` environment variable to include your Vercel domain:

```
https://survey-app-beta-ivory.vercel.app,http://localhost:3000,http://localhost:5173
```

**Important:** 
- No spaces between domains
- Include both production and development URLs
- No trailing slashes on URLs

### Step 3: Redeploy Backend

After updating the environment variable:
1. Render will automatically redeploy your service
2. Wait for deployment to complete (~2-3 minutes)
3. Check deployment logs for any errors

## Complete Render Environment Variables Checklist

Make sure these are all set in your Render dashboard:

- ✅ `DATABASE_URL` - PostgreSQL connection (auto-set by Render)
- ✅ `REDIS_URL` - Redis connection (if using Redis addon)
- ✅ `NODE_ENV` - Set to `production`
- ✅ `PORT` - Usually auto-set by Render
- ✅ `CORS_ORIGINS` - **Update with Vercel domain** (see above)

## Test Your Configuration

After both deployments complete:

1. **Test Backend Health**
   - Visit: https://survey-app-1ihh.onrender.com/health
   - Should return: `{"status":"healthy"}`

2. **Test Frontend Connection**
   - Visit: https://survey-app-beta-ivory.vercel.app/
   - Open browser console (F12)
   - Submit a survey
   - Check for:
     - ✅ No CORS errors
     - ✅ Successful API responses (200 status)
     - ✅ Data appears in results page

## Troubleshooting

### CORS Error in Browser Console
```
Access to fetch at 'https://survey-app-1ihh.onrender.com/api/survey' 
from origin 'https://survey-app-beta-ivory.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Verify `CORS_ORIGINS` includes exact Vercel domain
2. Check for typos (no trailing slash, correct protocol)
3. Wait for Render to finish redeploying
4. Hard refresh frontend (Ctrl+Shift+R)

### Backend Not Responding
- Check Render logs: Dashboard → Your Service → Logs
- Verify service is running (not crashed)
- Check DATABASE_URL is set correctly

### Frontend Shows Old Cached Data
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for actual API calls

## Quick Commands

```bash
# Test backend health
curl https://survey-app-1ihh.onrender.com/health

# Test CORS headers
curl -H "Origin: https://survey-app-beta-ivory.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://survey-app-1ihh.onrender.com/api/survey -v
```

## Next Steps

After configuring Render backend:
1. ✅ Set CORS_ORIGINS with Vercel domain
2. ⏭️ Configure Vercel environment variables (see VERCEL_ENV_CONFIG.md)
3. ⏭️ Redeploy Vercel frontend
4. ⏭️ Test end-to-end functionality
