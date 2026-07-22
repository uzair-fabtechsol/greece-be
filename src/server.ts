import { env } from "@src/config/env";
import { connectDB } from "@src/config/db";
import app from "@src/app";

// FUNCTION
const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};

startServer();
