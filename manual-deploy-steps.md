# Manual DigitalOcean Docker Deployment

## Step 1: Create Infrastructure

### Create Droplet via DigitalOcean Dashboard
1. Go to DigitalOcean dashboard
2. Click "Create" → "Droplets"
3. Choose:
   - **Image**: Docker on Ubuntu 20.04
   - **Size**: Basic plan, 2 GB RAM / 2 vCPUs ($12/month)
   - **Region**: New York 3 (or closest to your users)
   - **Authentication**: SSH keys (recommended) or password
   - **Hostname**: panaroma-app

### Create Managed PostgreSQL Database
1. Go to "Databases" in DigitalOcean dashboard
2. Click "Create Database Cluster"
3. Choose:
   - **Database Engine**: PostgreSQL 15
   - **Size**: Basic node, 1 GB RAM ($15/month)
   - **Region**: Same as your droplet
   - **Database name**: panaroma
   - **User**: panaroma_user

## Step 2: Configure Database

After database creation, you'll get connection details:
```
Host: your-db-host.db.ondigitalocean.com
Port: 25060
Database: panaroma
Username: panaroma_user
Password: generated-password
SSL Mode: require
```

Your DATABASE_URL will be:
```
postgresql://panaroma_user:your-password@your-db-host.db.ondigitalocean.com:25060/panaroma?sslmode=require
```

## Step 3: Deploy Application

### SSH into your droplet:
```bash
ssh root@your-droplet-ip
```

### Upload your application files:
```bash
# Create app directory
mkdir -p /app
cd /app

# You can either:
# Option A: Use git (if you have a repository)
git clone https://github.com/your-username/panaroma-app.git .

# Option B: Upload files via scp from your local machine
# scp -r . root@your-droplet-ip:/app/
```

### Create production environment file:
```bash
cat > .env.production << 'EOF'
NODE_ENV=production
JWT_SECRET=7aLLoc7Apiu3HETpnm5bniajafHKEZNwztXIaEWRHbM=
DATABASE_URL=postgresql://panaroma_user:YOUR_PASSWORD@YOUR_DB_HOST.db.ondigitalocean.com:25060/panaroma?sslmode=require
SUPERADMIN_EMAIL=admin@panaroma.qa
SUPERADMIN_PASSWORD=SuperAdmin123!@#
ADMIN_EMAIL=admin@panaroma.qa
ADMIN_PASSWORD=Admin123!@#
SUPER_ADMIN_EMAIL=superadmin@panaroma.qa
SUPER_ADMIN_PASSWORD=SuperAdmin123!@#
PORT=5000
HOST=0.0.0.0
EOF
```

### Build and run with Docker:
```bash
# Load environment variables
export $(cat .env.production | xargs)

# Build the Docker image
docker build -t panaroma-app .

# Run the container
docker run -d \
  --name panaroma-app \
  --env-file .env.production \
  -p 5000:5000 \
  --restart unless-stopped \
  panaroma-app

# Check if it's running
docker ps
docker logs panaroma-app
```

## Step 4: Set up Firewall

```bash
# Allow SSH, HTTP, and your app port
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 5000
ufw --force enable
```

## Step 5: Set up Reverse Proxy (Optional but Recommended)

### Install and configure Nginx:
```bash
apt update
apt install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/panaroma << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or droplet IP

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
ln -s /etc/nginx/sites-available/panaroma /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## Step 6: Set up SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Step 7: Database Migration

```bash
# SSH into your droplet and run database setup
docker exec -it panaroma-app npm run db:push
```

## Verification

Your app should now be accessible at:
- **HTTP**: http://your-droplet-ip:5000
- **With Nginx**: http://your-droplet-ip
- **With Domain**: http://your-domain.com

### Check health:
```bash
curl http://your-droplet-ip:5000/api/health
```

## Monitoring and Maintenance

### View logs:
```bash
docker logs -f panaroma-app
```

### Update application:
```bash
cd /app
git pull  # if using git
docker build -t panaroma-app .
docker stop panaroma-app
docker rm panaroma-app
docker run -d --name panaroma-app --env-file .env.production -p 5000:5000 --restart unless-stopped panaroma-app
```

### Backup database:
DigitalOcean Managed PostgreSQL includes automatic backups, but you can also create manual backups from the dashboard.

## Cost Summary
- **Droplet**: $12/month (2GB RAM, 2 vCPUs)
- **Managed PostgreSQL**: $15/month (1GB RAM)
- **Total**: ~$27/month

Your Panaroma app will be fully deployed with professional hosting infrastructure!