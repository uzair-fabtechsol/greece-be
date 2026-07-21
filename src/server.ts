import app from "@src/app";
import { env } from "@src/config/env";
import { connectDB } from "@src/config/db";

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};

startServer();
