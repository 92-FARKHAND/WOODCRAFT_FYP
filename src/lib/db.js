import mongoose from "mongoose";
import { seedAdmin } from "./initialSeed";

const MONGO_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/woodcraft";

if (!MONGO_URI) {
  throw new Error("Please define DATABASE_URL in .env");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, seedingAttempted: false };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000, // 10 seconds timeout
    };

    console.log("Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGO_URI, opts)
      .then(async (mongoose) => {
        console.log("Connected to MongoDB successfully");
        
        // Run initial seed if not already attempted in this instance
        if (!cached.seedingAttempted) {
          cached.seedingAttempted = true;
          await seedAdmin();
        }
        
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        cached.promise = null; // Reset promise so we can retry
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default dbConnect;