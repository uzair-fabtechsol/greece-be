import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  APP_NAME: z.string().min(1),
  MONGO_DB_CONNECTION_STRING: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", z.flattenError(parsedEnv.error).fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
