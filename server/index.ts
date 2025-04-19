import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import connectToDatabase from "./db";
import { MongoDBStorage } from './mongodb-storage';
import { MemStorage, type IStorage } from './storage';

// Create a storage provider that properly handles both MongoDB and in-memory storage
class StorageProvider {
  private _instance: IStorage | null = null;
  private _initialized: boolean = false;
  private _initializing: boolean = false;
  private _initPromise: Promise<void> | null = null;
  
  constructor() {
    // Default to in-memory storage to allow the app to function immediately
    this._instance = new MemStorage();
    console.log('Created initial in-memory storage instance');
  }
  
  async initialize(): Promise<void> {
    if (this._initialized || this._initializing) {
      return this._initPromise;
    }
    
    this._initializing = true;
    
    this._initPromise = new Promise<void>(async (resolve) => {
      try {
        console.log('Attempting to connect to MongoDB...');
        const mongoConnection = await connectToDatabase();
        
        if (mongoConnection && mongoConnection.readyState === 1) {
          console.log('MongoDB connected successfully, switching to MongoDB storage');
          this._instance = new MongoDBStorage();
          
          // Set up reconnection handling
          mongoConnection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Application will continue with in-memory fallback');
            this._instance = new MemStorage();
          });
          
          mongoConnection.on('reconnected', () => {
            console.log('MongoDB reconnected. Switching back to MongoDB storage');
            this._instance = new MongoDBStorage();
          });
          
          // Initialize admin user in MongoDB
          try {
            console.log('Checking for admin user...');
            const adminUser = await this._instance.getUserByUsername('admin');
            
            if (!adminUser) {
              console.log('Creating initial admin user...');
              await this._instance.createUser({
                username: 'admin',
                password: 'Admin@123', // This will be hashed in the storage implementation
                email: 'admin@tinypaws.com',
                mobile: '9876543210',
                role: 'admin'
              });
              console.log('Admin user created successfully');
            } else {
              console.log('Admin user already exists');
            }
          } catch (userError) {
            console.error('Error managing admin user:', userError);
          }
        } else {
          console.warn('MongoDB connection not ready, continuing with in-memory storage');
        }
      } catch (error) {
        console.error('Failed to connect to MongoDB, using in-memory storage:', error);
        // Keep using the in-memory storage that was already created
      } finally {
        this._initialized = true;
        this._initializing = false;
        resolve();
      }
    });
    
    return this._initPromise;
  }
  
  get instance(): IStorage {
    if (!this._instance) {
      console.warn('Storage accessed before initialization, using in-memory storage');
      this._instance = new MemStorage();
    }
    return this._instance;
  }
}

// Export a singleton instance of the storage provider
export const storageProvider = new StorageProvider();

// Initialize storage asynchronously
storageProvider.initialize().catch(err => {
  console.error('Storage initialization failed:', err);
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
