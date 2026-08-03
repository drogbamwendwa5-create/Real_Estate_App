# Property Aggregation System — Database Integration Report

## 1. EXECUTIVE SUMMARY

The Real Estate App uses **Mongoose/MongoDB**. A property-aggregation module already exists under `Backend/property-aggregation/` with database models defined in `database/`. The existing main `Property` model (in `Backend/Models/Property.js`) stores **agent-uploaded** listings, while the aggregation system handles **internet-sourced** listings in `AggregatedProperty`. These are separate but parallel concerns that should be integrated through shared services and APIs.

## 2. EXISTING ARCHITECTURE ANALYSIS

### 2.1 Database Technology

- **ORM**: Mongoose v9.8.0
- **Database**: MongoDB (Docker: `mongo:6`)
- **Connection**: `Backend/Config/database.js` via `process.env.MONGODB_URI`

### 2.2 Existing Property-Related Models

| Model | Location | Purpose | Relationship |
|-------|----------|---------|--------------|
| `Property` | `Backend/Models/Property.js` | Agent-uploaded listings | agent → User |
| `Favourite` | `Backend/Models/Favourite.js` | User saved properties | user → User, property → Property |
| `Review` | `Backend/Models/Review.js` | Property reviews | property → Property |
| `Category` | `Backend/Models/Category.js` | Property categories | parent → Category |
| `Subscription` | `Backend/Models/Subscription.js` | Agent subscriptions | agent → User |
| `Conversation` | `Backend/Models/Conversation.js` | Messaging conversations | participants → User[], property → Property |
| `Message` | `Backend/Models/Message.js` | Chat messages | conversation → Conversation, sender → User |
| `Notification` | `Backend/Models/Notification.js` | User notifications | user → User |
| `Admin` | `Backend/Models/Admin.js` | Admin roles/perms | user → User |

### 2.3 Existing Aggregation Models (property-aggregation/database/)

| Model | Purpose | Key Fields | Indexes |
|-------|---------|-----------|---------|
| `AggregatedProperty` | Main aggregated listing | propertyID, sourceName, price, location, county, town, rankingScore, availability | propertyID(unique), sourceName, price, county+town, sourceName+sourceID(unique), location(2dsphere), price+listingType, isFeatured, isPublished, availability |
| `PropertySource` | Scraper source config | sourceKey(unique), baseUrl, enabled, scraperConfig | sourceKey |
| `PropertyDuplicate` | Duplicate detection records | primaryPropertyId, duplicatePropertyId, similarityScore, isMerged | primary+duplicate(unique) |
| `PropertyRanking` | Ranking scores per property | propertyId(unique), totalScore, scores(freshness, images, location, etc.) | totalScore |
| `PropertyRecommendation` | User recommendations | userId+propertyId(unique), score, reason, factors | userId+propertyId |
| `PropertySearchHistory` | Search query tracking | userId, sessionId, query, filters, resultsCount | userId+createdAt, sessionId+createdAt |
| `PropertyView` | Property view tracking | propertyId, userId, sessionId, source | propertyId+createdAt |
| `PropertySaved` | User saved aggregated properties | userId+propertyId(unique), notes | userId+propertyId |
| `PropertyPriceHistory` | Price change history | propertyId+createdAt | propertyId+createdAt |
| `PropertyValidationLog` | Validation audit log | propertyId, validationType, status, score | — |
| `PropertyScraperLog` | Scraper run log | sourceKey+createdAt | sourceKey+createdAt |

### 2.4 Existing Services

| Service | Location | Purpose |
|---------|----------|---------|
| `propertyService.js` | `Backend/Services/` | CRUD, search, nearby, recommendations, views (operates on `Property` model) |
| `searchService.js` | `Backend/Services/` | Advanced search with text search, autocomplete (operates on `Property` model) |
| `notificationService.js` | `Backend/Services/` | Notification creation |
| `cloudinaryService.js` | `Backend/Services/` | Image upload/delete |

### 2.5 Existing Controllers & APIs

- `Backend/Controllers/propertyController.js` → `Backend/Routes/propertyRoutes.js` mounted at `/api/properties`
- Property Aggregation API already defined at `/api/property-aggregation` (mounted in `app.js`)

