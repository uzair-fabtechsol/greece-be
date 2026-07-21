import mongoose from "mongoose";
import { env } from "@src/config/env";

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(env.MONGO_DB_CONNECTION_STRING);
  console.log("Database connected successfully");
};
