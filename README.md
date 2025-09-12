# SafeTravel - Tourist Safety Monitoring System

A comprehensive tourist safety monitoring system built with modern web technologies, featuring real-time location tracking, emergency alerts, QR code identification, and AI-powered risk assessment.

## 🌟 Features

### For Tourists
- **Real-time Location Tracking**: GPS-based location monitoring with geo-fence alerts
- **Emergency Panic Button**: 3-second hold emergency alert system
- **QR Code Generation**: Dynamic QR codes with tourist information for authorities
- **Multi-language Support**: English and Spanish interface
- **Risk Assessment**: AI-powered safety risk evaluation
- **Interactive Maps**: Real-time location visualization with safety zones

### For Police/Authorities
- **Real-time Dashboard**: Monitor all active tourists and alerts
- **Emergency Response**: Instant notifications and response management
- **QR Code Scanner**: Quick tourist identification and information access
- **Geo-fence Management**: Create and manage safe/restricted zones
- **Analytics**: Response time tracking and safety statistics
- **Live Communication**: Real-time updates via WebSocket

### Technical Features
- **Real-time Communication**: Socket.io for live updates
- **Machine Learning**: Risk prediction and pattern analysis
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Authentication**: JWT-based secure authentication
- **Database**: SQLite with comprehensive schema
- **API Documentation**: RESTful API design

## 🏗️ Project Structure

```
tourist-safety-system/
├── backend/                    # Node.js + Express API Server
│   ├── routes/                # API route handlers
│   │   ├── auth.js           # Authentication routes
│   │   ├── panic.js          # Emergency alert routes
│   │   ├── qr.js             # QR code generation routes
│   │   └── geo.js            # Geo-fence management routes
│   ├── models/               # Database models
│   │   ├── Tourist.js        # Tourist data model
│   │   ├── Alert.js          # Emergency alert model
│   │   ├── QRCode.js         # QR code model
│   │   └── GeoFence.js       # Geo-fence model
│   ├── middleware/           # Express middleware
│   ├── config/              # Configuration files
│   ├── server.js            # Main server file
│   ├── database.js          # Database initialization
│   └── package.json         # Dependencies and scripts
│
├── ml-service/                # Python FastAPI ML Service
│   ├── app.py               # Main FastAPI application
│   ├── models/              # Machine learning models
│   ├── requirements.txt     # Python dependencies
│   └── config.py            # ML service configuration
│
└── frontend/                  # React.js User Interface
    ├── src/
    │   ├── components/       # Reusable React components
    │   │   ├── Navbar.jsx   # Navigation component
    │   │   ├── PanicButton.jsx # Emergency button component
    │   │   ├── QRGenerator.jsx # QR code generation
    │   │   ├── MapView.jsx   # Interactive map component
    │   │   └── LanguageSwitcher.jsx # Language selection
    │   ├── pages/           # Main application pages
    │   │   ├── Login.jsx    # Authentication page
    │   │   ├── Register.jsx # User registration
    │   │   ├── TouristDashboard.jsx # Tourist interface
    │   │   └── PoliceDashboard.jsx  # Police interface
    │   ├── services/        # API and socket services
    │   │   ├── api.js       # HTTP API client
    │   │   └── socket.js    # WebSocket client
    │   ├── i18n/           # Internationalization
    │   │   └── config.js   # Language configurations
    │   ├── App.js          # Main React application
    │   └── index.js        # Application entry point
    ├── public/             # Static assets
    ├── tailwind.config.js  # TailwindCSS configuration
    ├── postcss.config.js   # PostCSS configuration
    └── package.json        # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd tourist-safety-system
```

### 2. Backend Setup (Node.js + Express)
```bash
cd backend
npm install
npm start
```

The backend server will start on `http://localhost:3001`

### 3. ML Service Setup (Python + FastAPI)
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The ML service will start on `http://localhost:8000`

