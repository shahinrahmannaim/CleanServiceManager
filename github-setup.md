# GitHub Repository Setup for DigitalOcean App Platform

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it: `panaroma-cleaning-services`
3. Make it public (required for free App Platform tier)
4. Initialize with README

## Step 2: Upload Your Code

### Option A: Using Git Commands
```bash
# Clone the new repository
git clone https://github.com/YOUR_USERNAME/panaroma-cleaning-services.git
cd panaroma-cleaning-services

# Copy all your Panaroma files to this directory
# (Copy everything from this Replit project)

# Add and commit files
git add .
git commit -m "Initial Panaroma app deployment"
git push origin main
```

### Option B: Upload via GitHub Web Interface
1. Go to your repository on GitHub
2. Click "uploading an existing file"
3. Drag and drop all your project files
4. Commit the changes

## Step 3: Required Files in Repository

Make sure these files are in your GitHub repository:
- `package.json` ✓
- `server/` directory ✓
- `client/` directory ✓
- `shared/` directory ✓
- `Dockerfile` ✓
- `app-platform-spec.yaml` ✓
- All other project files ✓

## Step 4: Connect to App Platform

1. Go to DigitalOcean App Platform dashboard
2. Click "Create App"
3. Select "GitHub" as source
4. Choose your `panaroma-cleaning-services` repository
5. Select `main` branch
6. Import the app spec from `app-platform-spec.yaml`

## Step 5: Configure Environment Variables

In the App Platform dashboard, set these environment variables:

```
NODE_ENV=production
JWT_SECRET=7aLLoc7Apiu3HETpnm5bniajafHKEZNwztXIaEWRHbM=
SUPERADMIN_EMAIL=admin@panaroma.qa
SUPERADMIN_PASSWORD=SuperAdmin123!@#
ADMIN_EMAIL=admin@panaroma.qa
ADMIN_PASSWORD=Admin123!@#
SUPER_ADMIN_EMAIL=superadmin@panaroma.qa
SUPER_ADMIN_PASSWORD=SuperAdmin123!@#
```

The DATABASE_URL will be automatically configured when you add the PostgreSQL database component.

## Step 6: Deploy

1. Review your app configuration
2. Click "Create Resources"
3. Wait for deployment (5-10 minutes)
4. Your app will be live at: `https://your-app-name.ondigitalocean.app`

## Benefits of App Platform

- ✅ Automatic SSL certificates
- ✅ Built-in monitoring and alerts  
- ✅ Auto-scaling based on traffic
- ✅ GitHub integration for continuous deployment
- ✅ Managed database with automatic backups
- ✅ Global CDN for static assets
- ✅ No server management required

## Cost
- App: $12-25/month depending on usage
- Database: $15/month
- Total: ~$27-40/month

Your Panaroma app will be production-ready with enterprise-grade infrastructure!