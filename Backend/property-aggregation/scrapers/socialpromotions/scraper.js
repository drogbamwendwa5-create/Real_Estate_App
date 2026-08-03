const BaseScraper = require('../base/BaseScraper');
const PropertyNormalizer = require('../../utils/PropertyNormalizer');
const sc = require('../../config/source.config');

class SocialPromotionsScraper extends BaseScraper {
  constructor() {
    super('socialpromotions', sc.sources.socialpromotions);
  }

  async scrapeListingPage(page = 1) {
    try {
      const url = page === 1
        ? 'https://www.instagram.com/explore/tags/kenyaproperties/'
        : `https://www.instagram.com/explore/tags/kenyaproperties/?page=${page}`;
      const html = await this.fetchHTML(url);
      const $ = this.loadCheerio(html);
      const urls = [];
      const seen = new Set();

      $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (!href || !href.includes('/p/')) return;
        const normalized = href.startsWith('http') ? href : `https://www.instagram.com${href}`;
        if (seen.has(normalized)) return;
        seen.add(normalized);
        if (this.isPropertyUrl(normalized)) {
          urls.push(normalized);
        }
      });

      return urls;
    } catch (error) {
      console.warn('[SocialPromotionsScraper] Failed to scrape listing page:', error.message);
      return [];
    }
  }

  isPropertyUrl(url) {
    if (!url) return false;
    return /property|listing|house|apartment|home|rent|sale/i.test(url);
  }

  async scrapePropertyDetail(url) {
    try {
      const html = await this.fetchHTML(url);
      const $ = this.loadCheerio(html);
      const bodyText = $('body').text().trim();
      const title = bodyText.split(/\n/).find((line) => line.trim().length > 0) || 'Social promotion';
      const priceText = bodyText.match(/KSh[^\n]{0,20}|KES[^\n]{0,20}|\b\d{1,3}(,\d{3})+(\.\d+)?\b/);

      if (!/(property|listing|house|apartment|home|rent|sale)/i.test(bodyText)) {
        return null;
      }

      return PropertyNormalizer.normalize({
        title: title.substring(0, 120),
        description: bodyText.substring(0, 400),
        price: priceText ? priceText[0] : '0',
        listingType: 'for-sale',
        propertyType: 'house',
        sourceURL: url,
        sourceID: url,
        sourceCategory: 'social-promotion',
        promotionType: 'social',
        socialPlatform: 'instagram',
        socialHandle: '@kenyaproperties',
        promotionURL: url,
        promotedBy: 'Instagram promoter',
        isVerifiedAgent: false,
        verifiedStatus: 'pending',
        images: [$('img').first().attr('src')].filter(Boolean),
      }, 'socialpromotions');
    } catch (error) {
      return null;
    }
  }
}

module.exports = SocialPromotionsScraper;
