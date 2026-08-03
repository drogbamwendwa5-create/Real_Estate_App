const axios = require('axios');
const cheerio = require('cheerio');
const PropertyNormalizer = require('./property-aggregation/utils/PropertyNormalizer');
const AggregatedProperty = require('./property-aggregation/database/AggregatedProperty');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const listingsToImport = [
  'https://www.buyrentkenya.com/listings/4-bedroom-apartment-for-sale-westlands-area-4036781',
  'https://www.buyrentkenya.com/listings/1-bedroom-apartment-for-sale-lavington-4036812',
  'https://www.buyrentkenya.com/listings/studio-apartment-for-sale-lavington-4036810',
  'https://www.buyrentkenya.com/listings/furnished-7-m2-office-for-rent-westlands-area-4036814',
  'https://www.buyrentkenya.com/listings/3-bedroom-apartment-for-rent-westlands-area-4036813',
  'https://www.buyrentkenya.com/listings/furnished-7-m2-office-for-rent-westlands-area-4036809',
];

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB Connected\n');

    console.log(`Found ${listingsToImport.length} listings to import from BuyRent\n`);

    let imported = 0;
    let updated = 0;
    let failed = 0;

    for (const url of listingsToImport) {
      try {
        console.log(`Fetching: ${url}`);

        const h = await axios.get(url, { timeout: 15000 });
        const $ = cheerio.load(h.data);

        const title = $('h1').first().text().trim();
        const priceText = $('body').text().match(/KSh[^\n]{0,20}|KES[^\n]{0,20}|\b\d{1,3}(,\d{3})+(\.\d+)?\b/);

        const normalized = PropertyNormalizer.normalize({
          title,
          price: priceText ? priceText[0] : '0',
          listingType: 'for-sale',
          sourceURL: url,
          sourceID: url.split('/').pop() || '',
        }, 'buyrent');

        console.log(`  Title: ${normalized.title.substring(0, 50)}...`);
        console.log(`  Price: ${normalized.price}`);
        console.log(`  Ranking: ${normalized.rankingScore}`);

        // Check if property already exists
        const existing = await AggregatedProperty.findOne({ propertyID: normalized.propertyID });

        if (existing) {
          console.log(`  -> Updating existing property...`);
          await AggregatedProperty.findOneAndUpdate(
            { propertyID: normalized.propertyID },
            normalized,
            { new: true, runValidators: true }
          );
          updated++;
        } else {
          console.log(`  -> Importing new property...`);
          await AggregatedProperty.create(normalized);
          imported++;
        }

        console.log('');
      } catch (err) {
        console.error(`  -> Error: ${err.message}`);
        failed++;
      }
    }

    console.log('=== Import Summary ===');
    console.log(`Imported: ${imported}`);
    console.log(`Updated: ${updated}`);
    console.log(`Failed: ${failed}`);

    const total = await AggregatedProperty.countDocuments();
    console.log(`\nTotal properties in database: ${total}`);

    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (err) {
    console.error('\nError:', err.message);
    console.error('Make sure MongoDB is running and MONGODB_URI is set correctly in .env');
    process.exit(1);
  }
})();
