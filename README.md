# Real Estate App

A full-stack real estate application built with React Native (Expo) for the frontend and Node.js/Express for the backend.

## Features

- User authentication (register, login, forgot password, email verification)
- Property listings with search and filters
- Property details with image gallery
- Favourites management
- Messaging between users and agents
- Notifications
- User profile management
- Admin dashboard
- Payment integration (Stripe)
- Cloudinary image upload

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for image uploads
- Nodemailer for emails
- Stripe for payments

### Frontend
- React Native with Expo
- Redux Toolkit for state management
- React Navigation
- React Native Paper
- Axios for API calls

## Keeping the Render API awake

The Expo app uses `https://real-estate-app-jvgi.onrender.com/api`. The GitHub
Actions workflow at `.github/workflows/render-keepalive.yml` calls
`/api/health` every 10 minutes and after frontend changes are pushed. Once this
repository is pushed to GitHub, enable Actions for the repository; no secrets
are required. This avoids the cold start associated with an idle Render service.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Expo CLI

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd Backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd Frontend
   npm install
   ```

4. Configure environment variables:
   - Copy `Backend/.env.example` to `Backend/.env`
   - Update the variables with your credentials

5. Run the backend server:
   ```bash
   cd Backend
   npm start
   ```

6. Run the frontend app:
   ```bash
   cd Frontend
   npm start
   ```

## Environment Variables

### Backend (.env)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port
- `EMAIL_USER` - Email username
- `EMAIL_PASS` - Email password
- `FRONTEND_URL` - Frontend URL for email links
- `STRIPE_SECRET_KEY` - Stripe secret key (optional)

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `PUT /api/auth/update-password` - Update password
- `GET /api/auth/verify-email/:token` - Verify email
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/my-properties` - Get my properties
- `GET /api/properties/featured` - Get featured properties

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get single user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `PUT /api/users/profile` - Update own profile
- `DELETE /api/users/account` - Delete own account

### Favourites
- `GET /api/favourites` - Get user favourites
- `POST /api/favourites/:propertyId` - Add to favourites
- `DELETE /api/favourites/:propertyId` - Remove from favourites

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:conversationId` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:conversationId/read` - Mark as read

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Data Model

The application persists data in **MongoDB** via Mongoose. The backend defines the collections below; the frontend mirrors them in Redux state and local constants.

### Backend Collections (Mongoose Models)

**User** (`Models/User.js`)
- Identity: `name`, `email` (unique), `password` (bcrypt-hashed, `select:false`), `phone`, `avatar { public_id, url }`
- Roles: `role` (`user | agent | admin | super-admin | agency-professional | property-owner | buyer-tenant | guest`), `canonicalRole` (normalized for access control), `isVerified`
- Profile: `profile { displayName, coverPhoto, bio, languages[], country, county, city, address, company, website, socialLinks }`
- Verification: `professionalVerification { status, verifiedAt, expiresAt }`, `ownerVerification { status, verifiedAt, expiresAt }`
- Presence/security: `onlineStatus`, `lastSeenAt`, `loginCount`, `failedLoginCount`, `suspendedAt`, `isActive`, `verificationToken`, `resetPasswordToken`, `resetPasswordExpire`
- Methods: `comparePassword()`, `generateJWT()`, `generateResetToken()`

