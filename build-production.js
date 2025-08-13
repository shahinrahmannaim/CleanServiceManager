#!/usr/bin/env node

// Production build script that avoids vite dependencies in server code
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏗️  Building Panaroma for production...');

try {
  // Step 1: Build frontend with vite
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Step 2: Copy built files to server/public
  console.log('📂 Moving build files...');
  const distPath = './dist';
  const publicPath = './server/public';
  
  // Remove existing public directory
  if (fs.existsSync(publicPath)) {
    fs.rmSync(publicPath, { recursive: true });
  }
  
  // Copy dist to server/public
  fs.cpSync(distPath, publicPath, { recursive: true });
  
  // Step 3: Build server code (TypeScript compilation only)
  console.log('⚙️  Building server...');
  execSync('npx tsc server/index.ts server/production.ts server/routes.ts --outDir dist --target es2022 --module esnext --moduleResolution bundler --skipLibCheck --allowImportingTsExtensions false', { stdio: 'inherit' });
  
  // Step 4: Copy other necessary files
  console.log('📋 Copying additional files...');
  
  // Copy server directory structure
  const serverFiles = [
    'server/db.ts',
    'server/services',
    'shared'
  ];
  
  for (const file of serverFiles) {
    if (fs.existsSync(file)) {
      const destPath = path.join('dist', path.basename(file));
      if (fs.lstatSync(file).isDirectory()) {
        fs.cpSync(file, destPath, { recursive: true });
      } else {
        fs.copyFileSync(file, destPath);
      }
    }
  }
  
  console.log('✅ Production build complete!');
  console.log('');
  console.log('To start production server:');
  console.log('NODE_ENV=production node dist/index.js');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}