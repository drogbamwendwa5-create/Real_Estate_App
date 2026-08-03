/**
 * ProxyManager - Proxy rotation and management service.
 * Supports multiple proxy providers with automatic rotation.
 * Reads proxy configuration from environment variables.
 * 
 * Supported providers:
 *   - Bright Data
 *   - ScraperAPI
 *   - ZenRows
 *   - ScrapingBee
 *   - Oxylabs
 *   - Webshare
 *   - Custom HTTP/SOCKS proxies
 * 
 * Environment variables:
 *   PROXY_PROVIDER=   (e.g., brightdata, scraperapi, webshare, custom)
 *   PROXY_URL=        (e.g., http://username:password@proxy:port)
 *   PROXY_USERNAME=
 *   PROXY_PASSWORD=
 *   PROXY_LIST=       (comma-separated list of proxy URLs for rotation)
 */
const axios = require('axios');
const https = require('https');

class ProxyManager {
  constructor() {
    this.provider = process.env.PROXY_PROVIDER || null;
    this.proxyUrl = process.env.PROXY_URL || null;
    this.username = process.env.PROXY_USERNAME || '';
    this.password = process.env.PROXY_PASSWORD || '';
    this.proxyList = [];
    this.currentIndex = 0;
    this.failedProxies = new Map(); // proxy -> failure count
    this.maxFailures = 3;
    this.lastRotation = Date.now();
    this.rotationInterval = 60000; // Rotate every 60 seconds

    // Initialize proxy list
    this._initProxyList();
  }

  /**
   * Initialize proxy list from environment or config
   */
  _initProxyList() {
    if (process.env.PROXY_LIST) {
      this.proxyList = process.env.PROXY_LIST.split(',').map(p => p.trim()).filter(p => p);
    } else if (this.proxyUrl) {
      this.proxyList = [this.proxyUrl];
    }
  }

  /**
   * Check if proxy support is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.provider !== null && this.proxyUrl !== null;
  }

  /**
   * Get the current proxy URL
   * @returns {string|null}
   */
  getCurrentProxy() {
    if (this.proxyList.length === 0) return null;
    return this.proxyList[this.currentIndex];
  }

  /**
   * Rotate to the next proxy in the list
   * @returns {string|null}
   */
  rotateProxy() {
    if (this.proxyList.length === 0) return null;
    
    this.currentIndex = (this.currentIndex + 1) % this.proxyList.length;
    this.lastRotation = Date.now();
    
    console.log(`[ProxyManager] Rotated to proxy ${this.currentIndex + 1}/${this.proxyList.length}`);
    return this.proxyList[this.currentIndex];
  }

  /**
   * Mark a proxy as failed
   * @param {string} proxy - The proxy URL that failed
   */
  markProxyFailed(proxy) {
    const count = (this.failedProxies.get(proxy) || 0) + 1;
    this.failedProxies.set(proxy, count);
    
    console.warn(`[ProxyManager] Proxy failed (${count}/${this.maxFailures}): ${proxy}`);
    
    if (count >= this.maxFailures) {
      console.warn(`[ProxyManager] Removing failed proxy: ${proxy}`);
      this.proxyList = this.proxyList.filter(p => p !== proxy);
      this.failedProxies.delete(proxy);
      if (this.currentIndex >= this.proxyList.length) {
        this.currentIndex = 0;
      }
    } else {
      this.rotateProxy();
    }
  }

  /**
   * Get axios configuration with proxy settings
   * @returns {Object} Axios config object
   */
  getAxiosConfig() {
    const config = {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,sw;q=0.8'
      }
    };

    const proxy = this.getCurrentProxy();
    if (proxy) {
      config.proxy = false; // Disable axios proxy handling
      config.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        proxy: proxy
      });
    }

    return config;
  }

  /**
   * Get the proxy agent for puppeteer
   * @returns {Array} Puppeteer args array
   */
  getPuppeteerArgs() {
    const args = ['--no-sandbox', '--disable-setuid-sandbox'];
    
    const proxy = this.getCurrentProxy();
    if (proxy) {
      try {
        const url = new URL(proxy);
        args.push(`--proxy-server=${url.protocol}//${url.hostname}:${url.port}`);
      } catch (e) {
        console.warn('[ProxyManager] Invalid proxy URL format:', proxy);
      }
    }
    
    return args;
  }

  /**
   * Get provider-specific configuration
   * @returns {Object} Provider config
   */
  getProviderConfig() {
    switch (this.provider) {
      case 'brightdata':
        return {
          url: 'http://brd.superproxy.io:22225',
          username: `brd-customer-${this.username}`,
          password: this.password
        };
      
      case 'scraperapi':
        return {
          apiKey: this.username,
          baseUrl: 'http://api.scraperapi.com'
        };
      
      case 'zenrows':
        return {
          apiKey: this.username,
          baseUrl: 'https://api.zenrows.com/v1/'
        };
      
      case 'scrapingbee':
        return {
          apiKey: this.username,
          baseUrl: 'https://app.scrapingbee.com/api/v1/'
        };
      
      case 'oxylabs':
        return {
          url: 'http://oxylabs.io:60000',
          username: this.username,
          password: this.password
        };
      
      case 'webshare':
        return {
          url: 'http://p.webshare.io:80',
          username: this.username,
          password: this.password
        };
      
      default:
        return {
          url: this.proxyUrl,
          username: this.username,
          password: this.password
        };
    }
  }

  /**
   * Get the status of the proxy manager
   * @returns {Object}
   */
  getStatus() {
    return {
      enabled: this.isEnabled(),
      provider: this.provider,
      proxyCount: this.proxyList.length,
      currentIndex: this.currentIndex,
      failedProxies: this.failedProxies.size,
      lastRotation: new Date(this.lastRotation).toISOString()
    };
  }
}

// Singleton instance
const proxyManager = new ProxyManager();

module.exports = proxyManager;