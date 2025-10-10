# SafeTrail - Comprehensive Travel Safety Platform

![SafeTrail Logo](https://img.shields.io/badge/SafeTrail-Travel%20Safety-blue?style=for-the-badge&logo=shield-check)

A comprehensive travel safety platform that combines web applications, mobile apps, and machine learning to provide real-time threat detection and emergency response for travellers. SafeTrail integrates blockchain-based digital identity verification, location tracking, and AI-powered risk assessment to ensure traveler safety.

## 🌟 Features

- **Secure Authentication & Identity** – JWT authentication, bcrypt hashing, blockchain-based digital ID verification, and government credential integration with multi-factor security.  
- **Location Intelligence** – Real-time GPS tracking, customizable geofencing, offline location support, and strong privacy controls.  
- **AI-Powered Risk Analysis** – Machine learning–based threat detection, district-level safety profiling, predictive alerts, and confidence-based risk scoring.  
- **Emergency Response System** – One-tap SOS alerts, multi-contact support, automated SMS notifications, and integration with local emergency responders.  
- **Cross-Platform Support** – Web app (React + Tailwind), mobile app (React Native for Android/iOS), backend API (Node.js + Express + MongoDB), and Python-based ML microservice.  


## 📽️ Demo Preview

Watch the full video demonstration

[![Watch the video](https://img.youtube.com/vi/jbg5iuaavkU/0.jpg)](https://youtu.be/jbg5iuaavkU)

---
## 🏗️ Architecture

```
SafeTrail/
├── backend/        # Node.js + Express server
│   ├── models/     # MongoDB schemas
│   ├── routes/     # API routes (auth, incidents, etc.)
│   ├── middleware/ # Auth, error handling
│   ├── services/   # External API integrations
│   └── ml_model/   # Python ML model
|       ├── predict.py # Main ML prediction script 
|       ├── district_threat_profiles.csv # Threat database 
|       ├── requirements.txt # Python dependencies 
|       └── README.md # ML setup instructions
│
├── frontend/       # React + TypeScript web app
│   ├── components/ # Reusable UI components
│   ├── pages/      # Route-based components
│   └── services/   # API layer
│
└── mobile/         # React Native app
    ├── screens/    # App screens
    ├── navigation/ # Navigation setup
    └── services/   # Location & API logic
```
## ⚙️ Setup & Deployment

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (Atlas recommended for production)
- **Android Studio** (for mobile development)

### 🔧 Environment Variables
Create .env in the backend directory:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safetrail
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
PORT=5000
FRONTEND_URL=http://localhost:3000
PYTHON_ML_URL=http://localhost:8000
PYTHON_SCRIPT_PATH=./ml_model/predict.py
CSV_DATA_PATH=./ml_model/district_threat_profiles.csv
```
### 🚀 Installation Steps

#### 1️⃣ Backend
```
cd backend
npm install
npm run dev   # start in development mode
```

#### 2️⃣ ML Model
```
cd backend/ml_model
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python predict.py 23.0225 72.5714 10.0 user123  # test model
```
#### 3️⃣ Frontend
```
cd frontend
npm install
npm start
```

#### 4️⃣ Mobile App
```
cd mobile
npm install
npx react-native run-android  # or run-ios
```
## 🔒 Security & Privacy

- Password hashing (bcrypt)
- JWT-based authentication
- Rate limiting & request validation
- CORS & data encryption
- Configurable location privacy
## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Location Services
- `PUT /api/users/location` - Update user location
- `GET /api/users/location` - Get user location
- `POST /api/safety/geofence` - Create safety zone

### Emergency Services
- `POST /api/emergency/alert` - Send emergency alert
- `GET /api/emergency/contacts` - Get emergency contacts
- `POST /api/emergency/contacts` - Add emergency contact

### ML Integration
- `POST /api/ml/analyze` - Analyze location for threats
- `GET /api/ml/status` - Get ML model status
- `GET /api/ml/metrics` - Get model performance metrics

### Incident Management
- `GET /api/incidents` - Get incident reports
- `POST /api/incidents` - Create incident report
- `PUT /api/incidents/:id` - Update incident

## 🤖 Machine Learning Model

### Threat Detection Algorithm
The ML model analyzes multiple data sources to assess location-based risks:

1. **Geographic Analysis**: District identification and threat profiling
2. **News Monitoring**: Real-time threat detection from news sources
3. **Historical Data**: Past incident analysis and pattern recognition
4. **Risk Scoring**: Multi-factor risk assessment with confidence levels


### Model Outputs
```json
{
  "risk_level": "low|medium|high",
  "confidence": 0.85,
  "prediction": "Detailed risk assessment",
  "insights": ["Insight 1", "Insight 2"],
  "recommendations": ["Safety recommendation 1", "Safety recommendation 2"],
  "safety_alert": {
    "type": "alert_type",
    "severity": "low|medium|high",
    "message": "Alert message"
  },
  "model_version": "1.0",
  "processing_time": 0.5
}
```

### Supported Districts
- **680+ Indian Districts**: Comprehensive threat datab
- **Geocoding Integration**: Automatic district identification



## 🤝 Contributions

- [Kushagra Gupta](https://github.com/kushagragupta04)
- [Ashish Kumar Nanda](https://github.com/ashishnanda19)
- [Rashi Gupta](https://github.com/Rashi228)
- [Ridhi Pahuja](https://github.com/ridz3)
