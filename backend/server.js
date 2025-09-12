const express = require('express');
const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const panicRoutes = require('./routes/panic');
const qrRoutes = require('./routes/qr');
const geoRoutes = require('./routes/geo');
const touristRoutes = require('./routes/tourists');
const devRoutes = require('./routes/dev');

// Import database connection
const db = require('./db');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
// app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join room based on user type (tourist/police)
  socket.on('join', (userData) => {
    socket.join(userData.userType);
    console.log(`User ${socket.id} joined ${userData.userType} room`);
  });

  // Handle panic alerts
  socket.on('panic_alert', (alertData) => {
    // Broadcast to police room
    socket.to('police').emit('new_panic_alert', alertData);
    console.log('Panic alert broadcasted to police');
  });

  // Handle location updates
  socket.on('location_update', (locationData) => {
    socket.to('police').emit('tourist_location_update', locationData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/panic', panicRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/tourists', touristRoutes);

// Mount development-only routes only when explicitly enabled in development
// To enable: set NODE_ENV=development and ENABLE_DEV_ROUTES=true
if ((process.env.NODE_ENV || 'development') === 'development' && process.env.ENABLE_DEV_ROUTES === 'true') {
  app.use('/api/dev', devRoutes);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Tourist Safety API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
db.initialize()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

module.exports = { app, server, io };