**Property** (`Models/Property.js`) — user-created listings
- Core: `title`, `description`, `price`, `currency` (default `KES`), `propertyType` (`apartment | house | land | commercial`), `category` (ref `Category`), `status` (`for-sale | for-rent | sold | rented`)
- Specs: `bedrooms`, `bathrooms`, `area`, `lotSize`, `yearBuilt`
- Location: `address { street, city, state, zipCode, country }`, `location` (GeoJSON `Point`, `2dsphere` indexed), `propertyBoundary` (GeoJSON `Polygon`)
- Media/docs: `images[] { url, publicId, isFeatured }`, `videos[]`, `documents[] { name, url }`, `features[]`, `amenities[]`, `nearbyPlaces[] { name, type, distance }`
- Ownership: `agent` (ref `User`, required)
- Verification pipeline: `verificationStatus` (draft → submitted → automated-validation → fraud-detection → duplicate-detection → document-verification → location-verification → image-verification → moderator-review → approved → published / rejected / archived), `verification { submittedAt, automatedAt, reviewedAt, reviewedBy, rejectionReason, checks }`, `ownershipDocuments[]` (ref `VerificationRequest`), `fraudFlags[]`, `duplicateScore`, `imageMetadata[] { sha256, width, height, size, mimeType, thumbnailUrl }`, `locationVerification { status, reverseGeocoded, checkedAt }`
- Enrichment (added by OSM/aggregation services): `nearbyAmenities { schools, hospitals, universities, banks, shopping, policeStations, restaurants, pharmacies, petrolStations }[]`, `investmentScore { overall, rentalYield, amenityScore, locationScore, marketDemand, infrastructureScore, calculatedAt }`
- Stats: `views`, `isFeatured`, `isPublished`

**AggregatedProperty** (`property-aggregation/database/AggregatedProperty.js`) — scraped/aggregated listings
- `propertyID` (unique), `sourceID`, `sourceName`, `title`, `description`, `price`, `currency`, `listingType`, `propertyType`
- Location: `county`, `town`, `estate`, `latitude`, `longitude`, `location` (GeoJSON `Point`)
- Specs: `bedrooms`, `bathrooms`, `parking`, `size`, `furnished`, `petsAllowed`, `serviced`
- Agent: `agentName`, `agencyName`, `agentPhone`, `agentEmail`, `isVerifiedAgent`
- Media: `propertyImages[] { url, isFeatured, isValid, publicId }`, `propertyVideos[] { url, type }`, `amenities[]`
- Lifecycle/ranking: `postedDate`, `lastUpdated`, `availability`, `rankingScore`, `verifiedStatus`, `isFeatured`, `isDeveloperListing`, `isPublished`, `views`, `saves`
- Provenance: `sourceURL`, `promotionType`, `socialPlatform`, `socialHandle`, `promotionURL`, `promotedBy`, `sourceCategory`
- Quality: `validationScore`, `aiValidationScore`, `aiValidationFlags[]`, `validationErrorList[]`, `mergedFrom[]` (ref `AggregatedProperty`), `canonicalPropertyId`

**Conversation** (`Models/Conversation.js`)
- `participants[]` (ref `User`), `lastMessage { text, sender, createdAt }`, `isActive`

**Message** (`Models/Message.js`)
- `conversation` (ref `Conversation`), `sender` (ref `User`), `text`, `images[]`, `isRead`, `readAt`

**Favourite** (`Models/Favourite.js`)
- `user` (ref `User`), `property` (ref `Property`, sparse-unique) **or** `aggregatedProperty` (ref `AggregatedProperty`, sparse-unique) — one of the two is required

**Notification** (`Models/Notification.js`)
- `recipient` (ref `User`), `sender` (ref `User`), `type` (`message | property | review | system | subscription`), `title`, `message`, `data` (Mixed), `isRead`, `readAt`

**Category** (`Models/Category.js`)
- `name` (unique), `slug` (unique), `description`, `image { public_id, url }`, `icon`, `parent` (self ref, for hierarchy), `isActive`

**Review** (`Models/Review.js`)
- `property` (ref `Property`), `user` (ref `User`), `rating` (1–5), `comment`, `images[]`, `isApproved`

**Report** (`Models/Report.js`)
- `reporter` (ref `User`), `property` (ref `Property`), `targetUser` (ref `User`), `reason` (`fraud | scam | duplicate | incorrect-information | offensive-content | already-sold-rented | fake-images`), `description`, `status` (`open | triaged | resolved | dismissed`), `priority` (`low | normal | high | critical`), `reviewedBy`, `resolution`, `resolvedAt`

