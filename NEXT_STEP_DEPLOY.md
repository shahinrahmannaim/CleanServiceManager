# Next Step: Deploy to DigitalOcean App Platform

## Step-by-Step Instructions

### 1. Go to DigitalOcean App Platform
- Open: https://cloud.digitalocean.com/apps
- Sign in to your DigitalOcean account
- Click the blue **"Create App"** button

### 2. Connect Your GitHub Repository
- Select **"GitHub"** as your source
- Choose repository: **`shahinrahmannaim/CleanServiceManager`**
- Select branch: **`main`**
- Check **"Autodeploy"** (updates automatically when you push code)

### 3. Configure the App
**App Details:**
- App Name: `panaroma-cleaning-services`
- Region: `Frankfurt` (closest to Qatar)

**Service Configuration:**
- Service Name: `web`
- Build Command: `npm run build`
- Run Command: `npm start`
- Port: `5000`

### 4. Add Environment Variables
Click "Environment Variables" and add these:

```
NODE_ENV=production
JWT_SECRET=7aLLoc7Apiu3HETpnm5bniajafHKEZNwztXIaEWRHbM=
SUPERADMIN_EMAIL=admin@panaroma.qa
SUPERADMIN_PASSWORD=SuperAdmin123!@#
ADMIN_EMAIL=admin@panaroma.qa
ADMIN_PASSWORD=Admin123!@#
```

### 5. Add Database
- Click **"Add Component"** → **"Database"**
- Select **"PostgreSQL"**
- Name: `panaroma-db`
- Plan: **Basic ($15/month)**

### 6. Review and Deploy
- Check all settings
- Total cost will show: ~$27/month
- Click **"Create Resources"**

### 7. Wait for Deployment (5-10 minutes)
- Watch the build logs
- When complete, you'll get your live URL

## Your Live App URLs

After deployment:
- **Main App**: `https://panaroma-cleaning-services-xyz.ondigitalocean.app`
- **Admin Panel**: `https://panaroma-cleaning-services-xyz.ondigitalocean.app/admin/dashboard`

## Login Credentials
- **Admin Email**: `admin@panaroma.qa`
- **Admin Password**: `SuperAdmin123!@#`

## What You'll Get
✅ Professional hosting with SSL
✅ Auto-scaling based on traffic  
✅ Managed PostgreSQL database
✅ Automatic backups
✅ Built-in monitoring
✅ GitHub integration for updates

The deployment process is completely automated once you click "Create Resources"!