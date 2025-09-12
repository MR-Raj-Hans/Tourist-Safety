const express = require('express');
const QRCode = require('qrcode');
const verifyToken = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Generate QR code for tourist
router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { location_name, expires_in_hours = 24 } = req.body;
    const tourist_id = req.user.id;

    if (req.user.userType !== 'tourist') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only tourists can generate QR codes.' 
      });
    }

    // Get tourist information
    const tourist = await db.getQuery(
      'SELECT * FROM tourists WHERE id = ?',
      [tourist_id]
    );

    if (!tourist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tourist not found' 
      });
    }

    // Create QR data object
    const qrData = {
      tourist_id: tourist_id,
      name: tourist.name,
      email: tourist.email,
      phone: tourist.phone,
      nationality: tourist.nationality,
      passport_number: tourist.passport_number,
      emergency_contact: tourist.emergency_contact,
      location_name: location_name || 'Current Location',
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString()
    };

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000);

    // Save QR code to database
    const result = await db.executeQuery(
      `INSERT INTO qr_codes (tourist_id, qr_data, location_name, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [tourist_id, JSON.stringify(qrData), location_name, expiresAt.toISOString()]
    );

    // Update tourist's current QR code
    await db.executeQuery(
      'UPDATE tourists SET qr_code = ? WHERE id = ?',
      [qrCodeDataURL, tourist_id]
    );

    res.json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qr_code_id: result.id,
        qr_code: qrCodeDataURL,
        qr_data: qrData,
        location_name: location_name || 'Current Location',
        expires_at: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while generating QR code' 
    });
  }
});

// Verify/Scan QR code (for police or authorities)
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { qr_data } = req.body;

    if (!qr_data) {
      return res.status(400).json({ 
        success: false, 
        message: 'QR data is required' 
      });
    }

    let parsedQRData;
    try {
      parsedQRData = JSON.parse(qr_data);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid QR code format' 
      });
    }

    // Check if QR code has expired
    const expiresAt = new Date(parsedQRData.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'QR code has expired' 
      });
    }

    // Get current tourist information from database
    const tourist = await db.getQuery(
      'SELECT * FROM tourists WHERE id = ?',
      [parsedQRData.tourist_id]
    );

    if (!tourist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tourist not found' 
      });
    }

    // Update scan count in QR codes table
    await db.executeQuery(
      'UPDATE qr_codes SET scan_count = scan_count + 1 WHERE tourist_id = ? AND qr_data = ?',
      [parsedQRData.tourist_id, qr_data]
    );

    // Get recent alerts for this tourist
    const recentAlerts = await db.getAllQuery(
      `SELECT * FROM alerts WHERE tourist_id = ? AND status = 'active' 
       ORDER BY created_at DESC LIMIT 5`,
      [parsedQRData.tourist_id]
    );

    // Get location history
    const locationHistory = await db.getAllQuery(
      `SELECT * FROM location_history WHERE tourist_id = ? 
       ORDER BY timestamp DESC LIMIT 10`,
      [parsedQRData.tourist_id]
    );

    // Remove sensitive information if the requester is not police
    let responseData = {
      tourist_id: tourist.id,
      name: tourist.name,
      nationality: tourist.nationality,
      status: tourist.status,
      qr_location: parsedQRData.location_name,
      generated_at: parsedQRData.generated_at,
      scan_timestamp: new Date().toISOString(),
      is_valid: true,
      recent_alerts_count: recentAlerts.length
    };

    // If the requester is police, include more detailed information
    if (req.user.userType === 'police') {
      responseData = {
        ...responseData,
        email: tourist.email,
        phone: tourist.phone,
        passport_number: tourist.passport_number,
        emergency_contact: tourist.emergency_contact,
        current_location: tourist.current_location,
        recent_alerts: recentAlerts,
        location_history: locationHistory
      };
    }

    res.json({
      success: true,
      message: 'QR code verified successfully',
      data: responseData
    });

  } catch (error) {
    console.error('QR code verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while verifying QR code' 
    });
  }
});

// Get QR code history for tourist
router.get('/history', verifyToken, async (req, res) => {
  try {
    const tourist_id = req.user.id;

    if (req.user.userType !== 'tourist') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only tourists can view their QR history.' 
      });
    }

    const qrHistory = await db.getAllQuery(
      `SELECT id, location_name, scan_count, is_active, expires_at, created_at 
       FROM qr_codes WHERE tourist_id = ? ORDER BY created_at DESC`,
      [tourist_id]
    );

    res.json({
      success: true,
      data: qrHistory
    });

  } catch (error) {
    console.error('QR history fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching QR history' 
    });
  }
});

// Get current active QR code
router.get('/current', verifyToken, async (req, res) => {
  try {
    const tourist_id = req.user.id;

    if (req.user.userType !== 'tourist') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only tourists can view their current QR code.' 
      });
    }

    // Get the most recent active QR code
    const currentQR = await db.getQuery(
      `SELECT * FROM qr_codes 
       WHERE tourist_id = ? AND is_active = true AND expires_at > datetime('now') 
       ORDER BY created_at DESC LIMIT 1`,
      [tourist_id]
    );

    if (!currentQR) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active QR code found. Please generate a new one.' 
      });
    }

    // Get tourist's current QR code image from tourists table
    const tourist = await db.getQuery(
      'SELECT qr_code FROM tourists WHERE id = ?',
      [tourist_id]
    );

    res.json({
      success: true,
      data: {
        qr_code_id: currentQR.id,
        qr_code: tourist.qr_code,
        location_name: currentQR.location_name,
        scan_count: currentQR.scan_count,
        expires_at: currentQR.expires_at,
        created_at: currentQR.created_at
      }
    });

  } catch (error) {
    console.error('Current QR fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching current QR code' 
    });
  }
});

// Deactivate QR code
router.put('/:qrId/deactivate', verifyToken, async (req, res) => {
  try {
    const { qrId } = req.params;
    const tourist_id = req.user.id;

    if (req.user.userType !== 'tourist') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only tourists can deactivate their QR codes.' 
      });
    }

    // Check if QR code exists and belongs to the tourist
    const qrCode = await db.getQuery(
      'SELECT * FROM qr_codes WHERE id = ? AND tourist_id = ?',
      [qrId, tourist_id]
    );

    if (!qrCode) {
      return res.status(404).json({ 
        success: false, 
        message: 'QR code not found or you do not have permission to deactivate it' 
      });
    }

    // Deactivate QR code
    await db.executeQuery(
      'UPDATE qr_codes SET is_active = false WHERE id = ?',
      [qrId]
    );

    res.json({
      success: true,
      message: 'QR code deactivated successfully'
    });

  } catch (error) {
    console.error('QR deactivation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deactivating QR code' 
    });
  }
});

module.exports = router;