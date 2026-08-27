// Backend/seed/propertySeed.js
// Seed sample properties on every server start using upsert (creates if missing).

const Property = require('../Models/Property');
const Category = require('../Models/Category');

async function seedProperties() {
  try {
    // Ensure categories exist to reference
    const categories = await Category.find({});
    const catMap = {};
    categories.forEach((cat) => (catMap[cat.name.toLowerCase()] = cat._id));

    const sampleProperties = [
      {
        title: 'Cozy Apartment in Nairobi',
        description: 'A bright and modern apartment located in the heart of Nairobi.',
        price: 85000,
        currency: 'KES',
        propertyType: 'apartment',
        status: 'for-sale',
        bedrooms: 2,
        bathrooms: 1,
        area: 85,
        address: { street: 'Moi Avenue', city: 'Nairobi', country: 'Kenya' },
        location: { type: 'Point', coordinates: [36.8219, -1.2921] },
        category: catMap['apartment'] || null,
        agent: null,
        images: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', isFeatured: true },
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', isFeatured: false },
        ],
      },
      {
        title: 'Spacious House in Mombasa',
        description: 'A family house with garden near the beach.',
        price: 220000,
        currency: 'KES',
        propertyType: 'house',
        status: 'for-sale',
        bedrooms: 4,
        bathrooms: 2,
        area: 250,
        address: { street: 'Malindi Road', city: 'Mombasa', country: 'Kenya' },
        location: { type: 'Point', coordinates: [39.6682, -4.0435] },
        category: catMap['house'] || null,
        agent: null,
        images: [
          { url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', isFeatured: true },
          { url: 'https://images.unsplash.com/photo-1600596542815-27bfef402323', isFeatured: false },
        ],
      },
    ];

    for (const prop of sampleProperties) {
      await Property.updateOne({ title: prop.title }, { $setOnInsert: prop }, { upsert: true });
    }
    console.log('[Seed] Sample properties upserted');
  } catch (err) {
    console.error('[Seed] Error seeding properties:', err.message);
  }
}

module.exports = seedProperties;
