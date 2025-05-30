# User Profile Management API

A comprehensive RESTful API for managing user profiles with role-based authentication and authorization. Built with Node.js, Express, MongoDB, and JWT authentication.

> **Note**: This project was developed as part of a technical assessment to demonstrate backend development skills and best practices.

## 🚀 Features

- **User Management**: Create, read, update, and delete user profiles
- **Role-Based Access Control**: Admin and User roles with different permissions
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Secure password hashing using bcrypt
- **Input Validation**: Comprehensive request validation using Joi
- **Pagination**: Support for paginated responses
- **Error Handling**: Centralized error handling with meaningful messages
- **Security**: Rate limiting, CORS, and security headers
- **Testing**: Comprehensive unit tests using Jest and Supertest

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DishankChauhan/user-profile-management-api.git
   cd user-profile-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/user-profile-management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or if using MongoDB service
   sudo systemctl start mongod
   ```

5. **Create a default admin user (optional)**
   ```bash
   npm run create-admin
   ```

6. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000`

## 📋 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All endpoints except registration and login require authentication via JWT token.

**Header Format:**
```
Authorization: Bearer <your-jwt-token>
```

### Response Format

All responses follow this structure:
```json
{
  "status": "success|error",
  "message": "Description of the result",
  "data": {
    // Response data (only for successful requests)
  }
}
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "middleName": "William", // optional
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "department": "Engineering", // optional
  "role": "user" // optional, defaults to "user"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "firstName": "John",
      "middleName": "William",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "department": "Engineering",
      "role": "user",
      "createdAt": "2021-07-21T10:30:00.000Z",
      "updatedAt": "2021-07-21T10:30:00.000Z",
      "fullName": "John William Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
**POST** `/api/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User Profile
**GET** `/api/auth/profile`

Get the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "department": "Engineering"
    }
  }
}
```

### Refresh Token
**POST** `/api/auth/refresh`

Get a new JWT token.

**Headers:**
```
Authorization: Bearer <current-token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 👥 User Management Endpoints

### Get All Users (Admin Only)
**GET** `/api/users`

Retrieve all users with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of users per page (default: 10)
- `role` (optional): Filter by role ("admin" or "user")

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "user",
        "department": "Engineering",
        "createdAt": "2021-07-21T10:30:00.000Z",
        "updatedAt": "2021-07-21T10:30:00.000Z"
      }
    ],
    "totalPages": 5,
    "currentPage": 1,
    "totalUsers": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get User by ID
**GET** `/api/users/:id`

Get a specific user's profile. Users can only view their own profile; admins can view any profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "department": "Engineering"
    }
  }
}
```

### Create User (Admin Only)
**POST** `/api/users`

Create a new user. Only admins can create users.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "password": "password123",
  "department": "Marketing",
  "role": "user"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "role": "user",
      "department": "Marketing"
    }
  }
}
```

### Update User
**PUT** `/api/users/:id`

Update user information. Users can update their own profile; admins can update any profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "firstName": "Updated Name",
  "department": "New Department",
  "role": "admin"
}
```

**Note:** Regular users cannot change their own role.

**Response (200):**
```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "firstName": "Updated Name",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "department": "New Department",
      "role": "user"
    }
  }
}
```

### Delete User (Admin Only)
**DELETE** `/api/users/:id`

Delete a user. Only admins can delete users, and they cannot delete themselves.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

### Get Users by Role (Admin Only)
**GET** `/api/users/role/:role`

Get users filtered by role with pagination.

**Path Parameters:**
- `role`: "admin" or "user"

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of users per page (default: 10)

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com",
        "role": "admin"
      }
    ],
    "totalPages": 1,
    "currentPage": 1,
    "totalUsers": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

## ⚠️ Error Responses

### Common Error Codes:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid or missing authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Error Response Format:
```json
{
  "status": "error",
  "message": "Description of the error"
}
```

### Examples:

**Validation Error (400):**
```json
{
  "status": "error",
  "message": "First name is required, Email must be a valid email address"
}
```

**Authentication Error (401):**
```json
{
  "status": "error",
  "message": "Invalid token."
}
```

**Authorization Error (403):**
```json
{
  "status": "error",
  "message": "Access denied. Admin privileges required."
}
```

---

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test

# Run tests in watch mode
npm run test:watch
```

### Test Structure

The project includes comprehensive tests for:
- Authentication endpoints
- User management endpoints
- Authorization and access control
- Input validation
- Error handling

---

## 🏗️ Project Structure

```
├── src/
│   ├── app.js                 # Express application setup
│   ├── config/
│   │   └── database.js        # Database connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── userController.js  # User management logic
│   ├── middleware/
│   │   ├── auth.js           # Authentication & authorization
│   │   ├── errorHandler.js   # Global error handling
│   │   └── validation.js     # Request validation
│   ├── models/
│   │   └── User.js           # User data model
│   └── routes/
│       ├── auth.js           # Authentication routes
│       └── users.js          # User management routes
├── tests/
│   ├── auth.test.js          # Authentication tests
│   ├── users.test.js         # User management tests
│   └── setup.js              # Test configuration
├── scripts/
│   └── createAdmin.js        # Admin creation utility
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── jest.config.js            # Jest configuration
├── package.json              # Project dependencies
└── README.md                 # Project documentation
```

---

## 🔒 Security Features

1. **Password Hashing**: Passwords are encrypted using bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Rate Limiting**: Prevents abuse and brute force attacks
4. **Input Validation**: All inputs are validated using Joi schemas
5. **Security Headers**: Helmet.js adds security headers
6. **CORS Protection**: Configurable CORS settings
7. **Role-Based Access**: Granular permissions based on user roles

---

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-very-secure-random-string
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Design Decisions & Assumptions

### Database Design
- **Single Collection**: Both admins and users are stored in the same collection with a `role` field to differentiate them
- **Email Uniqueness**: Email addresses are unique across all users
- **Timestamps**: Automatic `createdAt` and `updatedAt` timestamps

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication using JWT tokens
- **Role-Based Access**: Two roles (admin, user) with different permission levels
- **Token Expiration**: Tokens expire after 7 days by default

### API Design
- **RESTful Conventions**: Follows REST principles for endpoint design
- **Consistent Response Format**: All responses follow the same structure
- **Pagination**: Large datasets are paginated for better performance

### Security Considerations
- **Password Requirements**: Minimum 6 characters (can be customized)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Sanitization**: All inputs are validated and sanitized

---

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` in your `.env` file

2. **JWT Token Errors**
   - Verify the `JWT_SECRET` is set in your environment variables
   - Check if the token format is correct: `Bearer <token>`

3. **Permission Denied Errors**
   - Ensure you're using the correct user role for the endpoint
   - Verify the user exists and the token is valid

4. **Test Failures**
   - Ensure you have a separate test database
   - Check that MongoDB is running for tests

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 About the Developer

Hi! I'm **Dishank Chauhan**, and I built this API as part of a technical assessment. I focused on implementing clean, maintainable code with comprehensive testing and security best practices.

### What I Learned
- Implementing JWT authentication from scratch
- Designing role-based access control systems
- Writing comprehensive test suites with Jest
- Structuring Node.js applications for scalability

### Development Approach
- Started with designing the data model and API endpoints
- Implemented authentication and authorization first
- Added comprehensive input validation and error handling
- Wrote tests throughout the development process
- Focused on security best practices from the beginning

Feel free to explore the code and reach out if you have any questions!

### Connect with Me
- GitHub: [@DishankChauhan](https://github.com/DishankChauhan)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/dishank-chauhan-186853207/)

---

*Built with ❤️ using Node.js, Express, and MongoDB*