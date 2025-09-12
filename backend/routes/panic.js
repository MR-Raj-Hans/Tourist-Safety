const express = require('express');
const verifyToken = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Create panic alert
router.post('/alert', verifyToken, async (req, res) => {
  try {
    const { alert_type, location, latitude, longitude, description } = req.body;
    const tourist_id = req.user.id;

    // Validation
    if (!alert_type || !location || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Alert type, location, latitude, and longitude are required' 
      });
    }

    // Validate alert type
    const validAlertTypes = ['panic', 'medical', 'crime', 'lost'];
    if (!validAlertTypes.includes(alert_type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid alert type' 
      });
    }

    // Determine priority based on alert type
    let priority = 'medium';
    if (alert_type === 'panic' || alert_type === 'medical') {
      priority = 'critical';
    } else if (alert_type === 'crime') {
      priority = 'high';
    }

    // Insert alert into database
    const result = await db.executeQuery(
      `INSERT INTO alerts (tourist_id, alert_type, location, latitude, longitude, description, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tourist_id, alert_type, location, latitude, longitude, description, priority]
    );

    // Get tourist information for the alert
    const tourist = await db.getQuery(
      'SELECT name, email, phone, nationality FROM tourists WHERE id = ?',
      [tourist_id]
    );

    const alertData = {
      id: result.id,
      tourist_id,
      tourist_name: tourist.name,
      tourist_phone: tourist.phone,
      tourist_nationality: tourist.nationality,
      alert_type,
      location,
      latitude,
      longitude,
      description,
      priority,
      status: 'active',
      created_at: new Date().toISOString()
    };

    // Emit real-time alert to police (assuming io is accessible)
    if (req.app.get('io')) {
      req.app.get('io').to('police').emit('new_panic_alert', alertData);
    }

    res.status(201).json({
      success: true,
      message: 'Panic alert created successfully',
      data: alertData
    });

  } catch (error) {
    console.error('Panic alert creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating panic alert' 
    });
  }
});

// Get all alerts for a tourist
router.get('/my-alerts', verifyToken, async (req, res) => {
  try {
    const tourist_id = req.user.id;

    if (req.user.userType !== 'tourist') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only tourists can view their alerts.' 
      });
    }

    const alerts = await db.getAllQuery(
      `SELECT * FROM alerts WHERE tourist_id = ? ORDER BY created_at DESC`,
      [tourist_id]
    );

    res.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Fetch alerts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching alerts' 
    });
  }
});

// Get all active alerts (for police)
router.get('/active', verifyToken, async (req, res) => {
  try {
    if (req.user.userType !== 'police') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only police officers can view all alerts.' 
      });
    }

    const alerts = await db.getAllQuery(`
      SELECT a.*, t.name as tourist_name, t.phone as tourist_phone, 
             t.nationality as tourist_nationality, t.emergency_contact
      FROM alerts a
      JOIN tourists t ON a.tourist_id = t.id
      WHERE a.status = 'active'
      ORDER BY a.priority DESC, a.created_at DESC
    `);

    res.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Fetch active alerts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching active alerts' 
    });
  }
});

// Update alert status (for police)
router.put('/:alertId/status', verifyToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status } = req.body;
    const police_id = req.user.id;

    if (req.user.userType !== 'police') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only police officers can update alert status.' 
      });
    }

    // Validate status
    const validStatuses = ['active', 'resolved', 'false_alarm'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    // Check if alert exists
    const alert = await db.getQuery(
      'SELECT * FROM alerts WHERE id = ?',
      [alertId]
    );

    if (!alert) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alert not found' 
      });
    }

    // Update alert status
    let updateQuery = 'UPDATE alerts SET status = ?';
    let params = [status];

    if (status === 'resolved') {
      updateQuery += ', resolved_by = ?, resolved_at = CURRENT_TIMESTAMP';
      params.push(police_id);
    }

    updateQuery += ' WHERE id = ?';
    params.push(alertId);

    await db.executeQuery(updateQuery, params);

    // Get updated alert with tourist info
    const updatedAlert = await db.getQuery(`
      SELECT a.*, t.name as tourist_name, t.phone as tourist_phone
      FROM alerts a
      JOIN tourists t ON a.tourist_id = t.id
      WHERE a.id = ?
    `, [alertId]);

    res.json({
      success: true,
      message: 'Alert status updated successfully',
      data: updatedAlert
    });

  } catch (error) {
    console.error('Update alert status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating alert status' 
    });
  }
});

// Get alert details
router.get('/:alertId', verifyToken, async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await db.getQuery(`
      SELECT a.*, t.name as tourist_name, t.phone as tourist_phone, 
             t.nationality as tourist_nationality, t.emergency_contact,
             po.name as resolved_by_name, po.badge_number
      FROM alerts a
      JOIN tourists t ON a.tourist_id = t.id
      LEFT JOIN police_officers po ON a.resolved_by = po.id
      WHERE a.id = ?
    `, [alertId]);

    if (!alert) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alert not found' 
      });
    }

    // Check if user has permission to view this alert
    if (req.user.userType === 'tourist' && alert.tourist_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view your own alerts.' 
      });
    }

    res.json({
      success: true,
      data: alert
    });

  } catch (error) {
    console.error('Fetch alert details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching alert details' 
    });
  }
});

// Cancel alert (for tourists)
router.delete('/:alertId', verifyToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const tourist_id = req.user.id;

    if (req.user.userType !== 'tourist') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only tourists can cancel their alerts.' 
      });
    }

    // Check if alert exists and belongs to the tourist
    const alert = await db.getQuery(
      'SELECT * FROM alerts WHERE id = ? AND tourist_id = ?',
      [alertId, tourist_id]
    );

    if (!alert) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alert not found or you do not have permission to cancel it' 
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only active alerts can be cancelled' 
      });
    }

    // Update alert status to false_alarm
    await db.executeQuery(
      'UPDATE alerts SET status = ? WHERE id = ?',
      ['false_alarm', alertId]
    );

    res.json({
      success: true,
      message: 'Alert cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel alert error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while cancelling alert' 
    });
  }
});

module.exports = router;