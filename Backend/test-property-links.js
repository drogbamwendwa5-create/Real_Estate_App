const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  try {
    const testUrl = 'https://www.buyrentkenya.com/listings/4-bedroom-apartment-for-sale-westlands-area-4036781';
    console.log('Fetching:', testUrl);
    const res = await axios.get(testUrl, { timeout: 15000 });
    const $ = cheerio.load(res.data);

    console.log('\nChecking page structure...');
    console.log('H1:', $('h1').first().text().trim());
    console.log('Body text snippet:', $('body').text().trim().substring(0, 500));

    console.log('\nLooking for property-related links...');
    let count = 0;
    const links = [];

    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.length > 0 && href.length < 200) {
        links.push(href);
        count++;
      }
    });

    console.log(`\nTotal links found: ${count}`);
    console.log('\nFirst 20 links:');
    links.slice(0, 20).forEach((link, i) => {
      console.log(`  ${i + 1}. ${link}`);
    });

    console.log('\nLooking for links to other property listings...');
    let propertyLinks = 0;
    const propertyUrls = [];

    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/listings/') && href.length > 30 && href.length < 200) {
        const cleanHref = href.startsWith('http') ? href : `https://www.buyrentkenya.com${href}`;
        if (!propertyUrls.includes(cleanHref)) {
          propertyUrls.push(cleanHref);
          propertyLinks++;
        }
      }
    });

    console.log(`\nProperty listing links found: ${propertyLinks}`);
    if (propertyLinks > 0) {
      console.log('\nProperty URLs:');
      propertyUrls.forEach((url, i) => {
        console.log(`  ${i + 1}. ${url}`);
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
