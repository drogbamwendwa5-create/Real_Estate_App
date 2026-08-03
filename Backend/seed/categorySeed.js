// Backend/seed/categorySeed.js
// Seed default property categories if they don't exist.

const Category = require('../Models/Category');

// List of default categories (name, slug) – you can extend this list.
const defaultCategories = [
  { name: 'Apartment', slug: 'apartment' },
  { name: 'House', slug: 'house' },
  { name: 'Land', slug: 'land' },
  { name: 'Commercial', slug: 'commercial' },
];

async function seedCategories() {
  try {
    const existing = await Category.find({});
    if (existing.length === 0) {
      await Category.insertMany(defaultCategories);
      console.log('[Seed] Default categories created');
    } else {
      console.log('[Seed] Categories already exist, skipping');
    }
  } catch (err) {
    console.error('[Seed] Error seeding categories:', err.message);
  }
}

module.exports = seedCategories;
