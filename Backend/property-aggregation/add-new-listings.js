/**
 * Add at least 100,000 NEW listings to the database without removing existing data.
 * Uses unique propertyID prefix "gen2-" to avoid conflicts with existing "seed-" listings.
 * Usage: node property-aggregation/add-new-listings.js
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../Config/database');
const AggregatedProperty = require('./database/AggregatedProperty');

// Realistic Kenyan property images by type
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
  ],
  townhouse: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36957',
    'https://images.unsplash.com/photo-1570129477492-45e253ed8f2a',
    'https://images.unsplash.com/photo-1516455590538-7b877471ef50',
    'https://images.unsplash.com/photo-1448630360428-654536f796ad'
  ],
  studio: [
    'https://images.unsplash.com/photo-1554994776-7d6c2c2a3c5e',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb'
  ],
  maisonette: [
    'https://images.unsplash.com/photo-1600596542815-27bfef402323',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
  ],
  bungalow: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6'
  ],
  penthouse: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'
  ]
};

// Extended Kenyan locations with more variety
const locations = {
  Nairobi: {
    lat: -1.2921, lng: 36.7820, radius: 0.15,
    estates: ['Kilimani', 'Westlands', 'Lavington', 'Karen', 'Runda', 'Muthaiga', 'Langata', 'South C', 'Kileleshwa', 'Hurlingham', 'Riverside', 'Parklands', 'Ngara', 'Eastleigh', 'South B', 'Embakasi', 'Ruaka', 'Kasarani', 'Roysambu', 'Gigiri', 'Muthaiga North', 'Spring Valley', 'Brookside', 'Mathaiga', 'Nyari', 'Loresho']
  },
  Mombasa: {
    lat: -4.0435, lng: 39.6682, radius: 0.1,
    estates: ['Nyali', 'Bamburi', 'Shanzu', 'Tudor', 'Kizingo', 'Ganjoni', 'Likoni', 'Mtwapa', 'Diani', 'Malindi', 'Watamu', 'Kilifi', 'Vipingo', 'Kikambala', 'Bofa']
  },
  Kiambu: {
    lat: -1.1611, lng: 36.8261, radius: 0.1,
    estates: ['Ruaka', 'Kikuyu', 'Kiambu Town', 'Thika', 'Karuri', 'Limuru', 'Ruiru', 'Juja', 'Githunguri', 'Kabete', 'Wangige', 'Ndenderu', 'Muchatha', 'Kijabe', 'Gachie']
  },
  Kisumu: {
    lat: -0.1022, lng: 34.7617, radius: 0.08,
    estates: ['Milimani', 'Riat Hills', 'Mamboleo', 'Tom Mboya', 'Nyalenda', 'Kondele', 'Oginga Odinga', 'Otonglo', 'Kibos', 'Akala', 'Dunga', 'Kisian', 'Maseno']
  },
  Nakuru: {
    lat: -0.3030, lng: 36.0800, radius: 0.08,
    estates: ['Milimani', 'Naka', 'Lanet', 'Kiamunyi', 'Section 58', 'Free Area', 'Golf Course', 'Kabarak', 'Bahati', 'Naivasha', 'Gilgil', 'Elementaita', 'Molo', 'Njoro']
  },
  Machakos: {
    lat: -1.5178, lng: 37.2634, radius: 0.08,
    estates: ['Milimani', 'Katoloni', 'Mumbuni', 'Kithimani', 'Athi River', 'Kitengela', 'Syokimau', 'Mavoko', 'Konza', 'Malaa', 'Kangundo', 'Tala']
  },
  Kajiado: {
    lat: -1.8440, lng: 36.7810, radius: 0.08,
    estates: ['Kajiado Town', 'Ongata Rongai', 'Kitengela', 'Kiserian', 'Isinya', 'Ngong', 'Kaputei', 'Mlolongo', 'Namanga']
  },
  UasinGishu: {
    lat: 0.5143, lng: 35.2698, radius: 0.08,
    estates: ['Eldoret Town', 'West Indies', 'Elgon View', 'Racecourse', 'Pioneer', 'Kapsoya', 'Kimumu', 'Lagos', 'Kapkoya', 'Kesses', 'Nandi Hills']
  },
  Nyeri: {
    lat: -0.4167, lng: 36.9500, radius: 0.06,
    estates: ['Nyeri Town', 'Kamakwa', 'Ruringu', 'Wamagana', 'Mweiga', 'Kiganjo', 'Karatina', 'Othaya', 'Mukurweini']
  },
  Meru: {
    lat: 0.0464, lng: 37.6530, radius: 0.06,
    estates: ['Meru Town', 'Makutano', 'Githongo', 'Nkubu', 'Chuka', 'Timau', 'Maua', 'Laare']
  },
  Kakamega: {
    lat: 0.2827, lng: 34.7519, radius: 0.06,
    estates: ['Kakamega Town', 'Maraba', 'Lurambi', 'Shieywe', 'Bungoma', 'Mumias', 'Kakamega Forest']
  },
  Bungoma: {
    lat: 0.5695, lng: 34.5760, radius: 0.06,
    estates: ['Bungoma Town', 'Webuye', 'Kimilili', 'Chwele', 'Kapsabet', 'Naitiri']
  },
  TransNzoia: {
    lat: 1.0232, lng: 34.9881, radius: 0.06,
    estates: ['Kitale Town', 'Bidii', 'Sinyerere', 'Kipsongo', 'Tambach', 'Endebess', 'Suam']
  },
  Laikipia: {
    lat: 0.2236, lng: 36.9500, radius: 0.06,
    estates: ['Nanyuki', 'Laikipia Airbase', 'Rumuruti', 'Nyahururu', 'Ol Jorok', 'Dol Dol']
  },
  Narok: {
    lat: -1.0783, lng: 35.8722, radius: 0.06,
    estates: ['Narok Town', 'Mulot', 'Kilgoris', 'Suswa', 'Ewaso Nyiro', 'Ntulele']
  },
  Garissa: {
    lat: -0.4536, lng: 39.6403, radius: 0.06,
    estates: ['Garissa Town', 'Bura', 'Hola', 'Masalani', 'Balambala', 'Dadaab']
  },
  Wajir: {
    lat: 1.7470, lng: 40.0675, radius: 0.06,
    estates: ['Wajir Town', 'Eldas', 'Habaswein', 'Buna', 'Tarakwa']
  },
  Mandera: {
    lat: 3.9373, lng: 41.8569, radius: 0.06,
    estates: ['Mandera Town', 'Rhamu', 'Takaba', 'Lafey', 'Elwak']
  },
  Turkana: {
    lat: 3.1115, lng: 35.5999, radius: 0.06,
    estates: ['Lodwar', 'Kakuma', 'Lokichar', 'Lokichoggio', 'Kalokol']
  },
  WestPokot: {
    lat: 1.2333, lng: 35.1167, radius: 0.06,
    estates: ['Kapenguria', 'Kitale', 'Lodwar', 'Sigor', 'Kacheliba']
  }
};

const sources = [
  'BuyRent Kenya',
  'Property24 Kenya',
  'Kenya Property Centre',
  'Hauzisha',
  'Jiji Kenya',
  'PigiaMe',
  'RentKenya',
  'Knight Frank Kenya',
  'Pam Golding Kenya',
  'Hass Consult',
  'Optiven',
  'Username Investments',
  'VAAL',
  'Cytonn',
  'Estate Intel',
  'Property Shop Kenya',
  'Villa Care',
  'PEPONI',
  'Superior Homes',
  'Centum Real Estate',
  'Fusion Capital',
  'Acorn Holdings',
  'Kings Developers',
  'Willstone Homes',
  'Mahiga Homes',
  'Kings Pride',
  'Fanaka',
  'Home Afrika',
  'Erdemann',
  'Safaricom Investment Coop',
  'Karibu Homes',
  'Muga Developers',
  'Weston Developers',
  'Mvule Gardens',
  'Jabavu Village',
  'Mi Vida Homes',
  'Amazon Front',
  'OfficeSpace Kenya',
  'CommercialKe',
  'Airbnb',
  'Booking.com',
  'VRBO',
  'Agoda'
];

const adjectives = ['Luxury', 'Modern', 'Spacious', 'Cozy', 'Elegant', 'Charming', 'Exquisite', 'Premier', 'Beautiful', 'Prime', 'Executive', 'Stunning', 'Magnificent', 'Prestigious', 'Sophisticated', 'Contemporary', 'Stylish', 'Refined', 'Opulent', 'Serene', 'Breathtaking', 'Panoramic', 'Exclusive', 'Gated', 'Premium', 'Deluxe', 'Signature', 'Heritage', 'Royal', 'Platinum', 'Diamond', 'Golden', 'Silver', 'Crystal', 'Emerald', 'Sapphire'];

const amenities = ['Swimming Pool', 'Gym', 'Gated Community', 'Backup Generator', 'High Speed Lift', 'Borehole', 'Spacious Garden', 'Solar Water Heating', 'Fibre Internet', 'CCTV Surveillance', '24/7 Security', 'Playground', 'Clubhouse', 'Sauna', 'Steam Room', 'Jogging Track', 'Basketball Court', 'Tennis Court', 'Squash Court', 'Ample Parking', 'Visitors Parking', 'Electric Fence', 'Intercom System', 'Smart Home System', 'Air Conditioning', 'Central Heating', 'Balcony', 'Terrace', 'Rooftop Deck', 'Servant Quarter', 'DSQ', 'Study Room', 'Laundry Room', 'Walk-in Closet', 'Pantry', 'Ensuite Bedrooms', 'Family Room', 'Dining Area', 'Open Kitchen', 'Island Kitchen', 'Patio', 'Gazebo', 'Cabro Paving', 'Cable TV', 'DSTV Ready', 'Zuku Fiber', 'Safaricom Fiber'];

const agents = [
  { name: 'John Doe', phone: '+254712345678', email: 'john@realtor.co.ke', agency: 'Doe Realty' },
  { name: 'Jane Smith', phone: '+254722345678', email: 'jane@realtor.co.ke', agency: 'Smith Properties' },
  { name: 'David Kamau', phone: '+254733345678', email: 'david@realestate.co.ke', agency: 'Kamau Real Estate' },
  { name: 'Mary Wanjiku', phone: '+254744345678', email: 'mary@properties.co.ke', agency: 'Wanjiku Properties' },
  { name: 'Peter Mwangi', phone: '+254754345678', email: 'peter@mwangi.co.ke', agency: 'Mwangi Realty' },
  { name: 'Grace Achieng', phone: '+254764345678', email: 'grace@achieng.co.ke', agency: 'Achieng Properties' },
  { name: 'Samuel Otieno', phone: '+254774345678', email: 'samuel@otieno.co.ke', agency: 'Otieno Real Estate' },
  { name: 'Faith Wairimu', phone: '+254784345678', email: 'faith@wairimu.co.ke', agency: 'Wairimu Realty' },
  { name: 'James Kibet', phone: '+254794345678', email: 'james@kibet.co.ke', agency: 'Kibet Properties' },
  { name: 'Esther Njeri', phone: '+254700123456', email: 'esther@njeri.co.ke', agency: 'Njeri Real Estate' },
  { name: 'Daniel Mutua', phone: '+254711234567', email: 'daniel@mutua.co.ke', agency: 'Mutua Realty' },
  { name: 'Ruth Akinyi', phone: '+254722234567', email: 'ruth@akinyi.co.ke', agency: 'Akinyi Properties' },
  { name: 'Michael Omondi', phone: '+254733234567', email: 'michael@omondi.co.ke', agency: 'Omondi Real Estate' },
  { name: 'Sarah Chebet', phone: '+254744234567', email: 'sarah@chebet.co.ke', agency: 'Chebet Realty' },
  { name: 'Joseph Maina', phone: '+254755234567', email: 'joseph@maina.co.ke', agency: 'Maina Properties' }
];

const propertyTypes = ['apartment', 'house', 'villa', 'commercial', 'land', 'townhouse', 'studio', 'maisonette', 'bungalow', 'penthouse'];

const addNewListings = async () => {
  const startTime = Date.now();
  try {
    console.log('[AddListings] Connecting to database...');
    await connectDB();

    // Check current count
    const currentCount = await AggregatedProperty.countDocuments({});
    console.log(`[AddListings] Current listings in database: ${currentCount}`);

    // Check existing propertyID prefixes to avoid conflicts
    const existingGen2 = await AggregatedProperty.countDocuments({ propertyID: /^gen2-/ });
    console.log(`[AddListings] Existing 'gen2-' listings: ${existingGen2}`);

    const startIdx = existingGen2;
    const targetCount = 120000; // Generate 120,000 to ensure at least 100,000 new
    const chunkSize = 5000;
    let created = 0;
    let failed = 0;

    console.log(`[AddListings] Generating ${targetCount} new properties (starting from index ${startIdx}) in chunks of ${chunkSize}...`);

    const countyNames = Object.keys(locations);

    for (let chunkIdx = 0; chunkIdx < targetCount / chunkSize; chunkIdx++) {
      const operations = [];

      for (let i = 0; i < chunkSize; i++) {
        const itemIdx = startIdx + chunkIdx * chunkSize + i;

        // Pick fields based on index with more variety
        const county = countyNames[itemIdx % countyNames.length];
        const locationDetails = locations[county];
        const estate = locationDetails.estates[itemIdx % locationDetails.estates.length];
        const propertyType = propertyTypes[itemIdx % propertyTypes.length];

        // Generate coordinates with more spread
        const offsetLat = (Math.sin(itemIdx * 0.1) * locationDetails.radius);
        const offsetLng = (Math.cos(itemIdx * 0.1) * locationDetails.radius);
        const lat = locationDetails.lat + offsetLat;
        const lng = locationDetails.lng + offsetLng;

        // Select images group
        const imageList = unsplashImages[propertyType] || unsplashImages.apartment;
        const imgIdx1 = itemIdx % imageList.length;
        const imgIdx2 = (itemIdx + 1) % imageList.length;
        const imgIdx3 = (itemIdx + 2) % imageList.length;
        const selectedImages = [
          { url: imageList[imgIdx1], isFeatured: true, isValid: true },
          { url: imageList[imgIdx2], isFeatured: false, isValid: true },
          { url: imageList[imgIdx3], isFeatured: false, isValid: true }
        ];

        // Determine price, listingType, beds/baths logically
        const listingType = (itemIdx % 3 === 0) ? 'for-sale' : 'for-rent';

        let price = 0;
        let bedrooms = 0;
        let bathrooms = 0;
        let size = 0;
        let parking = 0;

        if (propertyType === 'apartment') {
          bedrooms = (itemIdx % 4) + 1;
          bathrooms = bedrooms === 1 ? 1 : bedrooms - 1 + (itemIdx % 2);
          size = bedrooms * 50 + 20;
          parking = 1 + (itemIdx % 2);
          price = listingType === 'for-rent'
            ? (bedrooms * 30000 + (itemIdx % 10) * 2000)
            : (bedrooms * 4000000 + (itemIdx % 10) * 300000);
        } else if (propertyType === 'house' || propertyType === 'maisonette' || propertyType === 'bungalow') {
          bedrooms = (itemIdx % 4) + 3;
          bathrooms = bedrooms - 1 + (itemIdx % 2);
          size = bedrooms * 80;
          parking = 2 + (itemIdx % 2);
          price = listingType === 'for-rent'
            ? (bedrooms * 45000 + (itemIdx % 10) * 5000)
            : (bedrooms * 7000000 + (itemIdx % 10) * 800000);
        } else if (propertyType === 'villa' || propertyType === 'penthouse') {
          bedrooms = (itemIdx % 3) + 4;
          bathrooms = bedrooms - 1 + (itemIdx % 2);
          size = bedrooms * 100 + 50;
          parking = 2 + (itemIdx % 3);
          price = listingType === 'for-rent'
            ? (bedrooms * 80000 + (itemIdx % 10) * 10000)
            : (bedrooms * 12000000 + (itemIdx % 10) * 1500000);
        } else if (propertyType === 'townhouse') {
          bedrooms = (itemIdx % 3) + 3;
          bathrooms = bedrooms - 1 + (itemIdx % 2);
          size = bedrooms * 75;
          parking = 2;
          price = listingType === 'for-rent'
            ? (bedrooms * 55000 + (itemIdx % 10) * 5000)
            : (bedrooms * 8500000 + (itemIdx % 10) * 900000);
        } else if (propertyType === 'studio') {
          bedrooms = 1;
          bathrooms = 1;
          size = 30 + (itemIdx % 20);
          parking = 1;
          price = listingType === 'for-rent'
            ? (25000 + (itemIdx % 10) * 2000)
            : (3500000 + (itemIdx % 10) * 200000);
        } else if (propertyType === 'commercial') {
          bedrooms = 0;
          bathrooms = 2 + (itemIdx % 3);
          size = ((itemIdx % 5) + 1) * 100;
          parking = 5 + (itemIdx % 10);
          price = listingType === 'for-rent'
            ? (size * 800 + (itemIdx % 5) * 5000)
            : (size * 120000 + (itemIdx % 5) * 200000);
        } else if (propertyType === 'land') {
          bedrooms = 0;
          bathrooms = 0;
          size = ((itemIdx % 4) + 1) * 200;
          parking = 0;
          price = listingType === 'for-sale'
            ? (size * 15000 + (itemIdx % 5) * 250000)
            : (size * 50);
        }

        const adjective = adjectives[itemIdx % adjectives.length];
        const titleType = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
        const title = `${adjective} ${bedrooms > 0 ? bedrooms + ' Bedroom ' : ''}${titleType} in ${estate}, ${county}`;

        const description = `${adjective} ${propertyType} situated in the prime area of ${estate}, ${county}. This property features modern fittings, high-quality finishes, and easy access to all essential social amenities including schools, hospitals, shopping centers, and transport links. ${bedrooms > 0 ? `The property boasts ${bedrooms} spacious bedrooms and ${bathrooms} well-appointed bathrooms. ` : ''}Ideal for both investment and residential purposes. ${size > 0 ? `Total area: ${size} sqm. ` : ''}Contact us today for a viewing.`;

        const agent = agents[itemIdx % agents.length];
        const sourceName = sources[itemIdx % sources.length];
        const sourceID = `gen2-src-${itemIdx}`;
        const propertyID = `gen2-${itemIdx}`;

        // Select 3-5 amenities
        const amenityCount = 3 + (itemIdx % 3);
        const selectedAmenities = [];
        for (let a = 0; a < amenityCount; a++) {
          const amenity = amenities[(itemIdx + a * 3) % amenities.length];
          if (!selectedAmenities.includes(amenity)) {
            selectedAmenities.push(amenity);
          }
        }

        const daysAgo = itemIdx % 90;
        const postedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

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
          parking,
          size,
          furnished: itemIdx % 2 === 0,
          petsAllowed: itemIdx % 3 === 0,
          serviced: itemIdx % 4 === 0,
          agentName: agent.name,
          agencyName: agent.agency,
          agentPhone: agent.phone,
          agentEmail: agent.email,
          propertyImages: selectedImages,
          propertyVideos: [],
          amenities: selectedAmenities,
          postedDate,
          lastUpdated: new Date(),
          importedAt: new Date(),
          availability: 'available',
          rankingScore: 80 + (itemIdx % 20),
          duplicateScore: 0,
          aiValidationScore: 0,
          validationScore: 0,
          daysOnMarket: daysAgo,
          verifiedStatus: itemIdx % 10 === 0 ? 'ai-flagged' : (itemIdx % 3 === 0 ? 'verified' : 'pending'),
          isFeatured: itemIdx % 25 === 0,
          isDeveloperListing: itemIdx % 15 === 0,
          isPublished: true,
          views: 10 + (itemIdx % 500),
          saves: 2 + (itemIdx % 50),
          sourceURL: `https://www.realestate.co.ke/details/${propertyID}`,
          sourceURLs: [`https://www.realestate.co.ke/details/${propertyID}`],
          sourceCategory: propertyType === 'commercial' ? 'commercial' : 'listing',
          priceHistory: [
            { price: Math.round(price * 1.05), date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), source: sourceName },
            { price: price, date: new Date(), source: sourceName }
          ],
          listingHistory: [
            { status: 'imported', date: new Date(), source: sourceName }
          ]
        };

        operations.push(propertyDoc);
      }

      try {
        const result = await AggregatedProperty.insertMany(operations, { ordered: false });
        created += result.length;
        failed += (operations.length - result.length);
      } catch (err) {
        // insertMany with ordered:false may throw partially
        if (err.insertedDocs) {
          created += err.insertedDocs.length;
          failed += (operations.length - err.insertedDocs.length);
        } else {
          console.error(`[AddListings] Chunk ${chunkIdx} failed:`, err.message);
          failed += operations.length;
        }
      }

      if (created % 20000 === 0 || chunkIdx === Math.floor(targetCount / chunkSize) - 1) {
        const elapsed = (Date.now() - startTime) / 1000;
        console.log(`[AddListings] Progress: ${created} created, ${failed} failed (${elapsed.toFixed(1)}s elapsed)`);
      }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`[AddListings] Successfully added ${created} new properties in ${elapsed.toFixed(2)} seconds!`);
    console.log(`[AddListings] Failed: ${failed}`);

    // Final verification
    const finalCount = await AggregatedProperty.countDocuments({});
    const gen2Count = await AggregatedProperty.countDocuments({ propertyID: /^gen2-/ });
    console.log(`[AddListings] Final database count: ${finalCount} (was ${currentCount})`);
    console.log(`[AddListings] New 'gen2-' listings: ${gen2Count}`);
    console.log(`[AddListings] Net new listings added: ${finalCount - currentCount}`);

    // Verify by source
    const bySource = await AggregatedProperty.aggregate([
      { $group: { _id: '$sourceName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    console.log('[AddListings] Top 10 sources:');
    bySource.forEach(s => console.log(`  ${s._id}: ${s.count}`));

    process.exit(0);
  } catch (error) {
    console.error('[AddListings] Error:', error.message);
    process.exit(1);
  }
};

addNewListings();