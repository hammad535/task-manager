# Vercel Frontend Deployment Guide

Complete step-by-step guide to deploy the React frontend to Vercel.

---

## Prerequisites

✅ GitHub repository: `hammad535/task-manager`  
✅ `.env` file committed with `REACT_APP_API_BASE_URL=https://task-manager-slag.onrender.com`  
✅ Backend deployed on Render at `https://task-manager-slag.onrender.com`

---

## Step 1: Import Project to Vercel

### 1.1 Sign in to Vercel

1. Go to **https://vercel.com**
2. Click **Sign Up** or **Log In**
3. Choose **Continue with GitHub** (recommended)
4. Authorize Vercel to access your GitHub account

### 1.2 Import Repository

1. In Vercel Dashboard, click **Add New...** → **Project**
2. You'll see a list of your GitHub repositories
3. Find **`hammad535/task-manager`**
4. Click **Import** next to it

---

## Step 2: Configure Project Settings

### 2.1 Project Configuration

After clicking Import, you'll see the **Configure Project** page:

**Project Name**: `task-manager` (or your preferred name)

**Framework Preset**: 
- Vercel should auto-detect **Create React App**
- If not, select **Create React App** manually

### 2.2 Root Directory ⚠️ IMPORTANT

**Root Directory**: 
- Click **Edit** next to Root Directory
- Change from `/` (root) to **`client`**
- This tells Vercel to look in the `/client` folder

### 2.3 Build Settings

**Build Command**: 
```
npm run build
```

**Output Directory**: 
```
build
```

**Install Command** (usually auto-detected):
```
npm install
```

### 2.4 Environment Variables

**Important**: Vercel will automatically read the `.env` file from your repository!

However, you can also manually add it:
- Click **Environment Variables**
- Add:
  - **Key**: `REACT_APP_API_BASE_URL`
  - **Value**: `https://task-manager-slag.onrender.com`
  - **Environment**: Production, Preview, Development (select all)

**Note**: Since `.env` is committed, Vercel will use it automatically. Adding it manually is optional but ensures it's set.

### 2.5 Deploy

1. Review all settings
2. Click **Deploy**

---

## Step 3: Wait for Deployment

1. Vercel will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build the app (`npm run build`)
   - Deploy to a CDN

2. Watch the build logs in real-time
3. Build typically takes 2-5 minutes

---

## Step 4: Verify Deployment

### 4.1 Check Build Status

- ✅ **Success**: You'll see "Ready" with a green checkmark
- ❌ **Failed**: Check build logs for errors

### 4.2 Get Your Frontend URL

Once deployed, you'll see:
- **Production URL**: `https://task-manager-xxxxx.vercel.app`
- Or your custom domain if configured

**Copy this URL** - you'll need it for the next step!

Example: `https://task-manager-abc123.vercel.app`

---

## Step 5: Update Backend CORS (Render)

### 5.1 Go to Render Dashboard

1. Go to **https://render.com**
2. Sign in to your account
3. Find your backend service: **task-manager-backend** (or your service name)
4. Click on it to open the service dashboard

### 5.2 Update Environment Variable

1. Click on **Environment** tab (left sidebar)
2. Find the **`FRONTEND_URL`** variable
3. Click the **pencil icon** (Edit) next to it
4. Update the value to your Vercel URL:
   ```
   https://task-manager-xxxxx.vercel.app
   ```
   (Replace with your actual Vercel URL)
5. Click **Save Changes**

### 5.3 Restart Backend Service

1. Go to **Events** or **Logs** tab
2. Click **Manual Deploy** → **Deploy latest commit**
   - OR click the **three dots menu** (⋮) → **Restart**
3. Wait for the service to restart (30-60 seconds)

### 5.4 Verify CORS Update

1. Check the **Logs** tab
2. Look for:
   ```
   🔗 Frontend URL: https://task-manager-xxxxx.vercel.app
   ```
3. This confirms the CORS setting is applied

---

## Step 6: Test Full-Stack Connection

### 6.1 Test Frontend

1. Open your Vercel frontend URL in a browser
2. The app should load
3. Try creating a board or item
4. Check browser console (F12) for any CORS errors

### 6.2 Test API Connection

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Perform an action (e.g., create a board)
4. Check API requests:
   - Should go to: `https://task-manager-slag.onrender.com/api/...`
   - Status should be **200 OK** (not CORS errors)

### 6.3 Common Issues

**CORS Error**: 
- Verify `FRONTEND_URL` in Render matches Vercel URL exactly
- No trailing slash
- Restart backend after updating

**API Not Found**:
- Check `REACT_APP_API_BASE_URL` in Vercel environment variables
- Verify backend is running on Render

**Build Failed**:
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility

---

## Step 7: Optional - Custom Domain

### 7.1 Add Custom Domain (Optional)

1. In Vercel project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow DNS configuration instructions
5. Update `FRONTEND_URL` in Render with new domain

---

## Deployment Checklist

- [ ] Vercel project created
- [ ] Root directory set to `/client`
- [ ] Build command: `npm run build`
- [ ] Output directory: `build`
- [ ] Environment variable confirmed (from `.env` file)
- [ ] Frontend deployed successfully
- [ ] Frontend URL copied
- [ ] `FRONTEND_URL` updated in Render
- [ ] Backend restarted
- [ ] CORS verified in logs
- [ ] Frontend can connect to backend
- [ ] Full-stack app working end-to-end

---

## Quick Reference

### Vercel URLs
- **Dashboard**: https://vercel.com/dashboard
- **Project Settings**: Project → Settings
- **Environment Variables**: Settings → Environment Variables
- **Deployments**: Project → Deployments tab

### Render URLs
- **Dashboard**: https://dashboard.render.com
- **Service**: Your backend service
- **Environment**: Service → Environment tab
- **Logs**: Service → Logs tab

### Important URLs
- **Frontend**: `https://task-manager-xxxxx.vercel.app`
- **Backend API**: `https://task-manager-slag.onrender.com/api`
- **Health Check**: `https://task-manager-slag.onrender.com/api/health`

---

## Troubleshooting

### Build Fails on Vercel

**Error**: "Module not found"
- **Fix**: Check `package.json` has all dependencies
- Verify `node_modules` is in `.gitignore`

**Error**: "Build command failed"
- **Fix**: Check build logs for specific error
- Verify `npm run build` works locally

### CORS Errors

**Error**: "Access to fetch blocked by CORS policy"
- **Fix**: 
  1. Verify `FRONTEND_URL` in Render matches Vercel URL exactly
  2. No trailing slash: `https://app.vercel.app` (not `https://app.vercel.app/`)
  3. Restart backend after updating
  4. Clear browser cache

### Environment Variables Not Working

**Issue**: API calls go to wrong URL
- **Fix**:
  1. Check Vercel → Settings → Environment Variables
  2. Verify `REACT_APP_API_BASE_URL` is set
  3. Redeploy after adding environment variables
  4. Check `.env` file is committed to repo

---

## Success Indicators

✅ Frontend loads without errors  
✅ Can create boards and items  
✅ Data persists (refreshing page keeps data)  
✅ No CORS errors in browser console  
✅ API requests return 200 status codes  
✅ Backend logs show successful requests  

---

## Next Steps After Deployment

1. **Monitor**: Check Vercel and Render logs regularly
2. **Performance**: Monitor API response times
3. **Errors**: Set up error tracking (optional)
4. **Backup**: Regular database backups
5. **Updates**: Deploy updates by pushing to `main` branch

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Check logs**: Both platforms provide detailed logs

---

**🎉 Congratulations! Your full-stack app is now live!**
