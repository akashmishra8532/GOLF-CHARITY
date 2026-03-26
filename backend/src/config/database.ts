import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.mongoUri, {
    dbName: process.env.MONGODB_DB_NAME ?? undefined,
  });
}

