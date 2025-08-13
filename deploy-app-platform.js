#!/usr/bin/env node

// DigitalOcean App Platform Deployment Script
import https from 'https';

const DIGITALOCEAN_API_TOKEN = process.env.DIGITALOCEAN_API_TOKEN;

if (!DIGITALOCEAN_API_TOKEN) {
  console.error('❌ DIGITALOCEAN_API_TOKEN environment variable is required');
  process.exit(1);
}

const appSpec = {
  name: 'panaroma-cleaning-services',
  region: 'nyc',
  services: [
    {
      name: 'web',
      source_dir: '/',
      github: {
        repo: 'panaroma-app',
        branch: 'main',
        deploy_on_push: true
      },
      build_command: 'npm run build',
      run_command: 'npm start',
      environment_slug: 'node-js',
      instance_count: 1,
      instance_size_slug: 'basic-xxs',
      health_check: {
        http_path: '/api/health',
        initial_delay_seconds: 60,
        period_seconds: 10,
        timeout_seconds: 5,
        failure_threshold: 3,
        success_threshold: 1
      },
      http_port: 5000,
      envs: [
        {
          key: 'NODE_ENV',
          value: 'production'
        },
        {
          key: 'JWT_SECRET',
          value: '7aLLoc7Apiu3HETpnm5bniajafHKEZNwztXIaEWRHbM=',
          type: 'SECRET'
        },
        {
          key: 'SUPERADMIN_EMAIL',
          value: 'admin@panaroma.qa'
        },
        {
          key: 'SUPERADMIN_PASSWORD',
          value: 'SuperAdmin123!@#',
          type: 'SECRET'
        },
        {
          key: 'ADMIN_EMAIL',
          value: 'admin@panaroma.qa'
        },
        {
          key: 'ADMIN_PASSWORD',
          value: 'Admin123!@#',
          type: 'SECRET'
        }
      ]
    }
  ],
  databases: [
    {
      name: 'panaroma-db',
      engine: 'PG',
      version: '15',
      production: true,
      cluster_name: 'panaroma-db-cluster',
      db_name: 'panaroma',
      db_user: 'panaroma_user'
    }
  ]
};

console.log('🚀 Creating DigitalOcean App Platform deployment...');

const postData = JSON.stringify({ spec: appSpec });

const options = {
  hostname: 'api.digitalocean.com',
  port: 443,
  path: '/v2/apps',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DIGITALOCEAN_API_TOKEN}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 201) {
        console.log('✅ App Platform deployment created successfully!');
        console.log(`📋 App ID: ${response.app.id}`);
        console.log(`🔗 App URL: https://${response.app.default_ingress}`);
        console.log('');
        console.log('📱 Next steps:');
        console.log('1. Connect your GitHub repository in the App Platform dashboard');
        console.log('2. The database connection will be automatically configured');
        console.log('3. Your app will be deployed with SSL and monitoring');
        console.log('');
        console.log('💰 Estimated cost: ~$27-40/month');
      } else {
        console.error('❌ Deployment failed:');
        console.error(JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.error('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();