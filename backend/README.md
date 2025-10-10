# Tourist Safety Backend API

Backend API for Smart Tourist Safety Monitoring System using Node.js, Express.js, and MongoDB.

## Features

- ✅ User Authentication & Authorization (JWT)
- ✅ User Profile Management
- ✅ Incident Reporting & Management
- ✅ Safety Monitoring & Status
- ✅ Emergency Alert System
- ✅ Location Tracking
- ✅ Emergency Contacts Management
- ✅ Safety Zone Detection
- ✅ Real-time Notifications (WebSocket ready)
- ✅ Blockchain Integration Ready

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Forgot password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/safety-settings` - Update safety settings
- `PUT /api/users/location` - Update current location
- `POST /api/users/emergency-contacts` - Add emergency contact
- `PUT /api/users/emergency-contacts/:id` - Update emergency contact
- `DELETE /api/users/emergency-contacts/:id` - Delete emergency contact
- `GET /api/users/stats` - Get user statistics

### Incidents
- `POST /api/incidents` - Create new incident
- `GET /api/incidents` - Get user's incidents
- `GET /api/incidents/:id` - Get single incident
- `PUT /api/incidents/:id/status` - Update incident status
- `POST /api/incidents/:id/communications` - Add communication log
- `GET /api/incidents/location/:lat/:lng` - Get incidents by location
- `GET /api/incidents/stats` - Get incident statistics

### Safety
- `GET /api/safety/status` - Get safety status
- `PUT /api/safety/status` - Update safety status
- `POST /api/safety/emergency` - Send emergency alert
- `GET /api/safety/nearby` - Get nearby incidents
- `GET /api/safety/zones` - Get safety zones
- `GET /api/safety/zone-check` - Check if in safe zone

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/tourist-safety

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Emergency Services
EMERGENCY_PHONE=+1234567890
EMERGENCY_EMAIL=emergency@touristsafety.com
```

### 3. Database Setup
- **Local MongoDB**: Make sure MongoDB is running locally
- **MongoDB Atlas**: Replace `MONGODB_URI` with your Atlas connection string

### 4. Start Development Server
```bash
npm run dev
```

### 5. Start Production Server
```bash
npm start
```

## Database Models

### User Model
- Personal information (name, email, phone, nationality)
- Authentication data (password, login attempts)
- Safety settings (monitoring preferences)
- Location data (current location, tracking status)
- Emergency contacts
- Blockchain integration (digital ID, government credentials)

### Incident Model
- Incident details (type, severity, status)
- Location information
- AI detection data (confidence, method)
- Evidence and media files
- Response information (responders, communications)
- Resolution details
- Blockchain integration (transaction hash, verification)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Account lockout after failed attempts
- Secure cookie handling

## Error Handling

- Centralized error handling middleware
- Validation error responses
- Database error handling
- JWT error handling
- File upload error handling
- Rate limiting error responses

## Future Enhancements

- [ ] WebSocket integration for real-time updates
- [ ] Email notification system
- [ ] SMS notification system
- [ ] File upload for evidence
- [ ] Blockchain smart contract integration
- [ ] AI service integration
- [ ] Push notification system
- [ ] Admin dashboard APIs
- [ ] Analytics and reporting
- [ ] Multi-language support

## API Testing

Use tools like Postman or Thunder Client to test the API endpoints:

1. **Register a new user**
2. **Login to get JWT token**
3. **Use token in Authorization header: `Bearer <token>`**
4. **Test protected endpoints**

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure proper CORS origins
4. Set up SSL/HTTPS
5. Use MongoDB Atlas or production database
6. Configure proper logging
7. Set up monitoring and alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
