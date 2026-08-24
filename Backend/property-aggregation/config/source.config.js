const sourceConfig = {
  defaults: {
    rateLimitMs: 2000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
    }
  },
  axios: {
    timeout: 30000,
    maxRedirects: 5
  },
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
    timeout: 30000,
    waitUntil: "networkidle2"
  },
  sources: {
    // Existing listing websites
    buyrent: {
      name: "BuyRent Kenya",
      baseUrl: "https://www.buyrentkenya.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/buyrent/scraper",
      headers: {},
      usePuppeteer: false,
      category: "listing"
    },
    property24: {
      name: "Property24 Kenya",
      baseUrl: "https://www.property24.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/property24/scraper",
      headers: {},
      usePuppeteer: false,
      category: "listing"
    },
    kenyapropertycentre: {
      name: "Kenya Property Centre",
      baseUrl: "https://www.kenyapropertycentre.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/kenyapropertycentre/scraper",
      headers: {},
      usePuppeteer: false,
      category: "listing"
    },
    hauzisha: {
      name: "Hauzisha",
      baseUrl: "https://www.hauzisha.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/hauzisha/scraper",
      headers: {},
      usePuppeteer: false,
      category: "listing"
    },
    // New listing websites
    jiji: {
      name: "Jiji Kenya",
      baseUrl: "https://jiji.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/jiji/scraper",
      headers: {},
      usePuppeteer: true,
      category: "listing"
    },
    pigiame: {
      name: "PigiaMe",
      baseUrl: "https://www.pigiame.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/pigiame/scraper",
      headers: {},
      usePuppeteer: true,
      category: "listing"
    },
    rentkenya: {
      name: "RentKenya",
      baseUrl: "https://www.rentkenya.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/rentkenya/scraper",
      headers: {},
      usePuppeteer: false,
      category: "listing"
    },
    // Commercial listing websites
    officespace: {
      name: "OfficeSpace Kenya",
      baseUrl: "https://www.officespace.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/officespace/scraper",
      headers: {},
      usePuppeteer: false,
      category: "commercial"
    },
    commercialke: {
      name: "CommercialKe",
      baseUrl: "https://www.commercialke.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/commercialke/scraper",
      headers: {},
      usePuppeteer: false,
      category: "commercial"
    },
    // Developer websites
    developers: {
      name: "Developer Websites",
      baseUrl: "",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    // Airbnb / Short-term rentals
    airbnb: {
      name: "Airbnb",
      baseUrl: "https://www.airbnb.com",
      enabled: true,
      rateLimitMs: 5000,
      scraperPath: "../scrapers/airbnb/scraper",
      headers: {},
      usePuppeteer: true,
      category: "shortterm"
    },
    booking: {
      name: "Booking.com",
      baseUrl: "https://www.booking.com",
      enabled: true,
      rateLimitMs: 5000,
      scraperPath: "../scrapers/booking/scraper",
      headers: {},
      usePuppeteer: true,
      category: "shortterm"
    },
    vrbo: {
      name: "VRBO",
      baseUrl: "https://www.vrbo.com",
      enabled: true,
      rateLimitMs: 5000,
      scraperPath: "../scrapers/vrbo/scraper",
      headers: {},
      usePuppeteer: true,
      category: "shortterm"
    },
    // Web search crawler (replaces google scraper)
    websearch: {
      name: "Web Search",
      baseUrl: "",
      enabled: true,
      rateLimitMs: 5000,
      scraperPath: "../scrapers/websearch/scraper",
      headers: {},
      usePuppeteer: true,
      category: "search"
    },
    // Developer-specific sources (pluggable)
    midvida: {
      name: "Mi Vida Homes",
      baseUrl: "https://www.mividahomes.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    superiorhomes: {
      name: "Superior Homes",
      baseUrl: "https://www.superiorhomes.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    centum: {
      name: "Centum Real Estate",
      baseUrl: "https://centum.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    fusioncapital: {
      name: "Fusion Capital",
      baseUrl: "https://www.fusioncapital.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    acornholdings: {
      name: "Acorn Holdings",
      baseUrl: "https://www.acornholdings.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    kingsdevelopers: {
      name: "Kings Developers",
      baseUrl: "https://www.kingsdevelopers.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    willstonehomes: {
      name: "Willstone Homes",
      baseUrl: "https://www.willstonehomes.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    mahigahomes: {
      name: "Mahiga Homes",
      baseUrl: "https://www.mahigahomes.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    kingspride: {
      name: "Kings Pride",
      baseUrl: "https://www.kingspride.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    hassconsult: {
      name: "Hass Consult",
      baseUrl: "https://www.hassconsult.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    fanaka: {
      name: "Fanaka",
      baseUrl: "https://www.fanaka.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    homeafrika: {
      name: "Home Afrika",
      baseUrl: "https://www.homeafrika.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    erdemann: {
      name: "Erdemann",
      baseUrl: "https://www.erdemann.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    sic: {
      name: "Safaricom Investment Coop",
      baseUrl: "https://www.sic.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    karibuhomes: {
      name: "Karibu Homes",
      baseUrl: "https://www.karibuhomes.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    mugadevelopers: {
      name: "Muga Developers",
      baseUrl: "https://www.mugadevelopers.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    weston: {
      name: "Weston Developers",
      baseUrl: "https://www.westondevelopers.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    mvulegardens: {
      name: "Mvule Gardens",
      baseUrl: "https://www.mvulegardens.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    jabavu: {
      name: "Jabavu Village",
      baseUrl: "https://www.jabavuvillage.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    // Real estate agencies
    knightfrank: {
      name: "Knight Frank Kenya",
      baseUrl: "https://www.knightfrank.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "agency"
    },
    pamgolding: {
      name: "Pam Golding Kenya",
      baseUrl: "https://www.pamgolding.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "agency"
    },
    // Additional listing websites
    peponi: {
      name: "PEPONI",
      baseUrl: "https://www.peponi.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "listing"
    },
    villacare: {
      name: "Villa Care",
      baseUrl: "https://www.villacare.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "listing"
    },
    propertyshop: {
      name: "Property Shop Kenya",
      baseUrl: "https://www.propertyshop.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "listing"
    },
    estateintel: {
      name: "Estate Intel",
      baseUrl: "https://www.estateintel.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "listing"
    },
    usernameinvestments: {
      name: "Username Investments",
      baseUrl: "https://www.usernameinvestments.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    optiven: {
      name: "Optiven",
      baseUrl: "https://www.optiven.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    vaal: {
      name: "VAAL",
      baseUrl: "https://www.vaal.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    cytonn: {
      name: "Cytonn",
      baseUrl: "https://www.cytonn.com",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    amazonfront: {
      name: "Amazon Front",
      baseUrl: "https://www.amazonfront.co.ke",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "developer"
    },
    // Commercial listings
    knightfrankcommercial: {
      name: "Knight Frank Commercial",
      baseUrl: "https://www.knightfrank.co.ke/commercial",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "commercial"
    },
    property24commercial: {
      name: "Property24 Commercial",
      baseUrl: "https://www.property24.co.ke/commercial",
      enabled: true,
      rateLimitMs: 3000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: false,
      category: "commercial"
    },
    // Additional short-term rental
    agoda: {
      name: "Agoda",
      baseUrl: "https://www.agoda.com",
      enabled: true,
      rateLimitMs: 5000,
      scraperPath: "../scrapers/developers/scraper",
      headers: {},
      usePuppeteer: true,
      category: "shortterm"
    },
    // Removed: socialpromotions (no social media scraping)
  }
};
module.exports = sourceConfig;
