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
    
    // Set up database with in-memory storage if MongoDB is not available
    try {
      console.log('Attempting to connect to MongoDB with URL (sensitive parts hidden):', 
        mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

      // Try to connect with standard options first (MongoDB Atlas recommended)
      await mongoose.connect(mongoUrl);

      console.log('MongoDB connection established successfully');
    } catch (initialError) {
      console.error('Initial MongoDB connection attempt failed, trying alternative options:', initialError.message);
      
      try {
        // Try a different connection approach if the first one fails - with explicit options
        await mongoose.connect(mongoUrl, {
          // Use the newer unified options format
          tls: true,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 10000
        });
        console.log('MongoDB connection established with alternative options');
      } catch (alternativeError) {
        console.error('Alternative MongoDB connection attempt also failed:', alternativeError.message);
        
        // Try one more time with minimum options
        try {
          await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 10000
          });
          console.log('MongoDB connection established with minimal options');
        } catch (finalError) {
          console.error('All MongoDB connection attempts failed:', finalError.message);
          throw new Error('Could not connect to MongoDB with any configuration');
        }
      }
    }
    
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