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
    
    console.log('Connecting to MongoDB...');
    
    // Log sanitized version of the URI (hide credentials)
    const sanitizedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log('MongoDB URI (sensitive parts hidden):', sanitizedUri);
    
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    // Try to connect with recommended options for mongoose 7.x
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    
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