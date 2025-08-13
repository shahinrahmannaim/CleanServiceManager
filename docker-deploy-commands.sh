#!/bin/bash

# Commands to run on the DigitalOcean droplet after creation
echo "🐳 Setting up Docker deployment on DigitalOcean droplet..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git python3-pip

# Install Docker Compose if not already installed
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone or upload your application code
# git clone https://github.com/your-username/panaroma-app.git
# cd panaroma-app

# Create production environment file
cat > .env.production << EOF
NODE_ENV=production
JWT_SECRET=7aLLoc7Apiu3HETpnm5bniajafHKEZNwztXIaEWRHbM=
DATABASE_URL=\${DATABASE_URL}
SUPERADMIN_EMAIL=admin@panaroma.qa
SUPERADMIN_PASSWORD=SuperAdmin123!@#
ADMIN_EMAIL=admin@panaroma.qa
ADMIN_PASSWORD=Admin123!@#
SUPER_ADMIN_EMAIL=superadmin@panaroma.qa
SUPER_ADMIN_PASSWORD=SuperAdmin123!@#
EOF

# Build and start the application
echo "🚀 Building and starting Panaroma application..."
docker-compose up -d --build

# Show running containers
docker-compose ps

# Show application logs
echo "📋 Application logs:"
docker-compose logs -f --tail=50

echo "✅ Deployment complete!"
echo "🌐 Your application should be running on port 5000"
echo "🔗 Access it at: http://YOUR_DROPLET_IP:5000"