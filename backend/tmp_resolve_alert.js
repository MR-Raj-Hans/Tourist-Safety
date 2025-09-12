const db = require('./db');

async function resolve() {
  try {
    await db.initialize();
    await db.executeQuery("UPDATE alerts SET status = 'resolved', resolved_by = 0, resolved_at = CURRENT_TIMESTAMP WHERE id = ?", [1]);
    console.log('Alert updated to resolved');
    process.exit(0);
  } catch (err) {
    console.error('Error updating alert:', err);
    process.exit(1);
  }
}

resolve();
