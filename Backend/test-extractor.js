const axios = require('axios');
const cheerio = require('cheerio');
const PropertyNormalizer = require('./property-aggregation/utils/PropertyNormalizer');

(async () => {
  try {
    const testUrl = 'https://www.buyrentkenya.com/listings/4-bedroom-apartment-for-sale-westlands-area-4036781';
    console.log('Fetching:', testUrl);

    const res = await axios.get(testUrl, { timeout: 15000 });
    const $ = cheerio.load(res.data);

    console.log('\nTrying to extract property details...');
    const raw = {
      title: $('h1').first().text().trim(),
      description: $('meta[name="description"]').attr('content') || $('body').text().trim(),
      price: $('body').text().match(/KSh[^\n]{0,20}|KES[^\n]{0,20}|\b\d{1,3}(,\d{3})+(\.\d+)?\b/),
      propertyType: $('.property-type, .type').first().text().trim(),
      listingType: $('body').text().toLowerCase().includes('rent') ? 'for-rent' : 'for-sale',
      county: $('.property-location, .location').first().text().trim(),
      town: '',
      estate: '',
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,
      size: 0,
      images: [],
      amenities: [],
      agentName: $('.agent-name, .contact-name').first().text().trim(),
      agencyName: $('.agency-name').first().text().trim(),
      agentPhone: $('.agent-phone, .contact-phone').first().text().trim(),
      agentEmail: $('.agent-email, .contact-email').first().text().trim(),
      sourceURL: testUrl,
      sourceID: testUrl.split('/').pop() || '',
    };

    console.log('\nRaw extraction:');
    console.log('  Title:', raw.title.substring(0, 100));
    console.log('  Price:', raw.price);
    console.log('  Property Type:', raw.propertyType);
    console.log('  Agent:', raw.agentName);

    const normalized = PropertyNormalizer.normalize(raw, 'buyrent');
    console.log('\nNormalized result:');
    console.log('  propertyID:', normalized.propertyID);
    console.log('  rankingScore:', normalized.rankingScore);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
