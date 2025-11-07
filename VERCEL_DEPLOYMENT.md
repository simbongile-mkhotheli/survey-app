# Vercel Deployment Guide

## 🚀 Quick Setup for Vercel Environment Variables

Your frontend is already deployed at: https://survey-app-beta-ivory.vercel.app/

To connect it to your backend, configure these environment variables in Vercel:

### Step 1: Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project: `survey-app`
3. Click on **Settings** tab
4. Navigate to **Environment Variables** section

### Step 2: Add Required Environment Variables

Add the following variables:

#### Production Environment
```bash
VITE_API_URL=<your-backend-url>
VITE_APP_NAME=Survey Application
VITE_NODE_ENV=production
```

#### Example with Railway Backend
```bash
VITE_API_URL=https://survey-app-backend.railway.app
VITE_APP_NAME=Survey Application
VITE_NODE_ENV=production
```

#### Example with Render Backend
```bash
VITE_API_URL=https://survey-app-backend.onrender.com
VITE_APP_NAME=Survey Application
VITE_NODE_ENV=production
```

#### Example with Local/Ngrok (for testing)
```bash
VITE_API_URL=https://your-ngrok-url.ngrok.io
VITE_APP_NAME=Survey Application
VITE_NODE_ENV=production
```

### Step 3: Set Environment Scope
- **Environment**: Select `Production`, `Preview`, and `Development`
- This ensures variables work across all deployment contexts

### Step 4: Redeploy
After adding variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋯** (three dots)
4. Select **Redeploy**
5. Check "Use existing Build Cache" for faster deployment

---

## 🏗️ Backend Deployment Options

Your backend needs to be deployed somewhere. Here are the options:

### Option 1: Railway (Recommended - Easy & Free Tier)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project (from backend folder)
cd backend
railway init

# Add PostgreSQL database
railway add postgresql

# Deploy
railway up
```

**Set these Railway environment variables:**
```bash
DATABASE_URL=<automatically-set-by-railway>
REDIS_URL=<add-redis-addon-or-external>
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://survey-app-beta-ivory.vercel.app
```

### Option 2: Render (Free Tier Available)
1. Go to https://render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: survey-app-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install && npx prisma generate`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**: Add DATABASE_URL, REDIS_URL, etc.

### Option 3: Heroku
```bash
# Install Heroku CLI
heroku login

# Create app
heroku create survey-app-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Add Redis
heroku addons:create heroku-redis:mini

# Deploy
git subtree push --prefix backend heroku main
```

---

## 📋 Complete Environment Variables Checklist

### Vercel (Frontend)
- [x] `VITE_API_URL` - Backend API endpoint
- [x] `VITE_APP_NAME` - Application name
- [x] `VITE_NODE_ENV` - Environment (production)

### Backend Platform (Railway/Render/Heroku)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `REDIS_URL` - Redis connection string
- [ ] `NODE_ENV` - Set to "production"
- [ ] `PORT` - Usually 3000 (auto-set on most platforms)
- [ ] `FRONTEND_URL` - https://survey-app-beta-ivory.vercel.app
- [ ] `CORS_ORIGIN` - https://survey-app-beta-ivory.vercel.app

---

## 🧪 Testing Your Deployment

After configuring everything:

1. **Check Frontend**: https://survey-app-beta-ivory.vercel.app/
2. **Check Backend Health**: `<your-backend-url>/health`
3. **Test API Connection**: Open browser console and check for API errors
4. **Submit Survey**: Try submitting the form to verify end-to-end flow

---

## 🔍 Troubleshooting

### Frontend Shows "Network Error"
- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend is running: visit `<backend-url>/health`
- Verify CORS is configured on backend

### "Invalid environment configuration" Error
- Missing required environment variables in Vercel
- Redeploy after adding variables

### Backend Not Responding
- Check backend logs in Railway/Render dashboard
- Verify DATABASE_URL is set correctly
- Run database migrations: `npx prisma migrate deploy`

---

## 📖 Next Steps

1. **Deploy Backend**: Choose Railway/Render/Heroku
2. **Configure Vercel Variables**: Add VITE_API_URL
3. **Redeploy Frontend**: Trigger new Vercel deployment
4. **Test Application**: Submit a survey and check results
5. **Monitor Logs**: Check both frontend and backend logs

---

## 🎯 Quick Command Reference

```bash
# Check current Vercel deployment
vercel ls

# View environment variables
vercel env ls

# Add environment variable via CLI
vercel env add VITE_API_URL

# Redeploy
vercel --prod

# View logs
vercel logs
```

---

## 💡 Pro Tips

1. **Use Preview Deployments**: Test changes in preview before production
2. **Enable Build Logs**: Check Vercel build logs for environment variable issues
3. **CORS Configuration**: Ensure backend allows your Vercel domain
4. **Health Checks**: Monitor backend uptime with health endpoints
5. **Database Migrations**: Run `npx prisma migrate deploy` after schema changes

---

For more help, see:
- Vercel Docs: https://vercel.com/docs/environment-variables
- Railway Docs: https://docs.railway.app/
- Render Docs: https://render.com/docs
