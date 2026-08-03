const PropertyNormalizer = require('../property-aggregation/utils/PropertyNormalizer');
const sourceConfig = require('../property-aggregation/config/source.config');

describe('aggregation source normalization', () => {
  it('preserves promoted listing metadata from search and social sources', () => {
    const normalized = PropertyNormalizer.normalize({
      title: 'Luxury townhouse',
      description: 'Beautiful property near CBD',
      price: 'KSh 45,000,000',
      listingType: 'for-sale',
      propertyType: 'townhouse',
      county: 'Nairobi',
      town: 'Westlands',
      estate: 'Muthaiga',
      images: ['https://example.com/a.jpg'],
      agentName: 'Jane Wanjiru',
      agencyName: 'BlueStone Realtors',
      agentPhone: '+254700000000',
      agentEmail: 'jane@bluestone.co.ke',
      promotionType: 'social',
      socialPlatform: 'instagram',
      socialHandle: '@bluestone',
      promotionURL: 'https://instagram.com/p/abc',
      sourceCategory: 'social-promotion',
      isVerifiedAgent: true,
      verifiedStatus: 'verified',
      postedDate: '2025-01-20',
      sourceID: 'social-001',
    }, 'socialpromotions');

    expect(normalized.sourceName).toBe('socialpromotions');
    expect(normalized.promotionType).toBe('social');
    expect(normalized.socialPlatform).toBe('instagram');
    expect(normalized.promotedBy).toBe('Jane Wanjiru');
    expect(normalized.isVerifiedAgent).toBe(true);
    expect(normalized.verifiedStatus).toBe('verified');
    expect(normalized.rankingScore).toBeGreaterThan(0);
  });

  it('includes additional data sources in the configured source list', () => {
    expect(sourceConfig.sources.websearch).toBeDefined();
    expect(sourceConfig.sources.socialpromotions).toBeDefined();
  });
});
