# TravelSafety App Setup Instructions

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ../backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Configure MongoDB Atlas:**
   - Copy `env-template.txt` to `.env`
   - Update the `.env` file with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tourist-safety?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

4. **MongoDB Atlas Setup:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster (if you don't have one)
   - Get your connection string
   - Make sure your IP address is whitelisted
   - Create a database user with read/write permissions

5. Start the backend server:
   ```bash
   npm start
   ```

6. **Verify Connection:**
   - Check console for "✅ Connected to MongoDB" message
   - Visit `http://localhost:5000/health` to test the API

## React Native App Setup

1. Make sure you're in the TravelSafety directory:
   ```bash
   cd TravelSafety
   ```

2. For Android development, make sure you have:
   - Android Studio installed
   - Android SDK configured
   - An Android emulator running OR a physical device connected

3. Start the Metro bundler:
   ```bash
   npx react-native start
   ```

4. In a new terminal, run the app on Android:
   ```bash
   npx react-native run-android
   ```

## Important Notes

### For Physical Device Testing:
1. Make sure your phone and computer are on the same WiFi network
2. Find your computer's IP address:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
3. Update the API_BASE_URL in `src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';
   ```

### For Emulator Testing:
- The current configuration uses `10.0.2.2:5000` which works with Android emulator
- Make sure your backend server is running on port 5000

## Features Implemented

✅ **Login System**
- Email/password authentication
- MongoDB database integration
- JWT token management
- Automatic token storage and retrieval

✅ **Location Services**
- Location permission requests
- Real-time location tracking
- Location updates to database
- Background location monitoring

✅ **Dashboard**
- User profile display
- Current location display
- Quick action buttons
- Emergency alert functionality
- Logout functionality

✅ **Registration**
- Complete user registration form
- Form validation
- Database integration

## App Flow

1. **Login Screen**: Users enter email/password
2. **Authentication**: Credentials checked against MongoDB database
3. **Location Permission**: App requests location access after successful login
4. **Dashboard**: Shows user info, location, and safety features
5. **Location Tracking**: Continuously updates user location in database

## Database Schema

The app uses the existing User model with:
- Personal information (name, email, phone, nationality)
- Authentication (password, login attempts, account lock)
- Location tracking (current location, last updated)
- Safety settings (location tracking, emergency alerts)
- Emergency contacts
- Digital ID and blockchain integration

## Next Steps

The app is now ready for testing! You can:
1. Register a new account
2. Login with existing credentials
3. Test location permissions
4. View the dashboard with real-time location updates

Make sure both the backend server and MongoDB are running before testing the app.
