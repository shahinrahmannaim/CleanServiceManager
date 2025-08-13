# CI/CD Pipeline: Replit → GitHub → DigitalOcean

## Pipeline Overview

**Development Flow:**
1. Code changes in Replit
2. Automatic sync to GitHub
3. GitHub triggers DigitalOcean deployment
4. Live production updates

## Step 1: Set Up Replit → GitHub Sync

### Using Replit's Git Integration
1. **Access Git Panel:**
   - Look for "Version Control" or "Git" in left sidebar
   - Click to open Git interface

2. **Connect to GitHub:**
   - Click "Connect to GitHub" 
   - Authorize Replit access
   - Select repository: `shahinrahmannaim/CleanServiceManager`

3. **Enable Auto-Sync:**
   - Configure automatic push on changes
   - Set branch: `main`
   - Enable continuous integration

### Alternative: Manual Git Setup
If Git panel isn't available, use Replit Shell:

```bash
# Configure git credentials (use your GitHub username/email)
git config user.name "your-username"
git config user.email "your-email@example.com"

# Add all current changes
git add .

# Commit changes
git commit -m "Setup CI/CD pipeline with deployment configurations"

# Push to GitHub (you'll need Personal Access Token)
git push origin main
```

## Step 2: Configure GitHub → DigitalOcean

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to DigitalOcean
on:
  push:
    branches: [main]
  
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: digitalocean/app_action@v1
        with:
          app_name: panaroma-cleaning-services
          token: ${{ secrets.DIGITALOCEAN_TOKEN }}
```

### DigitalOcean App Platform Setup
1. **Create App:**
   - Go to: https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Connect GitHub repository: `shahinrahmannaim/CleanServiceManager`

2. **Configure Auto-Deploy:**
   - Enable "Autodeploy on push"
   - Branch: `main`
   - Build command: `npm run build`
   - Start command: `npm start`

3. **Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=7aLLoc7Apiu3HETpnm5bniajafHKEZNwztXIaEWRHbM=
   SUPERADMIN_EMAIL=admin@panaroma.qa
   SUPERADMIN_PASSWORD=SuperAdmin123!@#
   ADMIN_EMAIL=admin@panaroma.qa
   ADMIN_PASSWORD=Admin123!@#
   ```

## Step 3: Complete Pipeline Benefits

### Automatic Workflow:
- ✅ Code in Replit → Auto-sync to GitHub
- ✅ GitHub push → Auto-deploy to DigitalOcean  
- ✅ Live updates without manual intervention
- ✅ Version control and rollback capabilities
- ✅ Professional deployment pipeline

### Production URLs:
- **Live App:** `https://panaroma-cleaning-services-xyz.ondigitalocean.app`
- **Admin Panel:** `https://your-app.ondigitalocean.app/admin/dashboard`

## Step 4: Testing the Pipeline

1. **Make a change** in Replit (edit any file)
2. **Commit and push** to GitHub
3. **Watch automatic deployment** on DigitalOcean
4. **Verify live updates** on production URL

## Troubleshooting

**If Git sync fails:**
- Check GitHub permissions
- Verify Personal Access Token
- Use Replit's built-in Git integration

**If deployment fails:**
- Check build logs in DigitalOcean
- Verify environment variables
- Review app-platform-spec.yaml configuration

Your Panaroma cleaning services platform will have enterprise-grade CI/CD with this setup!