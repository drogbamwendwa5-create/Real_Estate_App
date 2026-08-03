const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  try {
    console.log('Fetching https://www.buyrentkenya.com');
    const res = await axios.get('https://www.buyrentkenya.com', { timeout: 15000 });
    const $ = cheerio.load(res.data);

    console.log('\nLooking for property-card or listing-card links...');
    let count = 0;
    const links = [];

    $('.property-card a, .listing-card a, a[href*="/listings/"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        links.push(href);
        count++;
      }
    });

    console.log('Total links found:', count);
    if (count > 0) {
      console.log('\nFirst 10 links:');
      links.slice(0, 10).forEach((link, i) => {
        console.log(`  ${i + 1}. ${link}`);
      });
    } else {
      console.log('\nNo links found with these selectors.');
      console.log('Trying to find any links to property pages...');
      let allLinks = 0;
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.length < 100) {
          allLinks++;
        }
      });
      console.log(`Total links found: ${allLinks}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
