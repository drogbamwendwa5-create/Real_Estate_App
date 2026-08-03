const PropertyAggregatorService = require('./property-aggregation/services/PropertyAggregatorService');
const AggregatedProperty = require('./property-aggregation/database/AggregatedProperty');

(async () => {
  try {
    console.log('Starting aggregator...');
    const svc = new PropertyAggregatorService();

    console.log('\n=== Scraping ===');
    const scrapeResults = await svc.aggregateAllSources();
    console.log('\n=== Scrape Results ===');
    console.log(JSON.stringify(scrapeResults, null, 2));

    console.log('\n=== Checking Database ===');
    const count = await AggregatedProperty.countDocuments();
    console.log(`Total properties in database: ${count}`);

    const recent = await AggregatedProperty.find({}).sort({ createdAt: -1 }).limit(10).lean();
    console.log('\nRecent properties:');
    recent.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} (${p.price} ${p.currency}) from ${p.sourceName}`);
    });
  } catch (err) {
    console.error('\n=== Error ===');
    console.error(err.message);
    console.error(err.stack);
  }
})();
