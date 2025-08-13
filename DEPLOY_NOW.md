# Deploy Panaroma to DigitalOcean App Platform

## Step-by-Step Deployment Guide

### Step 1: Access DigitalOcean App Platform
1. Go to: https://cloud.digitalocean.com/apps
2. Sign in to your DigitalOcean account
3. Click **"Create App"**

### Step 2: Connect GitHub Repository
1. Select **"GitHub"** as your source
2. Choose repository: **`shahinrahmannaim/CleanServiceManager`**
3. Select branch: **`main`**
4. Enable **"Autodeploy"** (deploys automatically when you push changes)

### Step 3: Configure Application
**App Name:** `panaroma-cleaning-services`
**Region:** Choose closest to Qatar (Frankfurt or Singapore)

**Build Settings:**
- Build Command: `npm run build`
- Run Command: `npm start`
- Environment: Node.js
- Instance Size: Basic ($12/month)

### Step 4: Add Environment Variables
Add these required environment variables:

```
NODE_ENV=production
JWT_SECRET=7aLLoc7Apiu3HETpnm5bniajafHKEZNwztXIaEWRHbM=
SUPERADMIN_EMAIL=admin@panaroma.qa
SUPERADMIN_PASSWORD=SuperAdmin123!@#
ADMIN_EMAIL=admin@panaroma.qa
ADMIN_PASSWORD=Admin123!@#
```

### Step 5: Add Database
1. Click **"Add Database"**
2. Select **"PostgreSQL"**
3. Name: `panaroma-db`
4. Plan: Basic ($15/month)

### Step 6: Review and Deploy
1. Review all settings
2. Click **"Create Resources"**
3. Deployment will take 5-10 minutes

## Your Live URLs

Once deployed, your app will be available at:

**Main Application:**
- `https://panaroma-cleaning-services-xyz.ondigitalocean.app/`

**Admin Panel:**
- `https://panaroma-cleaning-services-xyz.ondigitalocean.app/admin/dashboard`
- Login: `admin@panaroma.qa` / `SuperAdmin123!@#`

**API Health Check:**
- `https://panaroma-cleaning-services-xyz.ondigitalocean.app/api/health`

## Features Ready on Deployment

✅ Complete cleaning services platform
✅ Customer booking system
✅ Employee management
✅ Admin panel with 10 management sections
✅ Automatic promotion system
✅ Professional Panaroma branding
✅ Mobile-responsive design
✅ SSL security (HTTPS)
✅ PostgreSQL database
✅ JWT authentication
✅ Real-time features

## Total Cost: ~$27/month
- App Platform: $12/month
- Managed PostgreSQL: $15/month

## Professional Benefits
- Automatic SSL certificates
- Global CDN for fast loading
- Auto-scaling based on traffic
- Built-in monitoring and alerts
- Automatic backups
- GitHub integration for updates
- Zero server maintenance

Your Panaroma app will be production-ready for Qatar's cleaning services market!