import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectToDatabase = async () => {
  const mongoUri = process.env.MONGODB_URL;

  if (!mongoUri) {
    console.error("❌ MongoDB URL not found in environment variables");
    throw new Error("MongoDB URL not found");
  }

  const sanitizedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log("MongoDB URI (sensitive parts hidden):", sanitizedUri);

  try {
    console.log("Attempting connection to MongoDB...");

    // Don't pass TLS/SSL options unless absolutely needed
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // optional, just for faster failure
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected");
  });

  process.on("SIGINT", async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("🛑 MongoDB connection closed gracefully");
    }
    process.exit(0);
  });

  return mongoose.connection;
};

export default connectToDatabase;
