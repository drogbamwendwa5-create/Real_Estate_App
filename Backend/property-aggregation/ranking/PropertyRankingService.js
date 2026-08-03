/**
 * Property Ranking Service
 * Calculates ranking scores (1-100) based on multiple factors.
 */
const rankingConfig = require('../config/ranking.config');
const AggregatedProperty = require('../database/AggregatedProperty');
const PropertyRanking = require('../database/PropertyRanking');

class PropertyRankingService {
  async calculateScore(property) {
    const scores = {};
    const now = new Date();
    const daysSinceUpdate = property.lastUpdated
      ? (now - property.lastUpdated) / (1000 * 60 * 60 * 24)
      : 999;

    scores.freshness = this.scoreFreshness(daysSinceUpdate);
    scores.images = this.scoreImages(property.propertyImages ? property.propertyImages.length : 0);
    scores.location = this.scoreLocation(property);
    scores.verification = this.scoreVerification(property.verifiedStatus);
    scores.popularity = this.scorePopularity(property.views || 0);
    scores.savedCount = this.scoreSaved(property.saves || 0);
    scores.descriptionCompleteness = this.scoreDescription(property.description);
    scores.propertyCompleteness = this.scoreCompleteness(property);
    scores.developerStatus = property.isDeveloperListing ? 100 : 0;
    scores.amenities = this.scoreAmenities(property.amenities ? property.amenities.length : 0);

    let total = 0;
    for (const [key, weight] of Object.entries(rankingConfig.weights)) {
      total += (scores[key] || 0) * weight / 100;
    }
    total = Math.max(rankingConfig.minScore, Math.min(rankingConfig.maxScore, Math.round(total)));

    return { totalScore: total, scores };
  }

  scoreFreshness(days) {
    if (days <= rankingConfig.freshness.freshDays) return 100;
    if (days >= rankingConfig.freshness.staleDays) return 0;
    return Math.round(100 - (100 * (days - rankingConfig.freshness.freshDays) /
      (rankingConfig.freshness.staleDays - rankingConfig.freshness.freshDays)));
  }

  scoreImages(count) {
    if (count >= rankingConfig.images.optimalCount) return 100;
    if (count <= rankingConfig.images.minCount) return 0;
    return Math.round((count / rankingConfig.images.optimalCount) * 100);
  }

  scoreLocation(p) {
    let s = 0;
    if (p.county) s += 40;
    if (p.town) s += 30;
    if (p.estate) s += 20;
    if (p.latitude && p.longitude) s += 10;
    return s;
  }

  scoreVerification(status) {
    if (status === 'verified') return 100;
    if (status === 'pending') return 50;
    if (status === 'ai-flagged') return 25;
    return 0;
  }

  scorePopularity(views) {
    if (views >= rankingConfig.popularity.highViews) return 100;
    if (views <= rankingConfig.popularity.lowViews) return 0;
    return Math.round((views / rankingConfig.popularity.highViews) * 100);
  }

  scoreSaved(saves) {
    if (saves >= rankingConfig.savedCount.highSaves) return 100;
    if (saves <= rankingConfig.savedCount.lowSaves) return 0;
    return Math.round((saves / rankingConfig.savedCount.highSaves) * 100);
  }

  scoreDescription(desc) {
    if (!desc) return 0;
    if (desc.length >= rankingConfig.description.optimalLength) return 100;
    if (desc.length <= rankingConfig.description.minLength) return 0;
    return Math.round((desc.length / rankingConfig.description.optimalLength) * 100);
  }

  scoreCompleteness(p) {
    let filled = 0;
    rankingConfig.completenessFields.forEach(f => {
      if (p[f] !== undefined && p[f] !== null && p[f] !== '' &&
        !(Array.isArray(p[f]) && p[f].length === 0)) filled++;
    });
    return Math.round((filled / rankingConfig.completenessFields.length) * 100);
  }

  scoreAmenities(count) {
    if (count >= rankingConfig.amenities.optimalCount) return 100;
    if (count <= rankingConfig.amenities.minCount) return 0;
    return Math.round((count / rankingConfig.amenities.optimalCount) * 100);
  }

  async updateRanking(propertyId) {
    try {
      const property = await AggregatedProperty.findById(propertyId);
      if (!property) return null;
      const { totalScore, scores } = await this.calculateScore(property);
      property.rankingScore = totalScore;
      property.isFeatured = totalScore >= rankingConfig.featuredThreshold;
      await property.save();
      await PropertyRanking.findOneAndUpdate(
        { propertyId },
        {
          propertyId, totalScore, scores,
          isFeatured: totalScore >= rankingConfig.featuredThreshold,
          isVerified: totalScore >= rankingConfig.verifiedThreshold,
          lastCalculatedAt: new Date(),
        },
        { upsert: true }
      );
      return totalScore;
    } catch (e) {
      console.error('Update ranking error:', e.message);
      return null;
    }
  }

  async updateAllRankings(batchSize = 100) {
    try {
      const count = await AggregatedProperty.countDocuments({ isPublished: true });
      let updated = 0;
      for (let i = 0; i < count; i += batchSize) {
        const properties = await AggregatedProperty.find({ isPublished: true })
          .skip(i).limit(batchSize);
        for (const p of properties) {
          await this.updateRanking(p._id);
          updated++;
        }
      }
      return { updated, total: count };
    } catch (e) {
      console.error('Update all rankings error:', e.message);
      return { updated: 0, total: 0 };
    }
  }
}

module.exports = PropertyRankingService;