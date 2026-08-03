/**
 * WebSearchScraper - Site search crawler using site: queries.
 * Replaces Google scraping with targeted site: queries for each property website.
 * Supports Brave Search and Bing Search as search engines.
 * 
 * Example queries:
 *   site:buyrentkenya.com Nairobi apartment
 *   site:property24.co.ke Nairobi
 *   site:jiji.co.ke house kenya
 *   site:hauzisha.co.ke apartment
 */
const BaseScraper = require('../base/BaseScraper');
const PropertyNormalizer = require('../../utils/PropertyNormalizer');
const sc = require('../../config/source.config');
const retry = require('../../utils/retry');
const axios = require('axios');

class WebSearchScraper extends BaseScraper {
  constructor() {
    super('websearch', sc.sources.websearch);
    
    // Search engine configuration
    this.searchEngines = {
      brave: {
        url: 'https://search.brave.com/search?q=',
        selector: 'a.result-header, .snippet a, .url'
      },
      bing: {
        url: 'https://www.bing.com/search?q=',
        selector: 'li.b_algo h2 a, .b_algo a'
      },
      duckduckgo: {
        url: 'https://html.duckduckgo.com/html/?q=',
        selector: 'a.result__a, .result__url a'
      }
    };
    
    // Default search engine (avoid Google)
    this.defaultEngine = process.env.SEARCH_ENGINE || 'bing';
    
    // Site queries for each property website
    this.siteQueries = [
      'site:buyrentkenya.com Nairobi apartment',
      'site:buyrentkenya.com house for sale',
      'site:property24.co.ke Nairobi',
      'site:property24.co.ke apartment for rent',
      'site:jiji.co.ke house kenya',
      'site:jiji.co.ke apartment Nairobi',
      'site:hauzisha.co.ke apartment',
      'site:hauzisha.co.ke house for sale',
      'site:kenyapropertycentre.com property',
      'site:kenyapropertycentre.com house Nairobi',
      'site:pigianme.co.ke property',
      'site:pigianme.co.ke house for sale',
      'site:rentkenya.com apartment',
      'site:rentkenya.com house for rent',
    ];
  }

  /**
   * Scrape listing page using site: queries
   * @param {number} page - Page number
   * @returns {Promise<string[]>} Array of listing URLs
   */
  async scrapeListingPage(page = 1) {
    try {
      const queryIndex = (page - 1) % this.siteQueries.length;
      const query = this.siteQueries[queryIndex];
      
      console.log(`[WebSearchScraper] Searching: ${query}`);
      
      // Use the selected search engine
      const engine = this.searchEngines[this.defaultEngine] || this.searchEngines.bing;
      const searchUrl = engine.url + encodeURIComponent(query) + (page > 1 ? `&first=${(page - 1) * 10}` : '');
      
      const html = await this.fetchHTML(searchUrl, true);
      const $ = this.loadCheerio(html);
      const urls = [];
      const seen = new Set();

      // Extract URLs from search results
      $(engine.selector).each((_, el) => {
        let href = $(el).attr('href');
        if (!href) return;
        
        // Clean the URL
        href = this._cleanUrl(href);
        if (!href) return;
        
        // Skip search engine internal links
        if (this._isSearchEngineUrl(href)) return;
        
        // Check if it's a property URL
        if (this.isPropertyUrl(href) && !seen.has(href)) {
          seen.add(href);
          urls.push(href);
        }
      });

      // Also extract from all links on the page
      $('a').each((_, el) => {
        let href = $(el).attr('href');
        if (!href) return;
        
        href = this._cleanUrl(href);
        if (!href) return;
        
        if (this._isSearchEngineUrl(href)) return;
        
        if (this.isPropertyUrl(href) && !seen.has(href)) {
          seen.add(href);
          urls.push(href);
        }
      });

      console.log(`[WebSearchScraper] Found ${urls.length} URLs from query: ${query}`);
      return urls;
    } catch (error) {
      console.warn('[WebSearchScraper] Failed to scrape listing page:', error.message);
      return [];
    }
  }

