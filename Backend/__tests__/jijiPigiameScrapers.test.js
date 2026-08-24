const PropertyNormalizer = require('../property-aggregation/utils/PropertyNormalizer');
const { dedupeAndClean } = require('../property-aggregation/utils/imageValidator');

// Smoke tests for the new jiji and pigiame scrapers.
// We don't hit the network; we just confirm the modules load, expose the
// expected interface, and produce a sane normalized property when fed a
// hand-crafted HTML snippet.

describe('jiji scraper module', () => {
  it('loads and exposes the BaseScraper interface', () => {
    const JijiScraper = require('../property-aggregation/scrapers/jiji/scraper');
    const instance = new JijiScraper();
    expect(typeof instance.scrapeListingPage).toBe('function');
    expect(typeof instance.scrapePropertyDetail).toBe('function');
    expect(instance.sourceKey).toBe('jiji');
  });

  it('builds listing URLs with pagination', () => {
    const JijiScraper = require('../property-aggregation/scrapers/jiji/scraper');
    const instance = new JijiScraper();
    expect(instance._buildListingUrl('/apartments-houses-for-sale', 1))
      .toBe('https://jiji.co.ke/apartments-houses-for-sale');
    expect(instance._buildListingUrl('/apartments-houses-for-sale', 3))
      .toBe('https://jiji.co.ke/apartments-houses-for-sale?page=3');
  });
});

describe('pigiame scraper module', () => {
  it('loads and exposes the BaseScraper interface', () => {
    const PigiameScraper = require('../property-aggregation/scrapers/pigiame/scraper');
    const instance = new PigiameScraper();
    expect(typeof instance.scrapeListingPage).toBe('function');
    expect(typeof instance.scrapePropertyDetail).toBe('function');
    expect(instance.sourceKey).toBe('pigiame');
  });
});

describe('normalized output for the new sources', () => {
  it('jiji output carries hasImages=true when real images present', () => {
    const raw = {
      title: '3 Bedroom Apartment in Kileleshwa',
      price: 'KSh 35,000,000',
      images: [
        'https://cdn.jiji.co.ke/sample/photo1.jpg',
        'https://cdn.jiji.co.ke/sample/photo2.jpg',
      ],
      sourceURL: 'https://jiji.co.ke/sample-ad-123.html',
      sourceID: 'sample-ad-123',
      description: 'Spacious 3 bedroom apartment with balcony',
      propertyType: 'Apartment',
      listingType: 'for-sale',
      location: 'Kileleshwa, Nairobi, Nairobi',
      county: 'Nairobi',
      town: 'Nairobi',
      estate: 'Kileleshwa',
      bedrooms: 3,
      bathrooms: 3,
      agentName: 'John Doe',
    };
    const normalized = PropertyNormalizer.normalize(raw, 'jiji');
    expect(normalized.propertyID).toBe('jiji_sample-ad-123');
    expect(normalized.sourceName).toBe('jiji');
    expect(normalized.hasImages).toBe(true);
    expect(normalized.propertyImages).toHaveLength(2);
    expect(normalized.propertyImages[0].url).toContain('photo1.jpg');
  });

  it('drops placeholder URLs during normalization', () => {
    const raw = {
      title: 'Studio in Westlands',
      price: 'KSh 12,000',
      images: [
        'https://via.placeholder.com/600x400?text=No+Image+Available',
        'https://cdn.pigiame.co.ke/real/photo.jpg',
      ],
      sourceURL: 'https://www.pigiame.co.ke/listings/studio',
      sourceID: 'studio',
    };
    const normalized = PropertyNormalizer.normalize(raw, 'pigiame');
    expect(normalized.propertyImages.map((i) => i.url)).toEqual([
      'https://cdn.pigiame.co.ke/real/photo.jpg',
    ]);
    expect(normalized.hasImages).toBe(true);
  });

  it('keeps real images, drops garbage, dedupes', () => {
    const cleaned = dedupeAndClean([
      'https://a.com/x.jpg',
      'https://a.com/x.jpg',
      'data:image/png;base64,xxx',
      'https://via.placeholder.com/600',
      '//b.com/y.jpg',
      'https://b.com/y.jpg',
    ]);
    expect(cleaned).toEqual(['https://a.com/x.jpg', 'https://b.com/y.jpg']);
  });
});
