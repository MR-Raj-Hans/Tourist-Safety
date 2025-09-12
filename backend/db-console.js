// Simple DB console utility for local inspection
const db = require('./db');

(async () => {
  try {
    await db.initialize();

    console.log('\n--- TOURISTS ---');
    const tourists = await db.getAllQuery('SELECT id, name, email, phone, nationality, status, created_at FROM tourists ORDER BY created_at DESC');
    console.table(tourists);

    console.log('\n--- ALERTS ---');
    const alerts = await db.getAllQuery('SELECT id, tourist_id, alert_type, location, latitude, longitude, priority, status, created_at FROM alerts ORDER BY created_at DESC');
    console.table(alerts);

    await db.close();
    process.exit(0);
  } catch (err) {
    console.error('DB console error:', err);
    process.exit(1);
  }
})();
