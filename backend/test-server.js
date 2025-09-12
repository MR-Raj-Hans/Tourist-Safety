const express = require('express');
const cors = require('cors');

console.log('Starting server setup...');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

console.log('Basic middleware set up...');

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

console.log('Test route added...');

// Import and test routes one by one
try {
  console.log('Importing auth routes...');
  const authRoutes = require('./routes/auth');
  console.log('Auth routes imported, type:', typeof authRoutes);
  app.use('/api/auth', authRoutes);
  console.log('Auth routes mounted...');
} catch (error) {
  console.error('Error with auth routes:', error.message);
}

try {
  console.log('Importing panic routes...');
  const panicRoutes = require('./routes/panic');
  console.log('Panic routes imported, type:', typeof panicRoutes);
  app.use('/api/panic', panicRoutes);
  console.log('Panic routes mounted...');
} catch (error) {
  console.error('Error with panic routes:', error.message);
}

try {
  console.log('Importing qr routes...');
  const qrRoutes = require('./routes/qr');
  console.log('QR routes imported, type:', typeof qrRoutes);
  app.use('/api/qr', qrRoutes);
  console.log('QR routes mounted...');
} catch (error) {
  console.error('Error with qr routes:', error.message);
}

try {
  console.log('Importing geo routes...');
  const geoRoutes = require('./routes/geo');
  console.log('Geo routes imported, type:', typeof geoRoutes);
  app.use('/api/geo', geoRoutes);
  console.log('Geo routes mounted...');
} catch (error) {
  console.error('Error with geo routes:', error.message);
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});