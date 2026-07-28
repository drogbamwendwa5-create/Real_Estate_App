const Property = require('../Models/Property');
const APIFeatures = require('../Utils/apiFeatures');

const searchProperties = async (query) => {
  try {
    const features = new APIFeatures(Property.find(), query)
      .filter()
      .sort()
      .limitFields()
      .search()
      .paginate();
    const properties = await features.query;
    const total = await Property.countDocuments();
    return { properties, total };
  } catch (error) {
    throw error;
  }
};

const getNearbyProperties = async (coordinates, maxDistance) => {
  try {
    const properties = await Property.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: maxDistance || 10000,
        },
      },
      isPublished: true,
    });
    return properties;
  } catch (error) {
    throw error;
  }
};

const getRecommendedProperties = async (userId) => {
  try {
    // TODO: Implement recommendation logic based on user preferences
    const properties = await Property.find({ isPublished: true })
      .sort('-views')
      .limit(10);
    return properties;
  } catch (error) {
    throw error;
  }
};

const incrementViews = async (propertyId) => {
  try {
    const property = await Property.findByIdAndUpdate(
      propertyId,
      { $inc: { views: 1 } },
      { new: true }
    );
    return property;
  } catch (error) {
    throw error;
  }
};

module.exports = { searchProperties, getNearbyProperties, getRecommendedProperties, incrementViews };