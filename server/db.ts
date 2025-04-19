import mongoose from 'mongoose';

// MongoDB connection
export const connectToDatabase = async () => {
  try {
    // Check for both possible environment variable names
    const mongoUri = process.env.MONGODB_URL || process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('MongoDB URL not found in environment variables (checked MONGODB_URL and MONGO_URI)');
      throw new Error('MongoDB URL not found');
    }
    
    // Log sanitized version of the URI (hide credentials)
    const sanitizedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log('MongoDB URI (sensitive parts hidden):', sanitizedUri);
    
    // Parse the connection string to extract credentials and host information
    let connectionHost = '';
    try {
      const url = new URL(mongoUri);
      connectionHost = url.hostname;
      console.log('Connecting to MongoDB host:', connectionHost);
    } catch (e) {
      console.error('Error parsing MongoDB URI:', e);
    }
    
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    // For Replit environment, we'll need to be more flexible with TLS
    console.log('Running in Replit environment - will attempt MongoDB connection...');
    
    try {
      // Simple connection first
      console.log('Connection attempt 1: Basic mongoose.connect()');
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected successfully on first attempt');
    } catch (error1) {
      console.error('First connection attempt failed:', (error1 as Error).message);
      
      try {
        // Convert mongodb+srv to mongodb protocol if using Atlas
        if (mongoUri.includes('mongodb+srv')) {
          console.log('Connection attempt 2: Using mongodb:// instead of mongodb+srv://');
          // Extract the hostname and database name
          const parsedUri = mongoUri.replace('mongodb+srv://', 'mongodb://');
          await mongoose.connect(parsedUri, {
            retryWrites: true,
            w: "majority"
          });
          console.log('✅ MongoDB connected successfully using mongodb:// protocol');
        } else {
          throw new Error('Not using mongodb+srv protocol');
        }
      } catch (error2) {
        console.error('Second connection attempt failed:', (error2 as Error).message);
        
        // The TLS errors likely indicate an issue with the TLS/SSL setup in Replit
        console.error('❌ Could not connect to MongoDB - TLS/SSL handshake issues detected');
        console.error('Falling back to in-memory storage');
        throw new Error('Could not connect to MongoDB - TLS/SSL issues');
      }
    }
    
    // Setup connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Application will continue with fallback storage');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
    process.on('SIGINT', async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed gracefully');
      }
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', (error as Error).message);
    throw error;
  }
};

export default connectToDatabase;