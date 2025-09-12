const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'tourist_safety.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      // Tourists table
      `CREATE TABLE IF NOT EXISTS tourists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        nationality VARCHAR(100),
        passport_number VARCHAR(50),
        emergency_contact VARCHAR(20),
        current_location TEXT,
        status TEXT CHECK(status IN ('active', 'inactive', 'emergency')) DEFAULT 'active',
        qr_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Alerts table
      `CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tourist_id INTEGER NOT NULL,
        alert_type TEXT CHECK(alert_type IN ('panic', 'medical', 'crime', 'lost')) NOT NULL,
        location TEXT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        description TEXT,
        status TEXT CHECK(status IN ('active', 'resolved', 'false_alarm')) DEFAULT 'active',
        priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
        resolved_by INTEGER,
        resolved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tourist_id) REFERENCES tourists(id),
        FOREIGN KEY (resolved_by) REFERENCES police_officers(id)
      )`,

      // Police officers table
      `CREATE TABLE IF NOT EXISTS police_officers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        badge_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        station VARCHAR(255),
        rank VARCHAR(100),
        status TEXT CHECK(status IN ('on_duty', 'off_duty')) DEFAULT 'off_duty',
        current_location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Geo-fences table
      `CREATE TABLE IF NOT EXISTS geo_fences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        coordinates TEXT NOT NULL,
        fence_type TEXT CHECK(fence_type IN ('safe_zone', 'restricted_zone', 'tourist_area')) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // QR codes table
      `CREATE TABLE IF NOT EXISTS qr_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tourist_id INTEGER NOT NULL,
        qr_data TEXT NOT NULL,
        location_name VARCHAR(255),
        scan_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tourist_id) REFERENCES tourists(id)
      )`,

      // Location history table
      `CREATE TABLE IF NOT EXISTS location_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tourist_id INTEGER NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        accuracy DECIMAL(5, 2),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tourist_id) REFERENCES tourists(id)
      )`
    ];

    for (const tableSQL of tables) {
      await this.executeQuery(tableSQL);
    }

    console.log('All database tables created successfully');
  }

  executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getAllQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

const database = new Database();
module.exports = database;