require('dotenv').config(); // Load environment variables

const config = {
  mongodb: {
    url: process.env.MONGODB_URI, // Use MONGODB_URI from .env
    databaseName: process.env.MONGODB_DB_NAME || "YourDatabaseNameFromURI", // You might want to explicitly set MONGODB_DB_NAME in your .env
    options: {
      useNewUrlParser: true, // Recommended in older versions, might still be needed depending on driver
      useUnifiedTopology: true, // Recommended in older versions, might still be needed depending on driver
      // You can add other options here
    }
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  lockCollectionName: "changelog_lock",
  lockTtl: 0,
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;