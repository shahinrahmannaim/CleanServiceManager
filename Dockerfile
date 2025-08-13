# Use Node.js 20 LTS
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache curl python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S panaroma -u 1001
USER panaroma

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "start"]