### 2.6 Frontend Integration Points

- Redux `propertySlice` tracks: listings, featured, current, loading, pagination
- Frontend API calls through `Frontend/Services/` and `Frontend/Config/api.js`
- Key components: `PropertyCard.js`, `HeroSearch.js`, `search.js` tab

## 3. RECOMMENDED DATABASE INTEGRATION STRATEGY

### 3.1 Model Decisions

| Decision | Model | Rationale |
|----------|-------|-----------|
| **KEEP AS-IS** | `Property` | Represents agent-uploaded listings. Schema is sound and actively used. Add aggregation-specific fields only if needed. |
| **CREATE** | `AggregatedProperty` | Web-scraped listings need separate schema with source tracking, validation fields, and ranking. |
| **CREATE** | `PropertySource` | Tracks scrape sources independently. |
| **CREATE** | `PropertyDuplicate` | Duplicate detection needs its own table linking two AggregatedProperties. |
| **CREATE** | `PropertyRanking` | Ranking scores per aggregated property. |
| **CREATE** | `PropertyRecommendation` | User recommendations for aggregated properties. |
| **CREATE** | `PropertySearchHistory` | Search history suggestions. |
| **CREATE** | `PropertyView` | Separate view tracking for aggregated properties. |
| **CREATE** | `PropertySaved` | User saved aggregated properties. |
| **CREATE** | `PropertyPriceHistory` | Price change tracking. |
| **CREATE** | `PropertyValidationLog` | Audit trail for validations. |
| **CREATE** | `PropertyScraperLog` | Scraper operation logging. |
| **EXTEND** | `User` model | No change needed; recommendation/view/saved models reference User via ObjectId. |
| **EXTEND** | `Favourite` model | **Option A**: Keep for `Property` only. **Option B**: Extend to support polymorphic favourite (Property OR AggregatedProperty). Recommended: Option B with `referenceType` and `referenceId`. |

### 3.2 Relationships

```
User (existing)
  ├── Favourite (referenceType: "Property"|"AggregatedProperty")
  ├── PropertySaved (AggregatedProperty)
  ├── PropertyView (AggregatedProperty)
  ├── PropertySearchHistory
  └── PropertyRecommendation (AggregatedProperty)

Property (existing)
  └── Favourite
  └── Review
  └── Conversation

AggregatedProperty (new)
  ├── PropertySource
  ├── PropertyDuplicate (as primary OR duplicate)
  ├── PropertyRanking (1:1)
  ├── PropertySaved (many)
  ├── PropertyView (many)
  ├── PropertyRecommendation (many)
  ├── PropertyPriceHistory (many)
  └── PropertyValidationLog (many)
```

### 3.3 Indexing Strategy

All aggregation models already have appropriate indexes defined. Ensure compound indexes for:
- `PropertyView`: `propertyId + createdAt`
- `PropertySearchHistory`: `userId + createdAt`, `sessionId + createdAt`
- `PropertyDuplicate`: `primaryPropertyId + duplicatePropertyId` (unique)
- `AggregatedProperty`: `sourceName + sourceID` (unique), geospatial 2dsphere

### 3.4 API Integration Strategy

**Existing APIs remain untouched.** Property aggregation APIs operate at `/api/property-aggregation/*`.

**Integration approach**:
1. Extend `Frontend/Services/api.js` to include aggregation endpoints
2. Extend `propertySlice.js` to handle aggregated property data
3. Add `aggregationSlice.js` in Redux for aggregation-specific state (cached searches, map bounds, etc.)
4. Extend search and map components to optionally consume aggregation data

### 3.5 Frontend State Strategy

Add to `propertySlice`:
```js
aggregatedProperties: [],
aggregatedCurrentProperty: null,
// ... keep existing shape, add aggregation sub-states
```

Or create a separate `aggregationSlice` with:
- `searchResults`
- `savedProperties`
- `searchHistory`
- `recommendations`
- `mapBounds`

## 4. DATABASE SCHEMA (EXTENDED & FORMATTED)

