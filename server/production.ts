import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  // Try multiple possible paths for static files
  const possiblePaths = [
    path.resolve(process.cwd(), "server", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "dist"),
    path.resolve(process.cwd(), "public")
  ];

  let distPath: string | null = null;
  
  // Find the first existing path
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, "index.html"))) {
      distPath = testPath;
      log(`Found static files at: ${distPath}`, "production");
      break;
    }
  }

  if (!distPath) {
    log(`Warning: Could not find static files in any of these paths:`, "production");
    possiblePaths.forEach(p => log(`  - ${p}`, "production"));
    
    // Create a fallback response instead of crashing
    app.use("*", (_req, res) => {
      res.status(404).json({ 
        error: "Static files not found", 
        message: "Frontend build files are missing. Please check deployment configuration.",
        searchedPaths: possiblePaths
      });
    });
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath!, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ 
        error: "Index file not found", 
        message: "index.html is missing from static files",
        distPath 
      });
    }
  });
}