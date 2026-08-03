const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  try {
    console.log('Fetching https://www.buyrentkenya.com');
    const res = await axios.get('https://www.buyrentkenya.com', { timeout: 15000 });
    const $ = cheerio.load(res.data);

    console.log('\nLooking for property listings links...');
    let count = 0;
    const links = [];

    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/listings') && href.length > 10 && href.length < 200) {
        const cleanHref = href.startsWith('http') ? href : `https://www.buyrentkenya.com${href}`;
        links.push({ href: cleanHref, text: $(el).text().trim() });
        count++;
      }
    });

    console.log(`\nTotal listings links found: ${count}`);
    console.log('\nFirst 20 links:');
    links.slice(0, 20).forEach((link, i) => {
      console.log(`  ${i + 1}. ${link.href}`);
      console.log(`     Text: ${link.text.substring(0, 50)}`);
    });

    console.log('\nTrying to fetch the first listings link...');
    if (links.length > 0) {
      const firstLink = links[0].href;
      try {
        const res2 = await axios.get(firstLink, { timeout: 15000 });
        console.log(`\nStatus: ${res2.status}`);
        console.log(`Content length: ${res2.data.length}`);
        console.log('First 500 chars:');
        console.log(res2.data.substring(0, 500));
      } catch (err) {
        console.error(`\nError fetching ${firstLink}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
