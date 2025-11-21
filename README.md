# Barangay Online Services - Backend API

Enterprise-grade REST API for the Barangay Online Services System built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Service Requests**: Borrow and return barangay equipment
- **Complaints Management**: Submit and track community complaints
- **Events Management**: Create and register for barangay events
- **Notifications**: Real-time notifications for users
- **Security**: Rate limiting, helmet, CORS, input validation
- **Error Handling**: Comprehensive error handling with custom error classes
- **Database**: MongoDB with Mongoose ODM
- **TypeScript**: Full type safety and IntelliSense support

## 📋 Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x
- npm or yarn

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/Java-Project-IM/ibarangay-be.git
cd ibarangay-be
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/barangay_services
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
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
  "address": "123 Main St, Barangay",
  "phoneNumber": "+63 912 345 6789"
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
  "address": "456 New St, Barangay",
  "phoneNumber": "+63 912 345 6789"
}
```

### Service Request Endpoints

#### Create Service Request

```http
POST /api/v1/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemName": "Basketball Court",
  "itemType": "Facility",
  "borrowDate": "2024-01-15",
  "expectedReturnDate": "2024-01-16",
  "purpose": "Community basketball tournament",
  "quantity": 1,
  "notes": "Need access from 8 AM to 5 PM"
}
```

#### Get All Service Requests

```http
GET /api/v1/services
Authorization: Bearer <token>
Query Parameters: ?status=pending
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
  "notes": "Request approved"
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
  "description": "The street light on Main St has been broken for 3 days",
  "category": "Infrastructure",
  "priority": "high"
}
```

#### Get All Complaints

```http
GET /api/v1/complaints
Authorization: Bearer <token>
Query Parameters: ?status=pending&priority=high
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
  "description": "Join us for a community clean-up event",
  "eventDate": "2024-02-01T08:00:00Z",
  "location": "Barangay Hall",
  "category": "Community Service",
  "maxAttendees": 50
}
```

#### Get All Events

```http
GET /api/v1/events
Authorization: Bearer <token>
Query Parameters: ?status=upcoming&category=Community Service
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

### Notification Endpoints

#### Get Notifications

```http
GET /api/v1/notifications
Authorization: Bearer <token>
Query Parameters: ?isRead=false
```

#### Mark Notification as Read

```http
PUT /api/v1/notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All Notifications as Read

```http
PUT /api/v1/notifications/read-all
Authorization: Bearer <token>
```

#### Delete Notification

```http
DELETE /api/v1/notifications/:id
Authorization: Bearer <token>
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Express-validator for request validation
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password encryption
- **Error Handling**: Comprehensive error handling

## 🗂️ Project Structure

```
src/
├── config/           # Configuration files
│   └── database.ts   # Database connection
├── controllers/      # Route controllers
│   ├── authController.ts
│   ├── serviceController.ts
│   ├── complaintController.ts
│   ├── eventController.ts
│   └── notificationController.ts
├── middleware/       # Custom middleware
│   ├── auth.ts       # Authentication middleware
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   └── validation.ts
├── models/          # Mongoose models
│   ├── User.ts
│   ├── Service.ts
│   ├── Complaint.ts
│   ├── Event.ts
│   └── Notification.ts
├── routes/          # API routes
│   ├── authRoutes.ts
│   ├── serviceRoutes.ts
│   ├── complaintRoutes.ts
│   ├── eventRoutes.ts
│   └── notificationRoutes.ts
├── types/           # TypeScript types
│   └── index.ts
├── utils/           # Utility functions
│   ├── AppError.ts
│   └── asyncHandler.ts
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable                | Description                          | Default                                     |
| ----------------------- | ------------------------------------ | ------------------------------------------- |
| NODE_ENV                | Environment (development/production) | development                                 |
| PORT                    | Server port                          | 5000                                        |
| MONGODB_URI             | MongoDB connection string            | mongodb://localhost:27017/barangay_services |
| JWT_SECRET              | Secret key for JWT                   | -                                           |
| JWT_EXPIRE              | JWT expiration time                  | 7d                                          |
| CORS_ORIGIN             | Allowed CORS origins                 | http://localhost:5173                       |
| RATE_LIMIT_WINDOW_MS    | Rate limit window                    | 900000                                      |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window              | 100                                         |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Development Team

## 🐛 Known Issues

None at the moment. Please report issues on GitHub.

## 📞 Support

For support, email support@barangay.local or open an issue on GitHub.
