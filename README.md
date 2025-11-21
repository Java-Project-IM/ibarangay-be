# Barangay Services Backend API

Enterprise-grade REST API for the Barangay Online Services System built with Node.js, Express, TypeScript, and MongoDB.

## 🏗️ Architecture

This backend follows the **MVC (Model-View-Controller)** pattern with clear separation of concerns:

```
src/
├── controllers/     # Request handlers and business logic coordination
├── models/          # MongoDB schemas and data models
├── routes/          # API endpoint definitions
├── middleware/      # Authentication, authorization, error handling
├── config/          # Database and app configuration
├── types/           # TypeScript interfaces and types
└── server.ts        # Application entry point
```

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Staff, Resident)
- **Service Management**: Handle borrow/return requests for barangay equipment
- **Complaint System**: Submit and track complaints with status updates
- **Event Management**: Create, manage, and register for barangay events
- **Notification System**: Real-time notifications for users
- **Security**: Password hashing with bcrypt, JWT tokens, protected routes
- **Validation**: Request validation and error handling
- **TypeScript**: Full type safety and better developer experience

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. **Navigate to backend directory**:

   ```bash
   cd barangay-services-backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/barangay_services
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Initialize the database** (see Database Setup section below)

## 🗄️ Database Setup

Run the initialization script to create collections and seed sample data:

```bash
node init-db.js
```

This will create:

- Users collection with sample admin, staff, and resident accounts
- Services, Complaints, Events, and Notifications collections
- Proper indexes for optimal query performance

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Server will run on `http://localhost:5000` with hot-reload enabled.

### Production Mode

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "email": "juan@example.com",
  "password": "password123",
  "address": "123 Main St, Barangay XYZ",
  "phoneNumber": "09123456789"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

#### Get Profile

```http
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "address": "456 New St",
  "phoneNumber": "09987654321"
}
```

### Service Endpoints

#### Create Service Request

```http
POST /api/v1/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemName": "Tent",
  "itemType": "Equipment",
  "borrowDate": "2024-12-25",
  "expectedReturnDate": "2024-12-27",
  "purpose": "Family gathering",
  "quantity": 2,
  "notes": "Need large tents"
}
```

#### Get All Service Requests

```http
GET /api/v1/services?status=pending
Authorization: Bearer <token>
```

#### Get Service Request by ID

```http
GET /api/v1/services/:id
Authorization: Bearer <token>
```

#### Update Service Status (Admin/Staff only)

```http
PUT /api/v1/services/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "notes": "Approved for pickup"
}
```

#### Delete Service Request

```http
DELETE /api/v1/services/:id
Authorization: Bearer <token>
```

### Complaint Endpoints

#### Create Complaint

```http
POST /api/v1/complaints
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Street Light Not Working",
  "description": "The street light on Main St has been out for 3 days",
  "category": "Infrastructure",
  "priority": "high"
}
```

#### Get All Complaints

```http
GET /api/v1/complaints?status=pending&priority=high
Authorization: Bearer <token>
```

#### Get Complaint by ID

```http
GET /api/v1/complaints/:id
Authorization: Bearer <token>
```

#### Update Complaint Status (Admin/Staff only)

```http
PUT /api/v1/complaints/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "response": "Street light has been fixed"
}
```

### Event Endpoints

#### Create Event (Admin/Staff only)

```http
POST /api/v1/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Community Clean-up Drive",
  "description": "Join us for a community clean-up",
  "eventDate": "2024-12-30",
  "location": "Barangay Hall",
  "category": "Community Service",
  "maxAttendees": 50
}
```

#### Get All Events

```http
GET /api/v1/events?status=upcoming&category=Community Service
```

#### Get Event by ID

```http
GET /api/v1/events/:id
```

#### Register for Event

```http
POST /api/v1/events/:id/register
Authorization: Bearer <token>
```

#### Unregister from Event

```http
POST /api/v1/events/:id/unregister
Authorization: Bearer <token>
```

#### Update Event

```http
PUT /api/v1/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Event Title",
  "maxAttendees": 100
}
```

### Notification Endpoints

#### Get Notifications

```http
GET /api/v1/notifications?isRead=false
Authorization: Bearer <token>
```

#### Mark Notification as Read

```http
PUT /api/v1/notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All as Read

```http
PUT /api/v1/notifications/read-all
Authorization: Bearer <token>
```

#### Delete Notification

```http
DELETE /api/v1/notifications/:id
Authorization: Bearer <token>
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is returned upon successful login or registration.

## 👥 User Roles

- **Admin**: Full access to all features
- **Staff**: Can manage service requests, complaints, and events
- **Resident**: Can create requests, complaints, and register for events

## 🧪 Testing

Test the API using tools like:

- Postman
- Insomnia
- cURL
- Thunder Client (VS Code extension)

## 📦 Project Structure Details

### Controllers

Handle HTTP requests and responses, coordinate business logic.

### Models

Define MongoDB schemas with validation, indexes, and methods.

### Routes

Define API endpoints and link them to controllers.

### Middleware

- `auth.ts`: JWT authentication and role-based authorization
- `errorHandler.ts`: Centralized error handling

### Types

TypeScript interfaces for type safety across the application.

## 🚨 Error Handling

All errors are handled centrally and return consistent JSON responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## 🔧 Environment Variables

| Variable    | Description               | Default                                     |
| ----------- | ------------------------- | ------------------------------------------- |
| PORT        | Server port               | 5000                                        |
| NODE_ENV    | Environment               | development                                 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/barangay_services |
| JWT_SECRET  | Secret key for JWT        | -                                           |
| JWT_EXPIRE  | Token expiration          | 7d                                          |
| CORS_ORIGIN | Allowed origin            | http://localhost:5173                       |

## 📝 Sample Accounts (After DB Init)

- **Admin**: admin@barangay.com / admin123
- **Staff**: staff@barangay.com / staff123
- **Resident**: resident@barangay.com / resident123

## 🤝 Contributing

This is a presentation project. For production use, consider:

- Adding rate limiting
- Implementing refresh tokens
- Adding input sanitization
- Setting up logging (Winston, Morgan)
- Adding API documentation (Swagger)
- Implementing file upload (Multer)
- Adding email notifications (Nodemailer)

## 📄 License

MIT License - Feel free to use this for your projects!

## 🆘 Support

For issues or questions, please refer to the documentation or create an issue in the repository.
