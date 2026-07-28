const Property = require('../Models/Property');
const APIFeatures = require('../Utils/apiFeatures');

const searchProperties = async (query, filters = {}) => {
  try {
    const searchQuery = { isPublished: true };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (filters.propertyType) {
      searchQuery.propertyType = filters.propertyType;
    }

    if (filters.status) {
      searchQuery.status = filters.status;
    }

    if (filters.minPrice) {
      searchQuery.price = { ...searchQuery.price, $gte: filters.minPrice };
    }

    if (filters.maxPrice) {
      searchQuery.price = { ...searchQuery.price, $lte: filters.maxPrice };
    }

    if (filters.city) {
      searchQuery['address.city'] = new RegExp(filters.city, 'i');
    }

    if (filters.bedrooms) {
      searchQuery.bedrooms = { $gte: filters.bedrooms };
    }

    if (filters.bathrooms) {
      searchQuery.bathrooms = { $gte: filters.bathrooms };
    }

    const features = new APIFeatures(Property.find(searchQuery), filters)
      .sort()
      .paginate()
      .limitFields();

    const properties = await features.query;
    return properties;
  } catch (error) {
    throw error;
  }
};

const getAutocompleteSuggestions = async (query) => {
  try {
    const suggestions = await Property.aggregate([
      {
        $search: {
          autocomplete: {
            query,
            path: ['title', 'description', 'address.city'],
            fuzzy: {
              maxEdits: 2,
            },
          },
        },
      },
      { $limit: 10 },
      { $project: { title: 1, address: 1, _id: 0 } },
    ]);

    return suggestions;
  } catch (error) {
    throw error;
  }
};

module.exports = { searchProperties, getAutocompleteSuggestions };