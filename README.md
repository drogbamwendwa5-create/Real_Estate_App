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