# Deploy Panaroma to DigitalOcean

## Prerequisites for DigitalOcean Deployment

### 1. DigitalOcean Account Setup
You need a DigitalOcean account with:
- **API Token** - For automated deployments
- **SSH Key** - For server access
- **Domain Name** (optional) - For custom domain

### 2. Database Setup
Choose one option:
- **DigitalOcean Managed PostgreSQL** (recommended)
- **Self-hosted PostgreSQL** on a droplet

### 3. Required Environment Variables
You'll need to provide these secrets:

#### Database Credentials
- `DATABASE_URL` - PostgreSQL connection string
  Format: `postgresql://username:password@host:port/database`

#### Security Secrets
- `JWT_SECRET` - Strong random string for JWT tokens (generate with: `openssl rand -base64 32`)

#### Admin Credentials
- `SUPERADMIN_EMAIL` - Super admin email
- `SUPERADMIN_PASSWORD` - Super admin password
- `ADMIN_EMAIL` - Regular admin email  
- `ADMIN_PASSWORD` - Regular admin password

## Deployment Options

### Option 1: DigitalOcean App Platform (Recommended)
1. Push code to GitHub repository
2. Connect DigitalOcean App Platform to your GitHub repo
3. Configure environment variables
4. Deploy automatically

### Option 2: Docker Droplet
1. Create a new droplet with Docker pre-installed
2. Upload your code and Docker files
3. Run `docker-compose up -d`

### Option 3: Node.js Droplet
1. Create a new droplet with Node.js
2. Upload your code
3. Install dependencies and start the app

## What I Need From You

To proceed with deployment, please provide:

1. **Which deployment method do you prefer?** (App Platform, Docker Droplet, or Node.js Droplet)

2. **Database choice:**
   - Use DigitalOcean Managed PostgreSQL (I'll help set this up)
   - Provide your own PostgreSQL DATABASE_URL

3. **Security tokens:**
   - JWT_SECRET (I can generate this for you)
   - Admin login credentials you want to use

4. **DigitalOcean credentials:**
   - API Token (from DigitalOcean dashboard)
   - SSH Key (if using droplets)

Let me know your preferences and I'll guide you through the complete setup!