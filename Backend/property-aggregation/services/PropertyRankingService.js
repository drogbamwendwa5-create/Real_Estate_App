const AggregatedProperty = require("../database/AggregatedProperty");
const rc = require("../config/ranking.config");

class PropertyRankingService {
  constructor() {
    this.weights = rc.weights;
  }

  calculateScore(property) {
    let score = 0;
    if (property.postedDate) {
      const age = Date.now() - new Date(property.postedDate).getTime();
      const days = age / (1000 * 60 * 60 * 24);
      score += Math.max(0, 100 - days) * this.weights.freshness;
    }
    if (property.propertyImages && property.propertyImages.length > 0)
      score += Math.min(100, property.propertyImages.length * 10) * this.weights.images;
    if (property.latitude && property.longitude) score += 100 * this.weights.location;
    if (property.verifiedStatus === "verified") score += 100 * this.weights.verification;
    score += Math.min(100, property.views || 0) * this.weights.popularity;
    score += Math.min(100, property.saves || 0) * this.weights.savedCount;
    if (property.description && property.description.length > 50)
      score += 100 * this.weights.descriptionCompleteness;
    let totalFields = 0;
    let filledFields = 0;
    const fields = ["title","price","propertyType","county","town","bedrooms","bathrooms","amenities","agentName","agentPhone"];
    for (const f of fields) { totalFields++; if (property[f]) filledFields++; }
    score += (filledFields / totalFields) * 100 * this.weights.propertyCompleteness;
    if (property.isDeveloperListing) score += 100 * this.weights.developerStatus;
    if (property.amenities && property.amenities.length > 0)
      score += Math.min(100, property.amenities.length * 5) * this.weights.amenities;
    return Math.min(100, Math.round(score));
  }

  async updateAllRankings() {
    const count = await AggregatedProperty.countDocuments();
    let updated = 0;
    for (let i = 0; i < count; i += 100) {
      const properties = await AggregatedProperty.find().skip(i).limit(100);
      for (const p of properties) {
        const score = this.calculateScore(p);
        await AggregatedProperty.findByIdAndUpdate(p._id, { rankingScore: score });
        updated++;
      }
    }
    return { updated };
  }
}

module.exports = PropertyRankingService;
