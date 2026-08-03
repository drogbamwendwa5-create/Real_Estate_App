/**
 * Seed the AggregatedProperty collection with 100,000 realistic Kenyan listings.
 * Usage: node property-aggregation/seed-data.js
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../Config/database');
const AggregatedProperty = require('./database/AggregatedProperty');

const unsplashImages = {
  apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d2e7',
    'https://images.unsplash.com/photo-1502005229762-fc1b2d812ca5',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    'https://images.unsplash.com/photo-1580041065738-e72023775cdc',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'
  ],
  house: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    'https://images.unsplash.com/photo-1600596542815-27bfef402323',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09',
    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
    'https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb'
  ],
  villa: [
    'https://images.unsplash.com/photo-1613977257363-707ba9348227',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811'
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094'
  ],
  land: [
    'https://images.unsplash.com/photo-1500382017468-9029d4c0a784',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8'
  ]
};

const locations = {
  Nairobi: {
    lat: -1.2921, lng: 36.7820, radius: 0.1,
    estates: ['Kilimani', 'Westlands', 'Lavington', 'Karen', 'Runda', 'Muthaiga', 'Langata', 'South C', 'Kileleshwa', 'Hurlingham', 'Riverside']
  },
  Mombasa: {
    lat: -4.0435, lng: 39.6682, radius: 0.08,
    estates: ['Nyali', 'Bamburi', 'Shanzu', 'Tudor', 'Kizingo', 'Ganjoni']
  },
  Kiambu: {
    lat: -1.1611, lng: 36.8261, radius: 0.08,
    estates: ['Ruaka', 'Kikuyu', 'Kiambu Town', 'Thika', 'Karuri']
  },
  Kisumu: {
    lat: -0.1022, lng: 34.7617, radius: 0.06,
    estates: ['Milimani', 'Riat Hills', 'Mamboleo', 'Tom Mboya']
  },
  Nakuru: {
    lat: -0.3030, lng: 36.0800, radius: 0.06,
    estates: ['Milimani', 'Naka', 'Lanet', 'Kiamunyi']
  }
};

const sources = [
  'BuyRent Kenya',
  'Property24 Kenya',
  'Kenya Property Centre',
  'Hauzisha',
  'Jiji Kenya',
  'PigiaMe'
];

const adjectives = ['Luxury', 'Modern', 'Spacious', 'Cozy', 'Elegant', 'Charming', 'Exquisite', 'Premier', 'Beautiful', 'Cozy', 'Prime', 'Executive'];
const amenities = ['Swimming Pool', 'Gym', 'Gated Community', 'Backup Generator', 'High Speed Lift', 'Borehole', 'Spacious Garden', 'Solar Water Heating', 'Fibre Internet', 'CCTV Surveillance', '24/7 Security'];
const agents = [
  { name: 'John Doe', phone: '+254712345678', email: 'john@realtor.co.ke' },
  { name: 'Jane Smith', phone: '+254722345678', email: 'jane@realtor.co.ke' },
  { name: 'David Kamau', phone: '+254733345678', email: 'david@realestate.co.ke' },
  { name: 'Mary Wanjiku', phone: '+254744345678', email: 'mary@properties.co.ke' }
];

const seedData = async () => {
  const startTime = Date.now();
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing AggregatedProperty data...');
    await AggregatedProperty.deleteMany({});
    console.log('[Seed] Cleared existing listings.');

    const targetCount = 100000;
    const chunkSize = 5000;
    let created = 0;

    console.log(`[Seed] Generating and seeding ${targetCount} properties in chunks of ${chunkSize}...`);

    const countyNames = Object.keys(locations);
    const propertyTypes = ['apartment', 'house', 'villa', 'commercial', 'land'];

    for (let chunkIdx = 0; chunkIdx < targetCount / chunkSize; chunkIdx++) {
      const operations = [];

      for (let i = 0; i < chunkSize; i++) {
        const itemIdx = chunkIdx * chunkSize + i;
        
        // Pick fields based on index
        const county = countyNames[itemIdx % countyNames.length];
        const locationDetails = locations[county];
        const estate = locationDetails.estates[itemIdx % locationDetails.estates.length];
        const propertyType = propertyTypes[itemIdx % propertyTypes.length];
        
        // Generate coordinates
        const offsetLat = (Math.sin(itemIdx) * locationDetails.radius);
        const offsetLng = (Math.cos(itemIdx) * locationDetails.radius);
        const lat = locationDetails.lat + offsetLat;
        const lng = locationDetails.lng + offsetLng;

        // Select images group
        const imageList = unsplashImages[propertyType] || unsplashImages.apartment;
        const selectedImages = [
          { url: imageList[itemIdx % imageList.length], isFeatured: true, isValid: true },
          { url: imageList[(itemIdx + 1) % imageList.length], isFeatured: false, isValid: true }
        ];

        // Determine price, listingType, beds/baths logically
        const listingType = (itemIdx % 3 === 0) ? 'for-sale' : 'for-rent';
        
        let price = 0;
        let bedrooms = 0;
        let bathrooms = 0;
        let size = 0;
        
        if (propertyType === 'apartment') {
          bedrooms = (itemIdx % 3) + 1;
          bathrooms = bedrooms === 1 ? 1 : bedrooms - 1 + (itemIdx % 2);
          size = bedrooms * 50 + 20;
          price = listingType === 'for-rent' 
            ? (bedrooms * 30000 + (itemIdx % 10) * 2000) 
            : (bedrooms * 4000000 + (itemIdx % 10) * 300000);
        } else if (propertyType === 'house' || propertyType === 'villa') {
          bedrooms = (itemIdx % 3) + 3;
          bathrooms = bedrooms - 1 + (itemIdx % 2);
          size = bedrooms * 80;
          price = listingType === 'for-rent' 
            ? (bedrooms * 45000 + (itemIdx % 10) * 5000) 
            : (bedrooms * 7000000 + (itemIdx % 10) * 800000);
        } else if (propertyType === 'commercial') {
          size = ((itemIdx % 5) + 1) * 100;
          price = listingType === 'for-rent' 
            ? (size * 800 + (itemIdx % 5) * 5000) 
            : (size * 120000 + (itemIdx % 5) * 200000);
        } else if (propertyType === 'land') {
          size = ((itemIdx % 4) + 1) * 200;
          price = listingType === 'for-sale' 
            ? (size * 15000 + (itemIdx % 5) * 250000) 
            : (size * 50);
        }

        const adjective = adjectives[itemIdx % adjectives.length];
        const titleType = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
        const title = `${adjective} ${bedrooms > 0 ? bedrooms + ' Bedroom ' : ''}${titleType} in ${estate}`;
        
        const description = `${adjective} ${propertyType} situated in the prime area of ${estate}, ${county}. Features include modern fittings, high-quality finishes, and easy access to all essential social amenities. Ideal for both investment and residential purposes.`;

        const agent = agents[itemIdx % agents.length];
        const sourceName = sources[itemIdx % sources.length];
        const sourceID = `src-${itemIdx}`;
        const propertyID = `seed-${itemIdx}`;

        const propertyDoc = {
          propertyID,
          sourceID,
          sourceName,
          title,
          description,
          price,
          currency: 'KES',
          listingType,
          propertyType,
          county,
          town: estate,
          estate,
          latitude: lat,
          longitude: lng,
          location: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          bedrooms,
          bathrooms,
          parking: bedrooms > 0 ? bedrooms - 1 + (itemIdx % 2) : 0,
          size,
          furnished: itemIdx % 2 === 0,
          petsAllowed: itemIdx % 3 === 0,
          serviced: itemIdx % 4 === 0,
          agentName: agent.name,
          agentPhone: agent.phone,
          agentEmail: agent.email,
          propertyImages: selectedImages,
          propertyVideos: [],
          amenities: [
            amenities[itemIdx % amenities.length],
            amenities[(itemIdx + 2) % amenities.length],
            amenities[(itemIdx + 4) % amenities.length]
          ],
          postedDate: new Date(Date.now() - (itemIdx % 30) * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(),
          availability: 'available',
          rankingScore: 80 + (itemIdx % 20),
          verifiedStatus: itemIdx % 10 === 0 ? 'ai-flagged' : (itemIdx % 3 === 0 ? 'verified' : 'pending'),
          isFeatured: itemIdx % 25 === 0,
          isDeveloperListing: itemIdx % 15 === 0,
          isPublished: true,
          views: 10 + (itemIdx % 500),
          saves: 2 + (itemIdx % 50),
          sourceURL: `https://www.realestate.co.ke/details/${propertyID}`,
          sourceCategory: propertyType === 'commercial' ? 'commercial' : 'listing',
          priceHistory: [
            { price: price * 1.05, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), source: sourceName },
            { price: price, date: new Date(), source: sourceName }
          ],
          listingHistory: [
            { status: 'imported', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), source: sourceName }
          ]
        };

        operations.push(propertyDoc);
      }

      await AggregatedProperty.insertMany(operations, { ordered: false });
      created += chunkSize;
      if (created % 20000 === 0) {
        console.log(`[Seed] Seeded ${created} / ${targetCount} properties...`);
      }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`[Seed] Successfully seeded ${created} properties in ${elapsed.toFixed(2)} seconds!`);
    
    const recent = await AggregatedProperty.find({}).limit(3);
    console.log('[Seed] Verification check:');
    recent.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.title} (${p.price} ${p.currency}) [${p.propertyID}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();