**Subscription** (`Models/Subscription.js`)
- `user` (ref `User`), `plan` (`free | basic | premium | enterprise`), `status` (`active | expired | cancelled | pending`), `startDate`, `endDate`, `autoRenew`, `features { maxListings, featuredListings, imageUploads, virtualTours, analytics }`, `price`

**VerificationRequest** (`Models/VerificationRequest.js`)
- `user` (ref `User`), `property` (ref `Property`), `type` (`professional | ownership | listing`), `status` (`pending | approved | rejected | expired`)
- `documents[]` — `EncryptedDocumentSchema { name, mimeType, size, iv, authTag, ciphertext, sha256, uploadedAt }` (encrypted at rest, sensitive fields `select:false`)
- `checks` (Mixed), `notes`, `reviewedBy`, `reviewedAt`, `expiresAt`

**Admin** (`Models/Admin.js`) — extends a `User` with admin scope
- `user` (ref `User`, unique), `permissions[]` (`manage_users | manage_properties | manage_reviews | manage_categories | manage_subscriptions | view_reports | manage_settings`), `role` (`super-admin | admin | moderator`), `lastLogin`, `isActive`

**Role** (`Models/Role.js`) / **Permission** (`Models/Permission.js`) — RBAC
- `Role`: `key` (unique, immutable for system roles), `name`, `permissions[]` (ref `Permission`), `system`, `active`
- `Permission`: `key` (unique, immutable), `description`, `active`

**RefreshToken** (`Models/RefreshToken.js`)
- `user` (ref `User`), `tokenHash` (unique), `deviceId`, `userAgent`, `ip`, `expiresAt` (TTL index), `revokedAt`

**LoginHistory** (`Models/LoginHistory.js`)
- `user` (ref `User`), `email`, `success`, `ip`, `userAgent`, `reason`, `createdAt`

**AuditLog** (`Models/AuditLog.js`)
- `actor` (ref `User`), `action`, `entityType`, `entityId`, `metadata` (Mixed), `ip`, `userAgent`, `createdAt`

**PlatformConfig** (`Models/PlatformConfig.js`)
- `key` (unique, default `default`), `featureFlags` (Mixed), `settings` (Mixed)

### Frontend State & Local Data

**Redux Toolkit store** (`Frontend/store/slices/`)
- `authSlice` — current user, token, role, auth status
- `propertySlice` — property listings, filters, selected property, pagination
- `favouriteSlice` — user's saved properties
- `messageSlice` — conversations and messages
- `mapSlice` — map view state, viewport, markers, drawers
- `uiSlice` — theme mode, toasts, loading/UI flags
- `aggregationSlice` — aggregated/scraped listing state

**Static constants & datasets** (`Frontend/data/`, `Frontend/Constants/`)
- `data/categories.js` — `CATEGORIES[]` (Apartment, House, Villa, Office, Land, Commercial, Condo, Townhouse) with icons/images/counts
- `data/propertyTypes.js` — `PROPERTY_TYPES`, `PROPERTY_STATUS`, `AMENITIES[]`, `FEATURES[]`, `SORT_OPTIONS`, `PRICE_RANGES`
- `Constants/index.js` — `COLORS`, `SIZES`, `FONTS`, `SHADOWS`
- `theme/index.js` & `Config/theme.js` — light/dark theme color palettes (`getTheme`, `customLightTheme`, `customDarkTheme`)

**Theme & persistence**
- Theme mode is stored in `AsyncStorage` under the `theme` key (`light`/`dark`) and provided via `ThemeContext` + Paper `PaperProvider` (`Frontend/Context/ThemeContext.js`, `Frontend/app/_layout.js`).

## Project Structure

```
Real-Estate-App/
├── Backend/
│   ├── Config/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Models/
│   ├── Routes/
│   ├── Services/
│   ├── Utils/
│   ├── Validators/
│   └── package.json
└── Frontend/
    ├── App/
    ├── Components/
    ├── Config/
    ├── Context/
    ├── Hooks/
    ├── Navigation/
    ├── Screens/
    ├── Services/
    ├── Styles/
    ├── theme/
    ├── Utils/
    └── package.json
```

## License

ISC
