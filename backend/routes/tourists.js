const express = require('express');
const verifyToken = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Get all tourists (for police dashboard)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Only allow police to access this endpoint
    if (req.user.userType !== 'police') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Police authorization required.'
      });
    }

    const tourists = await db.getAllQuery(`
      SELECT 
        id, name, email, phone, nationality, passport_number,
        emergency_contact, status, created_at
      FROM tourists
      ORDER BY created_at DESC
    `);

    // Get latest location for each tourist
    const touristsWithLocation = await Promise.all(
      tourists.map(async (tourist) => {
        const latestLocation = await db.getQuery(`
          SELECT latitude, longitude, accuracy, timestamp
          FROM location_history
          WHERE tourist_id = ?
          ORDER BY timestamp DESC
          LIMIT 1
        `, [tourist.id]);

        return {
          ...tourist,
          last_location: latestLocation
        };
      })
    );

    res.json({
      success: true,
      data: touristsWithLocation
    });
  } catch (error) {
    console.error('Get tourists error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get tourist profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (req.user.userType !== 'tourist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Tourist authorization required.'
      });
    }

    const tourist = await db.getQuery(`
      SELECT 
        id, name, email, phone, nationality, passport_number,
        emergency_contact, status, created_at
      FROM tourists
      WHERE id = ?
    `, [req.user.userId]);

    if (!tourist) {
      return res.status(404).json({
        success: false,
        message: 'Tourist not found'
      });
    }

    res.json({
      success: true,
      data: tourist
    });
  } catch (error) {
    console.error('Get tourist profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update tourist location
router.put('/location', verifyToken, async (req, res) => {
  try {
    if (req.user.userType !== 'tourist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Tourist authorization required.'
      });
    }

    const { latitude, longitude, accuracy } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Insert location into history
    await db.executeQuery(`
      INSERT INTO location_history (tourist_id, latitude, longitude, accuracy)
      VALUES (?, ?, ?, ?)
    `, [req.user.userId, latitude, longitude, accuracy || null]);

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;