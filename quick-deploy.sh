#!/bin/bash

# Quick deployment script for Panaroma on DigitalOcean droplet
set -e

echo "🚀 Panaroma Quick Deploy Script"
echo "================================"

# Check if we're running on a DigitalOcean droplet
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Make sure you're running this on a Docker-enabled droplet."
    exit 1
fi

# Create app directory
echo "📁 Setting up application directory..."
mkdir -p /app
cd /app

# Create production environment file with placeholder for DATABASE_URL
echo "⚙️ Creating environment configuration..."
cat > .env.production << 'EOF'
NODE_ENV=production
JWT_SECRET=7aLLoc7Apiu3HETpnm5bniajafHKEZNwztXIaEWRHbM=
DATABASE_URL=postgresql://panaroma_user:REPLACE_WITH_YOUR_PASSWORD@REPLACE_WITH_YOUR_HOST.db.ondigitalocean.com:25060/panaroma?sslmode=require
SUPERADMIN_EMAIL=admin@panaroma.qa
SUPERADMIN_PASSWORD=SuperAdmin123!@#
ADMIN_EMAIL=admin@panaroma.qa
ADMIN_PASSWORD=Admin123!@#
SUPER_ADMIN_EMAIL=superadmin@panaroma.qa
SUPER_ADMIN_PASSWORD=SuperAdmin123!@#
PORT=5000
HOST=0.0.0.0
EOF

echo "📝 Environment file created at .env.production"
echo "⚠️  IMPORTANT: You must edit .env.production and replace DATABASE_URL with your actual PostgreSQL connection string from DigitalOcean!"

# Build and run the application (this will happen after you upload your code)
echo "🐳 Docker commands ready. After uploading your code, run:"
echo ""
echo "1. docker build -t panaroma-app ."
echo "2. docker run -d --name panaroma-app --env-file .env.production -p 5000:5000 --restart unless-stopped panaroma-app"
echo ""

# Set up firewall
echo "🔒 Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    ufw allow 5000
    ufw --force enable
    echo "✅ Firewall configured"
else
    echo "⚠️  UFW not found, please configure firewall manually"
fi

# Install Nginx for reverse proxy
echo "🌐 Installing Nginx..."
apt update
apt install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/panaroma << 'EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/panaroma /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx configured and running"

# Get droplet IP
DROPLET_IP=$(curl -s http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address)

echo ""
echo "🎉 Deployment setup complete!"
echo "================================"
echo ""
echo "📋 Next steps:"
echo "1. Upload your application code to /app/"
echo "2. Edit /app/.env.production with your actual DATABASE_URL"
echo "3. Build and run: docker build -t panaroma-app . && docker run -d --name panaroma-app --env-file .env.production -p 5000:5000 --restart unless-stopped panaroma-app"
echo "4. Run database migration: docker exec -it panaroma-app npm run db:push"
echo ""
echo "🔗 Your app will be available at:"
echo "   Direct: http://$DROPLET_IP:5000"
echo "   Via Nginx: http://$DROPLET_IP"
echo ""
echo "🔍 Check health: curl http://$DROPLET_IP:5000/api/health"
echo "📊 View logs: docker logs -f panaroma-app"