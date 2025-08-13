# .gitignore Configuration for Panaroma Project

## Files Excluded from GitHub Repository

### Replit-Specific Files (Excluded)
- `.replit` - Replit configuration file
- `.upm/` - Replit package manager cache
- `.config/` - Replit configuration directory
- `.cache/` - Replit cache files
- `.local/` - Local Replit data
- `*_cookies.txt` - Session cookie files
- `attached_assets/` - Development assets and screenshots

### Development Files (Excluded)
- `node_modules/` - npm dependencies (rebuilt on deployment)
- `.env*` - Environment variables with secrets
- `dist/` & `build/` - Build outputs (generated during deployment)
- `*.log` - Log files
- Coverage and test output directories

### IDE and OS Files (Excluded)
- `.vscode/`, `.idea/` - Editor configurations
- `.DS_Store` - macOS system files
- `Thumbs.db` - Windows system files

## Files Included in Repository

### Core Application
✅ `package.json` - Dependencies and scripts
✅ `server/` - Backend code
✅ `client/` - Frontend code
✅ `shared/` - Database schema and types
✅ `tsconfig.json` - TypeScript configuration

### Deployment Configuration
✅ `Dockerfile` - Docker configuration
✅ `app-platform-spec.yaml` - DigitalOcean configuration
✅ `.github/workflows/` - CI/CD pipeline
✅ `docker-compose.yml` - Container orchestration

### Documentation
✅ `README.md` - Project documentation
✅ `replit.md` - Project architecture
✅ Deployment guides and instructions

### Configuration Templates
✅ `production.env.example` - Environment template (without secrets)
✅ `drizzle.config.ts` - Database configuration
✅ `tailwind.config.ts` - Styling configuration

## Benefits of This .gitignore

1. **Security**: Excludes environment files with secrets
2. **Clean Repository**: Only includes essential code and configuration
3. **Platform Agnostic**: Excludes Replit-specific files for universal deployment
4. **Efficient Deployments**: Excludes large files that are regenerated
5. **Professional**: Follows industry standards for Node.js projects

## For CI/CD Pipeline

This configuration ensures your GitHub repository contains only the necessary files for:
- DigitalOcean App Platform deployment
- Docker containerization
- GitHub Actions CI/CD workflow
- Professional code sharing and collaboration

Your Panaroma cleaning services platform repository will be clean and deployment-ready!