### 4.1 Property.js — No Change Required (agent-uploaded)

Existing schema is sufficient. Only markdown fields should be added if future integration needs.

### 4.2 Favourite.js — Extend for Polymorphism

```js
const FavouriteSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  property: { type: ObjectId, ref: 'Property', default: null },
  aggregatedProperty: { type: ObjectId, ref: 'AggregatedProperty', default: null },
  createdAt: { type: Date, default: Date.now },
});
FavouriteSchema.index({ user: 1, property: 1 }, { unique: true, sparse: true });
FavouriteSchema.index({ user: 1, aggregatedProperty: 1 }, { unique: true, sparse: true });
```

### 4.3 AggregatedProperty.js — Defined (Minified → Formatted)

(See existing file; indexes and schema are already defined.)

### 4.4 PropertySource.js — Defined (Minified → Formatted)

(See existing file.)

### 4.5 PropertyDuplicate.js — Defined (Formatted)

(See existing file.)

### 4.6 PropertyRanking.js — Defined (Formatted)

(See existing file.)

### 4.7 PropertyRecommendation.js — Defined (Formatted)

(See existing file.)

### 4.8 PropertySearchHistory.js — Defined (Formatted)

(See existing file.)

### 4.9 PropertyView.js — Defined (Minified → Formatted)

(See existing file.)

### 4.10 PropertySaved.js — Defined (Minified → Formatted)

(See existing file.)

### 4.11 PropertyPriceHistory.js — Defined (Minified → Formatted)

(See existing file.)

### 4.12 PropertyValidationLog.js — Defined (Minified → Formatted)

(See existing file.)

### 4.13 PropertyScraperLog.js — Defined (Minified → Formatted)

(See existing file.)

## 5. MIGRATION PLAN

Since no migration system currently exists, the following approach is recommended:

1. Create `Backend/property-aggregation/database/migrations/` directory.
2. Create a migration runner script.
3. Migrations are idempotent (safe to run multiple times).
4. Sequence:
   - `001_create_aggregation_models.js` — Create indexes on existing-but-not-created collections
   - `002_extend_favourite_model.js` — Add aggregatedProperty field to Favourite
   - `003_backfill_aggregated_properties.js` — Optional: backfill from Property if needed

**Note**: Mongoose does not automatically create collections/indexes unless models are loaded. Ensure all aggregation models are imported and used at app startup.

## 6. IMPLEMENTATION CHECKLIST

- [x] Analyze existing Property model and schema
- [x] Enumerate existing aggregation models
- [x] Identify integration points (Favourite, search, recommendations)
- [x] Server is already mounting aggregation routes (`/api/property-aggregation`)
- [ ] Extend `Favourite` model to support aggregated properties
- [ ] Ensure aggregation indexes are created at startup
- [ ] Create migration `001_create_indexes.js`
- [ ] Extend `propertyService.js` to optionally operate on AggregatedProperty
- [ ] Extend `searchService.js` to search both Property and AggregatedProperty
- [ ] Extend `propertyController.js` with aggregation endpoints (or keep independent)
- [ ] Create `aggregationSlice.js` in Frontend
- [ ] Extend `api.js` with aggregation endpoints
- [ ] Extend `PropertyCard` to render aggregated properties
- [ ] Connect scheduler in `Server.js` when `ENABLE_PROPERTY_AGGREGATION=true`

## 7. DECISION SUMMARY

| Area | Decision |
|------|----------|
| Keep Property model | Yes — agent-uploaded listings |
| Create AggregatedProperty model | Yes — web-scraped listings |
| Polymorphic Favourite | Yes — extend with `aggregatedProperty` field |
| Shared search | Yes — extend searchService to search both collections |
| Separate API namespace | Yes — `/api/property-aggregation` keeps concerns isolated |
| Redux state | Add `aggregationSlice` for new data, keep `propertySlice` for existing |
| Migrations | Yes — create lightweight Mongoose migration runner |
| Data flow | Internet → Scrapers → Parsers → Validation → Duplicate Detection → AI → Image Validation → Normalization → Database Integration Layer → Models → Cache → API → Search → Recommendations → Frontend |