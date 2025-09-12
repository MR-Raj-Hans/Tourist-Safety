const express = require('express');
const geolib = require('geolib');
const verifyToken = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Create geo-fence
router.post('/fence', verifyToken, async (req, res) => {
  try {
    const { name, description, coordinates, fence_type } = req.body;

    if (req.user.userType !== 'police') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only police officers can create geo-fences.' 
      });
    }

    // Validation
    if (!name || !coordinates || !fence_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, coordinates, and fence type are required' 
      });
    }

    // Validate fence type
    const validFenceTypes = ['safe_zone', 'restricted_zone', 'tourist_area'];
    if (!validFenceTypes.includes(fence_type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid fence type' 
      });
    }

    // Validate coordinates format
    let parsedCoordinates;
    try {
      parsedCoordinates = typeof coordinates === 'string' 
        ? JSON.parse(coordinates) 
        : coordinates;
      
      if (!Array.isArray(parsedCoordinates) || parsedCoordinates.length < 3) {
        throw new Error('Coordinates must be an array of at least 3 points');
      }

      // Validate each coordinate point
      parsedCoordinates.forEach((point, index) => {
        if (!point.latitude || !point.longitude) {
          throw new Error(`Invalid coordinate at index ${index}`);
        }
      });
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid coordinates format: ' + error.message 
      });
    }

    // Insert geo-fence into database
    const result = await db.executeQuery(
      `INSERT INTO geo_fences (name, description, coordinates, fence_type) 
       VALUES (?, ?, ?, ?)`,
      [name, description, JSON.stringify(parsedCoordinates), fence_type]
    );

    res.status(201).json({
      success: true,
      message: 'Geo-fence created successfully',
      data: {
        id: result.id,
        name,
        description,
        coordinates: parsedCoordinates,
        fence_type,
        is_active: true,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Geo-fence creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating geo-fence' 
    });
  }
});

// Get all geo-fences
router.get('/fences', verifyToken, async (req, res) => {
  try {
    const { fence_type, is_active } = req.query;

    let query = 'SELECT * FROM geo_fences WHERE 1=1';
    const params = [];

    if (fence_type) {
      query += ' AND fence_type = ?';
      params.push(fence_type);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true');
    }

    query += ' ORDER BY created_at DESC';

    const fences = await db.getAllQuery(query, params);

    // Parse coordinates for each fence
    const processedFences = fences.map(fence => ({
      ...fence,
      coordinates: JSON.parse(fence.coordinates)
    }));

    res.json({
      success: true,
      data: processedFences
    });

  } catch (error) {
    console.error('Fetch geo-fences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching geo-fences' 
    });
  }
});

