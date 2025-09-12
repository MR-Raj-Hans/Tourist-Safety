// Seed script to insert a sample tourist and alert for local development/testing
const db = require('./db');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await db.initialize();

    // Insert sample tourist
    const passwordHash = await bcrypt.hash('password123', 10);
    const resTourist = await db.executeQuery(
      `INSERT INTO tourists (name, email, password, phone, nationality, passport_number, emergency_contact, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Demo Tourist', 'tourist_demo@example.com', passwordHash, '+1234567890', 'DemoLand', 'P1234567', '+0987654321', 'active']
    );

    const touristId = resTourist.id;

    // Insert sample alert
    await db.executeQuery(
      `INSERT INTO alerts (tourist_id, alert_type, location, latitude, longitude, description, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [touristId, 'panic', 'Demo Location', 12.9716, 77.5946, 'Test panic alert from demo', 'critical', 'active']
    );

    console.log('Seed data inserted successfully');
    await db.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
})();
