/**
 * BrowserPool - Centralized browser management system.
 * Replaces direct puppeteer.launch() calls in scrapers.
 * Manages browser instances, pages, and cleanup.
 * 
 * Usage:
 *   const BrowserPool = require('./services/BrowserPool');
 *   const page = await BrowserPool.getPage();
 *   // ... use page ...
 *   await BrowserPool.releasePage(page);
 *   await BrowserPool.closeBrowser();
 */
const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');
const UserAgent = require('user-agents');

let browser = null;
let activePages = 0;
const MAX_PAGES = 10;

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
];

const BROWSER_CONFIG = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-pings',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain'
  ],
  ignoreHTTPSErrors: true,
  timeout: 30000
};

// Apply stealth plugin if available
try {
  puppeteerExtra.use(StealthPlugin());
} catch (e) {
  // Stealth plugin not available, fall back to regular puppeteer
}

/**
 * Get or create a browser instance
 * @returns {Promise<Browser>}
 */
async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    console.log('[BrowserPool] Launching new browser instance...');
    try {
      // Try puppeteer-extra first for stealth
      if (typeof puppeteerExtra.use === 'function') {
        browser = await puppeteerExtra.launch(BROWSER_CONFIG);
      } else {
        browser = await puppeteer.launch(BROWSER_CONFIG);
      }
      console.log('[BrowserPool] Browser launched successfully');
      
      browser.on('disconnected', () => {
        console.log('[BrowserPool] Browser disconnected');
        browser = null;
        activePages = 0;
      });
    } catch (error) {
      console.error('[BrowserPool] Failed to launch browser:', error.message);
      throw error;
    }
  }
  return browser;
}

/**
 * Get a page from the browser pool
 * @param {Object} options - Page options
 * @param {string} options.userAgent - Custom user agent
 * @param {number} options.timeout - Navigation timeout
 * @returns {Promise<Page>}
 */
async function getPage(options = {}) {
  if (activePages >= MAX_PAGES) {
    console.warn(`[BrowserPool] Max pages (${MAX_PAGES}) reached, waiting...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const b = await getBrowser();
  const page = await b.newPage();
  activePages++;

  // Set default viewport
  await page.setViewport({
    width: 1920 + Math.floor(Math.random() * 200),
    height: 1080 + Math.floor(Math.random() * 200),
    deviceScaleFactor: 1
  });

  // Set user agent with rotation from random-useragent or user-agents library
  if (options.userAgent) {
    await page.setUserAgent(options.userAgent);
  } else {
    // Rotate user agents to avoid detection
    try {
      const ua = new UserAgent({ deviceCategory: 'desktop' });
      await page.setUserAgent(ua.toString());
    } catch (e) {
      // Fallback to random selection from our list
      const randomUa = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      await page.setUserAgent(randomUa);
    }
  }

  // Set default timeout
  const timeout = options.timeout || 30000;
  page.setDefaultTimeout(timeout);
  page.setDefaultNavigationTimeout(timeout);

  // Set extra HTTP headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9,sw;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Referer': 'https://www.google.com/'
  });

  // Block unnecessary resources for faster loading
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const resourceType = request.resourceType();
    if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  console.log(`[BrowserPool] Page created (${activePages}/${MAX_PAGES} active)`);
  return page;
}

/**
 * Release a page back to the pool
 * @param {Page} page - The page to release
 */
async function releasePage(page) {
  if (!page) return;
  try {
    await page.close();
    activePages = Math.max(0, activePages - 1);
    console.log(`[BrowserPool] Page released (${activePages}/${MAX_PAGES} active)`);
  } catch (error) {
    console.error('[BrowserPool] Error releasing page:', error.message);
    activePages = Math.max(0, activePages - 1);
  }
}

/**
 * Close the browser instance and all pages
 */
async function closeBrowser() {
  if (browser) {
    try {
      console.log('[BrowserPool] Closing browser...');
      await browser.close();
      browser = null;
      activePages = 0;
      console.log('[BrowserPool] Browser closed');
    } catch (error) {
      console.error('[BrowserPool] Error closing browser:', error.message);
      browser = null;
      activePages = 0;
    }
  }
}

/**
 * Get the current number of active pages
 * @returns {number}
 */
function getActivePageCount() {
  return activePages;
}

/**
 * Get the browser status
 * @returns {Object}
 */
function getStatus() {
  return {
    isConnected: browser ? browser.isConnected() : false,
    activePages,
    maxPages: MAX_PAGES
  };
}

module.exports = {
  getBrowser,
  getPage,
  releasePage,
  closeBrowser,
  getActivePageCount,
  getStatus
};