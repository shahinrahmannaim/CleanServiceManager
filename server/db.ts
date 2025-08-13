import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon with Node.js 18+ compatibility
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with error handling for Node.js 18+ compatibility and connection warming
let pool: Pool;
let db: any;

try {
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000, // 30 seconds
    connectionTimeoutMillis: 30000, // 30 seconds
  });

  db = drizzle({ client: pool, schema });

  // Test connection with error handling
  pool.on('error', (err: Error) => {
    console.error('Database pool error (handled):', err.message);
    // Don't crash the app - let it continue and retry connections
  });

  // Connection warming function to prevent cold starts
  const warmConnection = async () => {
    try {
      await pool.query('SELECT 1 as health_check');
      console.log('Database connection warmed successfully');
    } catch (error) {
      console.error('Database warming failed (will retry):', (error as Error).message);
    }
  };

  // Warm connection on startup
  warmConnection();

  // Keep connection warm every 5 minutes to prevent cold starts
  setInterval(warmConnection, 5 * 60 * 1000);

} catch (error) {
  console.error('Database initialization error:', error);
  // Create a fallback that won't crash the app
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 15000,
  });
  db = drizzle({ client: pool, schema });
}

// Enhanced query function with retry logic for serverless connections
export const dbWithRetry = {
  async query(sql: string, params?: any[]) {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (params) {
          return await pool.query(sql, params);
        } else {
          return await pool.query(sql);
        }
      } catch (error) {
        lastError = error;
        const err = error as Error;
        
        // Retry on connection timeout or WebSocket closure
        if (err.message.includes('timeout') || err.message.includes('WebSocket') || err.message.includes('terminated')) {
          console.warn(`Database connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
          if (attempt < maxRetries) {
            // Wait with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }
        
        // For other errors, throw immediately
        throw error;
      }
    }
    
    throw lastError;
  }
};

export { pool, db };