### 4. Frontend Setup (React.js)
```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

## 📱 Usage Guide

### For Tourists

1. **Registration/Login**
   - Create an account with personal and passport information
   - Login to access the tourist dashboard

2. **Dashboard Features**
   - Enable location tracking for safety monitoring
   - View current risk level and safety recommendations
   - Generate QR codes for identification
   - Access emergency panic button

3. **Emergency Situations**
   - Hold the panic button for 3 seconds to send an emergency alert
   - Your location and information will be sent to authorities
   - Emergency contacts will be notified

4. **QR Code Usage**
   - Generate QR codes containing your information
   - Show to police when requested
   - Codes expire automatically for security

### For Police/Authorities

1. **Dashboard Overview**
   - Monitor all active tourists in real-time
   - View statistics and response metrics
   - Receive instant emergency notifications

2. **Emergency Response**
   - Respond to active alerts
   - Update alert status (investigating/resolved)
   - View tourist location and contact information

3. **QR Code Scanning**
   - Scan tourist QR codes for instant information access
   - View tourist details, emergency contacts, and passport info

4. **Geo-fence Management**
   - Create safe zones, restricted areas, and warning zones
   - Set radius and descriptions for each zone
   - Monitor when tourists enter/exit zones

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Tourist Endpoints
- `GET /api/tourists` - Get all tourists (police only)
- `PUT /api/tourists/location` - Update tourist location
- `GET /api/tourists/me` - Get current tourist info

### Emergency Alert Endpoints
- `POST /api/panic/alert` - Create emergency alert
- `GET /api/panic/alerts` - Get all alerts (police only)
- `PUT /api/panic/alerts/:id` - Update alert status (police only)

### QR Code Endpoints
- `POST /api/qr/generate` - Generate new QR code
- `GET /api/qr/scan/:code` - Scan QR code
- `GET /api/qr/history` - Get QR code history

### Geo-fence Endpoints
- `GET /api/geo/fences` - Get all geo-fences
- `POST /api/geo/fences` - Create geo-fence (police only)
- `DELETE /api/geo/fences/:id` - Delete geo-fence (police only)
- `POST /api/geo/check` - Check location against geo-fences

### ML Service Endpoints
- `POST /ml/risk-assessment` - Get risk assessment for location
- `POST /ml/predict-hotspots` - Predict safety hotspots
- `POST /ml/analyze-patterns` - Analyze tourist movement patterns

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Rate Limiting**: API request rate limiting
- **CORS Protection**: Cross-origin resource sharing configuration
- **QR Code Expiry**: Automatic QR code expiration for security
- **Input Validation**: Comprehensive input validation and sanitization

## 🌐 Real-time Features

- **WebSocket Communication**: Real-time alerts and updates
- **Live Location Tracking**: Continuous GPS monitoring
- **Instant Notifications**: Emergency alert broadcasting
- **Live Dashboard Updates**: Real-time police dashboard updates

## 🗄️ Database Schema

### Users Table
- id, email, password, name, phone, passport, nationality, emergency_contact, user_type, created_at

### Alerts Table
- id, tourist_id, message, latitude, longitude, status, severity, created_at, resolved_at

### QR Codes Table
- id, tourist_id, code, location_name, expires_at, created_at

### Geo-fences Table
- id, name, latitude, longitude, radius, type, description, created_by, created_at

### Location History Table
- id, tourist_id, latitude, longitude, accuracy, timestamp

## 🛠️ Development

### Environment Variables
Create `.env` files in each service directory:

**Backend (.env)**
```
JWT_SECRET=your-secret-key
DATABASE_URL=./database.sqlite
ML_SERVICE_URL=http://localhost:8000
PORT=3001
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ML_API_URL=http://localhost:8000
```

### Development Commands

**Backend**
```bash
npm run dev        # Start with nodemon
npm test          # Run tests
npm run lint      # ESLint checking
```

**Frontend**
```bash
npm start         # Development server
npm run build     # Production build
npm test          # Run tests
npm run lint      # ESLint checking
```

**ML Service**
```bash
uvicorn app:app --reload  # Development server
python -m pytest         # Run tests
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm install --production

# ML Service
cd ml-service
pip install -r requirements.txt
```

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - Tourist registration and login
  - Emergency alert system
  - QR code generation
  - Police dashboard
  - Real-time location tracking
  - Multi-language support

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Socket.io for real-time communication
- TailwindCSS for UI styling
- React Leaflet for map integration
- FastAPI for ML service framework

---

Built with ❤️ for tourist safety and security.