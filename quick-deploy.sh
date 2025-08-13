#!/bin/bash

# Panaroma Cleaning Services - Quick Deployment Script
# This script prepares your code for deployment to DigitalOcean

echo "🚀 Preparing Panaroma for deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Create commit
echo "💾 Creating deployment commit..."
git commit -m "Fix production deployment - resolve vite import errors

- Fixed conditional imports for development/production
- Added production static file serving
- Optimized Docker configuration for App Platform
- Ready for DigitalOcean deployment with managed PostgreSQL"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding GitHub remote..."
    echo "Please run: git remote add origin https://github.com/shahinrahmannaim/CleanServiceManager.git"
fi

echo "✅ Code prepared for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub: git push -u origin main"
echo "2. Go to: https://cloud.digitalocean.com/apps"
echo "3. Create app from repository: shahinrahmannaim/CleanServiceManager"
echo "4. Add PostgreSQL database component"
echo "5. Deploy and go live!"
echo ""
echo "💰 Expected cost: ~$27-40/month for professional hosting"
echo "🌐 Your app will be live at: https://panaroma-services.ondigitalocean.app"