  /**
   * Clean a URL from search engine tracking parameters
   * @param {string} href 
   * @returns {string}
   */
  _cleanUrl(href) {
    if (!href) return '';
    
    // Remove Bing/Brave tracking redirects
    if (href.startsWith('/')) {
      // Relative URL - skip
      return '';
    }
    
    // Remove tracking parameters
    let cleaned = href;
    
    // Handle Bing URL redirects
    if (href.startsWith('https://www.bing.com/ck/')) {
      const match = href.match(/u=([^&]+)/);
      if (match) {
        cleaned = decodeURIComponent(match[1]);
      }
    }
    
    // Handle Brave URL redirects
    if (href.includes('search.brave.com')) {
      return '';
    }
    
    // Handle DuckDuckGo redirects
    if (href.includes('duckduckgo.com')) {
      const match = href.match(/uddg=([^&]+)/);
      if (match) {
        cleaned = decodeURIComponent(match[1]);
      } else {
        return '';
      }
    }
    
    // Ensure it's a valid URL
    if (!cleaned.startsWith('http')) {
      return '';
    }
    
    return cleaned;
  }

  /**
   * Check if a URL belongs to a search engine
   * @param {string} url 
   * @returns {boolean}
   */
  _isSearchEngineUrl(url) {
    const searchEngines = ['google.com', 'bing.com', 'brave.com', 'duckduckgo.com', 'yahoo.com', 'baidu.com'];
    return searchEngines.some(engine => url.includes(engine));
  }

  /**
   * Check if a URL is a property listing URL
   * @param {string} url 
   * @returns {boolean}
   */
  isPropertyUrl(url) {
    if (!url) return false;
    
    // Known property websites
    const propertySites = [
      'buyrentkenya.com',
      'property24.co.ke',
      'kenyapropertycentre.com',
      'hauzisha.co.ke',
      'jiji.co.ke',
      'pigianme.co.ke',
      'rentkenya.com',
      'airbnb.com',
      'booking.com',
      'vrbo.com',
      'knightfrank.co.ke',
      'pamgolding.co.ke',
      'mividahomes.co.ke',
      'superiorhomes.co.ke',
      'centum.co.ke',
    ];
    
    // Check if URL is from a known property site
    if (propertySites.some(site => url.includes(site))) {
      return true;
    }
    
    // Check for property-related keywords in URL
    return /property|listing|home|house|apartment|rent|sale|villa|bungalow|studio|maisonette|townhouse/i.test(url);
  }

  /**
   * Scrape property detail from a URL
   * @param {string} url 
   * @returns {Promise<Object|null>}
   */
  async scrapePropertyDetail(url) {
    try {
      const html = await this.fetchHTML(url);
      const $ = this.loadCheerio(html);
      
      const title = $('title').first().text().trim() || $('h1').first().text().trim() || 'Property listing';
      const description = $('meta[name="description"]').attr('content') || $('body').text().trim().substring(0, 500);
      const priceText = $('body').text().match(/KSh\s*[\d,]+|KES\s*[\d,]+|\b\d{1,3}(,\d{3})+(\.\d+)?\b/);
      
      const combinedText = `${title}\n${description}`.toLowerCase();
      
      if (!/(property|listing|house|apartment|home|rent|sale|villa|bungalow|studio)/i.test(combinedText)) {
        return null;
      }

      // Extract images
      const images = [];
      $('img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
          images.push(src);
        }
      });

      // Extract location from text
      const locationMatch = description.match(/(Nairobi|Mombasa|Kisumu|Nakuru|Eldoret|Thika|Ruiru|Kitengela|Westlands|Karen|Kilimani|Ruaka|Karen|Nyali|Diani|Naivasha|Kitengela)/i);
      const location = locationMatch ? locationMatch[0] : '';

      return PropertyNormalizer.normalize({
        title,
        description: description.substring(0, 400),
        price: priceText ? priceText[0].replace(/[^\d]/g, '') : '0',
        listingType: /rent/i.test(combinedText) ? 'for-rent' : 'for-sale',
        propertyType: /apartment/i.test(combinedText) ? 'apartment' : 
                      /villa/i.test(combinedText) ? 'villa' :
                      /bungalow/i.test(combinedText) ? 'bungalow' :
                      /studio/i.test(combinedText) ? 'studio' : 'house',
        county: location || 'Nairobi',
        town: location,
        sourceURL: url,
        sourceID: url,
        sourceCategory: 'web-search',
        promotionType: 'web-search',
        isVerifiedAgent: false,
        verifiedStatus: 'pending',
        images: images.slice(0, 5),
      }, 'websearch');
    } catch (error) {
      console.warn('[WebSearchScraper] Failed to scrape property detail:', error.message);
      return null;
    }
  }
}

module.exports = WebSearchScraper;