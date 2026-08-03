const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const AggregatedProperty = require('./property-aggregation/database/AggregatedProperty');

dotenv.config({ path: path.join(__dirname, '.env') });

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const count = await AggregatedProperty.countDocuments();
    console.log(`\nTotal properties in database: ${count}`);

    if (count > 0) {
      const recent = await AggregatedProperty.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      console.log('\nRecent properties:');
      recent.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.title} (${p.price} ${p.currency}) from ${p.sourceName}`);
        console.log(`     ID: ${p.propertyID}`);
        console.log(`     Ranking: ${p.rankingScore}`);
        console.log(`     Category: ${p.sourceCategory}`);
        console.log(`     Verified: ${p.verifiedStatus}`);
      });
    } else {
      console.log('\nNo properties found in database.');
      console.log('Run the aggregator to import listings:');
      console.log('  node test-import.js');
    }

    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (err) {
    console.error('\nError:', err.message);
    console.error('Make sure MongoDB is running and MONGODB_URI is set correctly in .env');
    process.exit(1);
  }
})();
