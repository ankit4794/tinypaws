import mongoose from 'mongoose';

// Parse MongoDB URI to extract credentials and other components
function parseMongoUri(uri: string) {
  try {
    // Extract sensitive parts before logging
    const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log('Parsed MongoDB URI (sensitive parts hidden):', sanitizedUri);
    
    // Extract database name
    const dbName = uri.split('/').pop()?.split('?')[0];
    
    return {
      uri: sanitizedUri,
      dbName
    };
  } catch (error) {
    console.error('Error parsing MongoDB URI:', error);
    return { uri: 'invalid' };
  }
}

// MongoDB connection with retries and fallback options
export const connectToDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL;
    
    if (!mongoUri) {
      console.error('MongoDB URL not found in environment variables');
      throw new Error('MongoDB URL not found');
    }
    
    // Parse the MongoDB URI
    const { uri } = parseMongoUri(mongoUri);
    
    console.log('Connecting to MongoDB...');
    
    // Attempt 1: Connect with simplest options
    try {
      console.log('Connection attempt 1: Using default settings');
      mongoose.set('strictQuery', false);
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully on first attempt');
      return mongoose.connection;
    } catch (error) {
      console.error('First connection attempt failed:', (error as Error).message);
      
      // Attempt 2: Try with specific connection options for Atlas
      try {
        console.log('Connection attempt 2: Using explicit Atlas settings');
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 15000,
          socketTimeoutMS: 30000,
          connectTimeoutMS: 15000,
          maxPoolSize: 10
        });
        console.log('MongoDB connected successfully on second attempt');
        return mongoose.connection;
      } catch (error) {
        console.error('Second connection attempt failed:', (error as Error).message);
        
        // Attempt 3: Try with most basic TLS settings
        try {
          console.log('Connection attempt 3: Using basic TLS settings');
          await mongoose.connect(mongoUri, {
            tls: true,
            tlsAllowInvalidCertificates: true,
            serverSelectionTimeoutMS: 15000
          });
          console.log('MongoDB connected successfully on third attempt');
          return mongoose.connection;
        } catch (error) {
          console.error('Third connection attempt failed:', (error as Error).message);
          
          // Attempt 4: Try with SSL settings for older MongoDB drivers
          try {
            console.log('Connection attempt 4: Using legacy SSL settings');
            await mongoose.connect(mongoUri.replace('mongodb+srv', 'mongodb'), {
              ssl: true,
              sslValidate: false,
              serverSelectionTimeoutMS: 15000,
              maxPoolSize: 5
            });
            console.log('MongoDB connected successfully on fourth attempt');
            return mongoose.connection;
          } catch (error) {
            console.error('Fourth connection attempt failed:', (error as Error).message);
            throw new Error('Could not connect to MongoDB with any configuration');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  } finally {
    // Setup connection event handlers regardless of connection success
    // These will be applicable if we connect later
    
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Application will continue with fallback storage');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
    process.on('SIGINT', async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed gracefully');
      }
      process.exit(0);
    });
  }
};

export default connectToDatabase;