// Check if location is within geo-fences
router.post('/check', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }

    const userLocation = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };

    // Get all active geo-fences
    const activeFences = await db.getAllQuery(
      'SELECT * FROM geo_fences WHERE is_active = true'
    );

    const results = [];

    for (const fence of activeFences) {
      try {
        const coordinates = JSON.parse(fence.coordinates);
        
        // Check if point is inside polygon using geolib
        const isInside = geolib.isPointInPolygon(userLocation, coordinates);
        
        if (isInside) {
          results.push({
            fence_id: fence.id,
            fence_name: fence.name,
            fence_type: fence.fence_type,
            description: fence.description,
            is_inside: true
          });
        }
      } catch (error) {
        console.error(`Error checking fence ${fence.id}:`, error);
      }
    }

    // If tourist is in a restricted zone, create an alert
    if (req.user.userType === 'tourist') {
      const restrictedZones = results.filter(r => r.fence_type === 'restricted_zone');
      
      if (restrictedZones.length > 0) {
        // Create automatic alert for entering restricted zone
        try {
          await db.executeQuery(
            `INSERT INTO alerts (tourist_id, alert_type, location, latitude, longitude, description, priority) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              req.user.id,
              'crime',
              `Restricted zone: ${restrictedZones[0].fence_name}`,
              latitude,
              longitude,
              `Tourist entered restricted zone: ${restrictedZones[0].fence_name}`,
              'high'
            ]
          );
        } catch (alertError) {
          console.error('Error creating restricted zone alert:', alertError);
        }
      }

      // Save location to history
      try {
        await db.executeQuery(
          `INSERT INTO location_history (tourist_id, latitude, longitude) 
           VALUES (?, ?, ?)`,
          [req.user.id, latitude, longitude]
        );

        // Update current location in tourists table
        await db.executeQuery(
          `UPDATE tourists SET current_location = ? WHERE id = ?`,
          [JSON.stringify({ latitude, longitude, timestamp: new Date().toISOString() }), req.user.id]
        );
      } catch (locationError) {
        console.error('Error saving location:', locationError);
      }
    }

    res.json({
      success: true,
      data: {
        location: userLocation,
        fence_matches: results,
        total_matches: results.length,
        in_safe_zone: results.some(r => r.fence_type === 'safe_zone'),
        in_restricted_zone: results.some(r => r.fence_type === 'restricted_zone'),
        in_tourist_area: results.some(r => r.fence_type === 'tourist_area')
      }
    });

  } catch (error) {
    console.error('Geo-fence check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while checking geo-fences' 
    });
  }
});

// Update geo-fence
router.put('/fence/:fenceId', verifyToken, async (req, res) => {
  try {
    const { fenceId } = req.params;
    const { name, description, coordinates, fence_type, is_active } = req.body;

    if (req.user.userType !== 'police') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only police officers can update geo-fences.' 
      });
    }

    // Check if fence exists
    const existingFence = await db.getQuery(
      'SELECT * FROM geo_fences WHERE id = ?',
      [fenceId]
    );

    if (!existingFence) {
      return res.status(404).json({ 
        success: false, 
        message: 'Geo-fence not found' 
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (coordinates !== undefined) {
      let parsedCoordinates;
      try {
        parsedCoordinates = typeof coordinates === 'string' 
          ? JSON.parse(coordinates) 
          : coordinates;
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid coordinates format' 
        });
      }
      updates.push('coordinates = ?');
      params.push(JSON.stringify(parsedCoordinates));
    }

    if (fence_type !== undefined) {
      const validFenceTypes = ['safe_zone', 'restricted_zone', 'tourist_area'];
      if (!validFenceTypes.includes(fence_type)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid fence type' 
        });
      }
      updates.push('fence_type = ?');
      params.push(fence_type);
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update' 
      });
    }

    params.push(fenceId);

    await db.executeQuery(
      `UPDATE geo_fences SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated fence
    const updatedFence = await db.getQuery(
      'SELECT * FROM geo_fences WHERE id = ?',
      [fenceId]
    );

    res.json({
      success: true,
      message: 'Geo-fence updated successfully',
      data: {
        ...updatedFence,
        coordinates: JSON.parse(updatedFence.coordinates)
      }
    });

  } catch (error) {
    console.error('Geo-fence update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating geo-fence' 
    });
  }
});

// Delete geo-fence
router.delete('/fence/:fenceId', verifyToken, async (req, res) => {
  try {
    const { fenceId } = req.params;

    if (req.user.userType !== 'police') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only police officers can delete geo-fences.' 
      });
    }

    // Check if fence exists
    const existingFence = await db.getQuery(
      'SELECT * FROM geo_fences WHERE id = ?',
      [fenceId]
    );

    if (!existingFence) {
      return res.status(404).json({ 
        success: false, 
        message: 'Geo-fence not found' 
      });
    }

    await db.executeQuery(
      'DELETE FROM geo_fences WHERE id = ?',
      [fenceId]
    );

    res.json({
      success: true,
      message: 'Geo-fence deleted successfully'
    });

  } catch (error) {
    console.error('Geo-fence deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting geo-fence' 
    });
  }
});

// Get tourist location history (for police)
router.get('/tourist/:touristId/history', verifyToken, async (req, res) => {
  try {
    const { touristId } = req.params;
    const { limit = 50, hours = 24 } = req.query;

    if (req.user.userType !== 'police') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only police officers can view location history.' 
      });
    }

    // Get location history
    const locationHistory = await db.getAllQuery(
      `SELECT * FROM location_history 
       WHERE tourist_id = ? AND timestamp >= datetime('now', '-${hours} hours')
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [touristId, parseInt(limit)]
    );

    // Get tourist info
    const tourist = await db.getQuery(
      'SELECT name, email, phone FROM tourists WHERE id = ?',
      [touristId]
    );

    if (!tourist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tourist not found' 
      });
    }

    res.json({
      success: true,
      data: {
        tourist: tourist,
        location_history: locationHistory,
        total_points: locationHistory.length,
        time_range_hours: hours
      }
    });

  } catch (error) {
    console.error('Location history fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching location history' 
    });
  }
});

module.exports = router;