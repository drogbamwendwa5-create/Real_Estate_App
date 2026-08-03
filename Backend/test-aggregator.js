const PropertyAggregatorService = require('./property-aggregation/services/PropertyAggregatorService');

(async () => {
  try {
    console.log('Starting aggregator with 30-second timeout per scraper...');
    const svc = new PropertyAggregatorService();
    const results = await svc.aggregateAllSources();
    console.log('\n=== Results ===');
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('\n=== Error ===');
    console.error(err.message);
    console.error(err.stack);
  }
})();
