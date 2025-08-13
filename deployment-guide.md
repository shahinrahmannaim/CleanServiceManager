# Panaroma DigitalOcean Deployment Guide

## Quick Deployment Options

### Option 1: DigitalOcean App Platform (Recommended) ⭐

**Advantages:**
- Automatic scaling and load balancing
- Built-in SSL certificates
- Easy database integration
- GitHub integration for automatic deployments
- No server management required

**Steps:**
1. Push your code to a GitHub repository
2. Connect DigitalOcean App Platform to your GitHub repo
3. Use the `app-platform-spec.yaml` configuration
4. Set environment variables in the App Platform dashboard
5. Deploy automatically

### Option 2: Docker Droplet 🐳

**Advantages:**
- Full control over the server
- Cost-effective for small applications
- Easy to scale manually

**Steps:**
1. Run the deployment script: `bash scripts/deploy-digitalocean.sh`
2. SSH into the created droplet
3. Upload your Docker files
4. Run `docker-compose up -d`

### Option 3: Traditional Node.js Droplet 🖥️

**Advantages:**
- Maximum control and customization
- Direct access to all server features
- Good for complex configurations

## Required Environment Variables

```bash
# Security
JWT_SECRET=your-secure-jwt-secret-here
DATABASE_URL=postgresql://username:password@host:port/database

# Admin Credentials
SUPERADMIN_EMAIL=admin@panaroma.qa
SUPERADMIN_PASSWORD=your-secure-password
ADMIN_EMAIL=admin@panaroma.qa
ADMIN_PASSWORD=your-secure-password

# Production Settings
NODE_ENV=production
```

## Database Setup

### Managed PostgreSQL (Recommended)
- Automatic backups
- High availability
- Monitoring included
- Easy scaling

### Self-hosted PostgreSQL
- More cost-effective
- Requires manual maintenance
- Full control over configuration

## Security Checklist

- ✅ Strong JWT secret (32+ characters)
- ✅ Secure admin passwords
- ✅ HTTPS enabled (automatic with App Platform)
- ✅ Database credentials secured
- ✅ Firewall configured (automatic with App Platform)
- ✅ Regular backups enabled

## Monitoring & Maintenance

### Health Checks
- App health endpoint: `/api/health`
- Database connection monitoring
- Performance metrics

### Logs
- Application logs in App Platform dashboard
- Database query logs
- Error tracking and alerting

## Cost Estimation

### App Platform (Recommended)
- Basic tier: ~$12/month
- Professional tier: ~$25/month
- Database: ~$15/month
- **Total: ~$27-40/month**

### Droplet + Managed DB
- 2GB Droplet: ~$12/month
- Managed PostgreSQL: ~$15/month
- **Total: ~$27/month**

## Next Steps

1. **Choose your deployment method**
2. **Set up your GitHub repository** (for App Platform)
3. **Configure environment variables**
4. **Deploy and test**
5. **Set up monitoring and alerts**

## Support

For deployment assistance:
- DigitalOcean Documentation
- Community Forums
- App Platform Support