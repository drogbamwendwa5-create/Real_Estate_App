const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Property = require('../Models/Property');
const Category = require('../Models/Category');

// Mock database connection
jest.mock('../Config/database', () => jest.fn());

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Property.deleteMany({});
  await Category.deleteMany({});
});

describe('GET /api/properties', () => {
  let categoryId;

  beforeEach(async () => {
    const category = await Category.create({ name: 'Apartment', slug: 'apartment' });
    categoryId = category._id;

    await Property.create([
      {
        title: 'Luxury Villa',
        description: 'Beautiful villa',
        price: 500000,
        location: 'New York',
        category: categoryId,
        type: 'sale',
        bedrooms: 4,
        bathrooms: 3,
        area: 2500,
      },
      {
        title: 'Cozy Apartment',
        description: 'Small apartment',
        price: 2000,
        location: 'Los Angeles',
        category: categoryId,
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        area: 800,
      },
      {
        title: 'Modern Condo',
        description: 'Downtown condo',
        price: 300000,
        location: 'New York',
        category: categoryId,
        type: 'sale',
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
      },
    ]);
  });

  it('should return all properties', async () => {
    const res = await request(app).get('/api/properties');
    expect(res.statusCode).toBe(200);
    expect(res.body.properties).toHaveLength(3);
  });

  it('should filter properties by location', async () => {
    const res = await request(app).get('/api/properties?location=New York');
    expect(res.statusCode).toBe(200);
    expect(res.body.properties).toHaveLength(2);
    expect(res.body.properties.every(p => p.location === 'New York')).toBe(true);
  });

  it('should filter properties by price range', async () => {
    const res = await request(app).get('/api/properties?minPrice=100000&maxPrice=400000');
    expect(res.statusCode).toBe(200);
    expect(res.body.properties).toHaveLength(2);
  });

  it('should filter properties by type', async () => {
    const res = await request(app).get('/api/properties?type=sale');
    expect(res.statusCode).toBe(200);
    expect(res.body.properties).toHaveLength(2);
    expect(res.body.properties.every(p => p.type === 'sale')).toBe(true);
  });

  it('should search properties by title keyword', async () => {
    const res = await request(app).get('/api/properties?keyword=Luxury');
    expect(res.statusCode).toBe(200);
    expect(res.body.properties).toHaveLength(1);
    expect(res.body.properties[0].title).toBe('Luxury Villa');
  });

  it('should paginate results', async () => {
    const res = await request(app).get('/api/properties?page=1&limit=2');
    expect(res.statusCode).toBe(200);
    expect(res.body.properties).toHaveLength(2);
    expect(res.body.pagination.total).toBe(3);
  });
});