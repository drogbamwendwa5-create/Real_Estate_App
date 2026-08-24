const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Ensure aggregation indexes are created after connection
    try {
      const { runMigration } = require('../property-aggregation/database/migrations/001_create_aggregation_indexes');
      await runMigration();
    } catch (migrationErr) {
      console.warn('[DB] Aggregation index migration skipped:', migrationErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
