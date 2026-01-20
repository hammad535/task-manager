# Production Deployment Guide

This guide covers deploying the Task Manager application to production.

## Architecture

- **Frontend**: React app (deploy to Vercel/Netlify)
- **Backend**: Node.js + Express API (deploy to Render/Railway)
- **Database**: MySQL (managed service or self-hosted)

---

## Backend Deployment (Render/Railway)

### 📘 Detailed Render Guide

For step-by-step Render deployment instructions, see: **[server/RENDER_DEPLOYMENT.md](./server/RENDER_DEPLOYMENT.md)**

### Quick Start

#### Prerequisites
1. Create a MySQL database (Render, Railway, or external provider)
2. Get database connection details

#### Environment Variables

Set these in your hosting platform's environment variables:

```env
NODE_ENV=production
PORT=10000
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=task_manager
FRONTEND_URL=https://your-frontend.vercel.app
```

**Note**: Render uses port 10000 by default. The app will use `process.env.PORT` automatically.

#### Deployment Steps

1. **Connect your GitHub repository**
2. **Set root directory**: `server`
3. **Set build command**: `npm install`
4. **Set start command**: `npm start`
5. **Set environment variables** (as listed above)
6. **Deploy**

#### Health Check

After deployment, verify:
- `https://your-backend.render.com/api/health` returns `{"success":true,"message":"Server is running"}`

---

## Frontend Deployment (Vercel)

### Prerequisites
1. Backend API URL (from step above)

### Environment Variables

Set in Vercel dashboard → Settings → Environment Variables:

```env
REACT_APP_API_BASE_URL=https://your-backend.render.com
```

### Deployment Steps

1. **Import your GitHub repository** to Vercel
2. **Set root directory**: `client`
3. **Set build command**: `npm run build`
4. **Set output directory**: `build`
5. **Set environment variables** (as listed above)
6. **Deploy**

### Post-Deployment

1. Update backend `FRONTEND_URL` environment variable with your Vercel URL
2. Restart backend service to apply CORS changes

---

## Database Setup

### Create Database Schema

Run the SQL schema on your MySQL database. The schema should include:

- `boards`
- `board_groups`
- `items`
- `sub_items`
- `users`
- `teams`
- `item_assignees`
- `activity_logs`

### Initial Data

You may want to create a default user:

```sql
INSERT INTO users (id, name, email) VALUES (1, 'Admin User', 'admin@example.com');
```

---

## Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] Database credentials are secure
- [ ] CORS is configured for production domain only
- [ ] Error messages don't leak sensitive information
- [ ] API has timeout protection
- [ ] Database connection uses connection pooling

---

## Monitoring

### Backend Health Check

Monitor: `GET /api/health`

### Logs

- Check hosting platform logs for errors
- Monitor unhandled promise rejections
- Watch for database connection issues

---

## Troubleshooting

### CORS Errors

- Verify `FRONTEND_URL` in backend matches your frontend domain exactly
- Check for trailing slashes
- Ensure credentials are enabled

### Database Connection Issues

- Verify all database environment variables are set
- Check database allows connections from your hosting IP
- Test connection string locally

### Build Failures

- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Check for missing environment variables

---

## Rollback Plan

1. Keep previous deployment version available
2. Revert environment variables if needed
3. Database migrations should be reversible

---

## Performance Optimization

- Enable database connection pooling (already configured)
- Use CDN for frontend static assets (Vercel handles this)
- Consider caching for frequently accessed data
- Monitor API response times

---

## Support

For issues, check:
1. Application logs
2. Database connection status
3. Environment variables configuration
4. Network/firewall settings
