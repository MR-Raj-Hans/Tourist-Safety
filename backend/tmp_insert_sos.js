const db = require('./db');

async function insert() {
  try {
    await db.initialize();
    const result = await db.executeQuery(
      `INSERT INTO alerts (tourist_id, alert_type, location, latitude, longitude, description, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, 'panic', 'Test SOS Location', 12.9716, 77.5946, 'Simulated SOS from user', 'critical', 'active']
    );
    console.log('Inserted SOS with id', result.id);
    process.exit(0);
  } catch (err) {
    console.error('Insert error', err);
    process.exit(1);
  }
}

insert();
