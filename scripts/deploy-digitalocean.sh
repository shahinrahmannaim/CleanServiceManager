#!/bin/bash

# DigitalOcean Deployment Script for Panaroma
set -e

echo "🚀 Starting DigitalOcean deployment for Panaroma..."

# Check if API token is available
if [ -z "$DIGITALOCEAN_API_TOKEN" ]; then
    echo "❌ Error: DIGITALOCEAN_API_TOKEN not found"
    exit 1
fi

# Generate secure JWT secret if not provided
if [ -z "$JWT_SECRET" ]; then
    export JWT_SECRET=$(openssl rand -base64 32)
    echo "✅ Generated JWT_SECRET: $JWT_SECRET"
fi

# Create droplet with Docker pre-installed
echo "📦 Creating DigitalOcean droplet..."
DROPLET_NAME="panaroma-app-$(date +%Y%m%d)"
REGION="nyc3"
SIZE="s-2vcpu-2gb"
IMAGE="docker-20-04"

# Create droplet using DigitalOcean API
DROPLET_ID=$(curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DIGITALOCEAN_API_TOKEN" \
  -d '{
    "name": "'$DROPLET_NAME'",
    "region": "'$REGION'",
    "size": "'$SIZE'",
    "image": "'$IMAGE'",
    "ssh_keys": [],
    "backups": false,
    "ipv6": true,
    "user_data": null,
    "private_networking": null,
    "volumes": null,
    "tags": ["panaroma", "web-app"]
  }' \
  "https://api.digitalocean.com/v2/droplets" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['droplet']['id'])")

echo "✅ Droplet created with ID: $DROPLET_ID"

# Wait for droplet to be active
echo "⏳ Waiting for droplet to become active..."
while true; do
    STATUS=$(curl -s -H "Authorization: Bearer $DIGITALOCEAN_API_TOKEN" \
        "https://api.digitalocean.com/v2/droplets/$DROPLET_ID" | \
        python3 -c "import sys, json; print(json.load(sys.stdin)['droplet']['status'])")
    
    if [ "$STATUS" = "active" ]; then
        break
    fi
    echo "Status: $STATUS - waiting..."
    sleep 10
done

# Get droplet IP
DROPLET_IP=$(curl -s -H "Authorization: Bearer $DIGITALOCEAN_API_TOKEN" \
    "https://api.digitalocean.com/v2/droplets/$DROPLET_ID" | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['droplet']['networks']['v4'][0]['ip_address'])")

echo "✅ Droplet is active at IP: $DROPLET_IP"

# Create managed PostgreSQL database
echo "🗄️ Creating managed PostgreSQL database..."
DB_CLUSTER_NAME="panaroma-db-$(date +%Y%m%d)"

DB_CLUSTER_ID=$(curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DIGITALOCEAN_API_TOKEN" \
  -d '{
    "name": "'$DB_CLUSTER_NAME'",
    "engine": "pg",
    "version": "15",
    "region": "'$REGION'",
    "size": "db-s-1vcpu-1gb",
    "num_nodes": 1,
    "tags": ["panaroma", "database"]
  }' \
  "https://api.digitalocean.com/v2/databases" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['database']['id'])")

echo "✅ Database cluster created with ID: $DB_CLUSTER_ID"

echo "🎉 Infrastructure setup complete!"
echo "📋 Next steps:"
echo "1. Droplet IP: $DROPLET_IP"
echo "2. Database ID: $DB_CLUSTER_ID"
echo "3. Use the app platform deployment for easier management"
echo ""
echo "🔗 Access your app at: http://$DROPLET_IP:5000"