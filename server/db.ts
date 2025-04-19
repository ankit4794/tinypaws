import mongoose from 'mongoose';

// MongoDB connection
export const connectToDatabase = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    
    if (!mongoUrl) {
      console.error('MongoDB URL not found in environment variables');
      throw new Error('MongoDB URL not found');
    }
    
    console.log('Connecting to MongoDB...');
    
    // Connect with MongoDB URL from environment
    await mongoose.connect(mongoUrl);
    
    console.log('MongoDB connection established successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default connectToDatabase;