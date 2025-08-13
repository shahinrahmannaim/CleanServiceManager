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

// Create pool with error handling for Node.js 18+ compatibility
let pool: Pool;
let db: any;

try {
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  db = drizzle({ client: pool, schema });

  // Test connection with error handling
  pool.on('error', (err: Error) => {
    console.error('Database pool error (handled):', err.message);
    // Don't crash the app - let it continue and retry connections
  });

} catch (error) {
  console.error('Database initialization error:', error);
  // Create a fallback that won't crash the app
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
  });
  db = drizzle({ client: pool, schema });
}

export { pool, db };