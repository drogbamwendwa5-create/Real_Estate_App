const AggregatedProperty = require("../database/AggregatedProperty");

class PropertyMergeService {
  async merge(primary, secondary) {
    const merged = { ...primary._doc };
    merged.mergedFrom = [...(primary.mergedFrom || []), secondary._id];
    if (secondary.propertyImages && secondary.propertyImages.length > 0) {
      merged.propertyImages = [...new Set([...primary.propertyImages, ...secondary.propertyImages].map(i => i.url))].map(url => ({ url, isFeatured: primary.propertyImages.some(i => i.url === url && i.isFeatured) }));
    }
    if (secondary.amenities && secondary.amenities.length > 0) {
      merged.amenities = [...new Set([...primary.amenities, ...secondary.amenities])];
    }
    merged.views = (primary.views || 0) + (secondary.views || 0);
    merged.saves = (primary.saves || 0) + (secondary.saves || 0);
    await AggregatedProperty.findByIdAndUpdate(primary._id, merged);
    await AggregatedProperty.findByIdAndUpdate(secondary._id, { isPublished: false, canonicalPropertyId: primary._id });
    return merged;
  }

  async mergeDuplicates() {
    const duplicates = await AggregatedProperty.find({ canonicalPropertyId: { $exists: false }, mergedFrom: { $exists: false } }).limit(50);
    let count = 0;
    for (const p of duplicates) {
      const similar = await AggregatedProperty.find({ _id: { $ne: p._id }, title: p.title, price: p.price, bedrooms: p.bedrooms, $or: [{ town: p.town }, { estate: p.estate }] }).limit(5);
      if (similar.length > 0) { await this.merge(p, similar[0]); count++; }
    }
    return count;
  }
}

module.exports = PropertyMergeService;
