const express = require('express');
const db = require('../db');

const router = express.Router();

// Development-only route: return DB snapshots for quick local testing
router.get('/db', async (req, res) => {
  try {
    const tourists = await db.getAllQuery('SELECT id, name, email, phone, nationality, status, created_at FROM tourists ORDER BY created_at DESC');
    const alerts = await db.getAllQuery('SELECT * FROM alerts ORDER BY created_at DESC');
    res.json({ success: true, data: { tourists, alerts } });
  } catch (err) {
    console.error('Dev DB route error:', err);
    res.status(500).json({ success: false, message: 'Failed to read database' });
  }
});

// Development-only route: insert an alert without auth for testing (POST /api/dev/insert_alert)
router.post('/insert_alert', async (req, res) => {
  try {
    const { tourist_id, alert_type, location, latitude, longitude, description, priority } = req.body;

    // Basic validation
    if (!tourist_id || !alert_type || !location) {
      return res.status(400).json({ success: false, message: 'tourist_id, alert_type and location are required' });
    }

    const pr = priority || (alert_type === 'panic' || alert_type === 'medical' ? 'critical' : 'medium');

    const result = await db.executeQuery(
      `INSERT INTO alerts (tourist_id, alert_type, location, latitude, longitude, description, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tourist_id, alert_type, location, latitude || null, longitude || null, description || null, pr, 'active']
    );

    const inserted = await db.getQuery('SELECT * FROM alerts WHERE id = ?', [result.id]);

    res.status(201).json({ success: true, data: inserted });
  } catch (err) {
    console.error('Dev insert alert error:', err);
    res.status(500).json({ success: false, message: 'Failed to insert alert' });
  }
});

module.exports = router;
