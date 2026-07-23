import { config as loadEnv } from "dotenv";

loadEnv();

const config = {
  mongodb: {
    url: process.env.MONGO_DB_CONNECTION_STRING as string,
    options: {},
  },

  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".ts",
  useFileHash: false,
  moduleSystem: "commonjs",
};

module.exports = config;
