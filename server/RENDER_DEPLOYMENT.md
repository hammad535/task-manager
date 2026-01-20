# Render Deployment Guide

Step-by-step guide to deploy the backend to Render.

## Prerequisites

1. GitHub repository with your code
2. Render account (sign up at https://render.com)
3. MySQL database (Render PostgreSQL/MySQL or external)

---

## Step 1: Create MySQL Database on Render

1. Go to Render Dashboard → **New +** → **PostgreSQL** (or MySQL if available)
2. Choose **Free** tier (or paid)
3. Name your database: `task-manager-db`
4. Note down:
   - **Internal Database URL** (for Render services)
   - **External Database URL** (if connecting from outside)
   - **Host**, **Port**, **Database**, **User**, **Password**

---

## Step 2: Create Web Service

1. Go to Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repository
3. Select the repository: `hammad535/task-manager`

### Configure Service

**Name**: `task-manager-backend` (or your preferred name)

**Environment**: `Node`

**Region**: Choose closest to your users

**Branch**: `main` (or your default branch)

**Root Directory**: `server`

**Build Command**:
```bash
npm install
```

**Start Command**:
```bash
npm start
```

**Instance Type**: 
- **Free**: 512 MB RAM (good for testing)
- **Starter**: $7/month (recommended for production)

---

## Step 3: Set Environment Variables

In Render Dashboard → Your Service → **Environment** tab, add:

### Required Variables

```env
NODE_ENV=production
PORT=10000
```

**Note**: Render automatically sets `PORT`, but you can override it. Render uses port 10000 by default.

### Database Variables

```env
DB_HOST=your-database-host.render.com
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=task_manager
```

**For Render Internal Database**:
- Use the **Internal Database URL** provided by Render
- Or use individual variables from Render's database dashboard

### Frontend URL (CORS)

```env
FRONTEND_URL=https://your-frontend.vercel.app
```

**Important**: Update this after deploying your frontend!

---

## Step 4: Database Setup

### Option A: Using Render's Database Dashboard

1. Go to your database service on Render
2. Click **Connect** → **External Connection**
3. Use a MySQL client (like MySQL Workbench, DBeaver, or command line)
4. Run your database schema SQL

### Option B: Using Render Shell

1. Go to your database service → **Shell** tab
2. Connect via MySQL command line
3. Run your schema SQL

### Database Schema

Ensure your database has these tables:
- `boards`
- `board_groups`
- `items`
- `sub_items`
- `users`
- `teams`
- `item_assignees`
- `activity_logs`

---

## Step 5: Deploy

1. Click **Save Changes** in Render
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start with `npm start`
3. Watch the **Logs** tab for deployment progress

---

## Step 6: Verify Deployment

### Health Check

Visit: `https://your-service-name.onrender.com/api/health`

Expected response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Check Logs

1. Go to **Logs** tab in Render dashboard
2. Look for:
   - ✅ `Database connected successfully`
   - ✅ `Server running on port 10000`
   - ✅ `Environment: production`

---

## Step 7: Update CORS After Frontend Deployment

Once your frontend is deployed:

1. Go to your backend service on Render
2. **Environment** tab
3. Update `FRONTEND_URL` to your actual frontend URL
4. **Manual Deploy** → **Deploy latest commit**

---

## Troubleshooting

### Service Won't Start

**Check logs for**:
- Database connection errors
- Missing environment variables
- Port conflicts

**Common fixes**:
- Verify all environment variables are set
- Check database is accessible from Render
- Ensure `NODE_ENV=production` is set

### Database Connection Failed

**Possible causes**:
1. Wrong database credentials
2. Database not accessible (firewall/network)
3. Database not created yet

**Solutions**:
- Double-check environment variables
- For Render internal database, use internal connection string
- Verify database service is running

### CORS Errors

**Symptoms**: Frontend can't connect to backend

**Fix**:
1. Verify `FRONTEND_URL` matches your frontend domain exactly
2. No trailing slash in `FRONTEND_URL`
3. Restart service after updating environment variables

### Build Fails

**Check**:
- Node.js version compatibility
- All dependencies in `package.json`
- Build logs for specific errors

---

## Render-Specific Notes

### Auto-Deploy

Render automatically deploys on:
- Push to connected branch
- Manual deploy trigger

### Free Tier Limitations

- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Upgrade to paid tier for always-on service

### Environment Variables

- All variables are encrypted
- Changes require service restart
- Use **Environment Groups** for shared variables

### Logs

- View real-time logs in dashboard
- Logs are retained for limited time (varies by plan)
- Export logs for analysis

---

## Production Checklist

- [ ] Database created and accessible
- [ ] All environment variables set
- [ ] Database schema applied
- [ ] Health check endpoint working
- [ ] CORS configured with frontend URL
- [ ] Service is running (not sleeping)
- [ ] Logs show no errors
- [ ] Frontend can connect to backend

---

## Support

- Render Docs: https://render.com/docs
- Render Support: https://render.com/support
- Check service logs for detailed error messages

---

## Quick Reference

**Service URL**: `https://your-service-name.onrender.com`

**Health Check**: `https://your-service-name.onrender.com/api/health`

**API Base**: `https://your-service-name.onrender.com/api`

**Environment Variables**:
- `NODE_ENV=production`
- `PORT=10000` (Render default)
- `DB_HOST=...`
- `DB_USER=...`
- `DB_PASSWORD=...`
- `DB_NAME=task_manager`
- `FRONTEND_URL=https://your-frontend.vercel.app`
