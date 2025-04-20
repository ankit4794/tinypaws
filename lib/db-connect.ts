import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URL || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URL environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    mongoose.set('strictQuery', false);

    console.log(`Attempting connection to MongoDB...`);
    const mongoURI = MONGODB_URI;
    // Hide sensitive parts in logs
    const hiddenURI = mongoURI.replace(/:([^:@]+)@/, ':***@');
    console.log(`MongoDB URI (sensitive parts hidden): ${hiddenURI}`);

    cached.promise = mongoose.connect(mongoURI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;