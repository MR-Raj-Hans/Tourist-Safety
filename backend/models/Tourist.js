const db = require('../db');

// Tourist model
class Tourist {
  static async create(touristData) {
    const { name, email, password, phone, nationality, passport_number, emergency_contact } = touristData;
    
    const result = await db.executeQuery(
      `INSERT INTO tourists (name, email, password, phone, nationality, passport_number, emergency_contact) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password, phone, nationality, passport_number, emergency_contact]
    );
    
    return { id: result.id, ...touristData };
  }

  static async findById(id) {
    return await db.getQuery('SELECT * FROM tourists WHERE id = ?', [id]);
  }

  static async findByEmail(email) {
    return await db.getQuery('SELECT * FROM tourists WHERE email = ?', [email]);
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(id);
    
    await db.executeQuery(
      `UPDATE tourists SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    return await this.findById(id);
  }

  static async updateLocation(id, latitude, longitude, accuracy = null) {
    const locationData = {
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    };

    // Update current location in tourists table
    await db.executeQuery(
      'UPDATE tourists SET current_location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(locationData), id]
    );

    // Add to location history
    await db.executeQuery(
      'INSERT INTO location_history (tourist_id, latitude, longitude, accuracy) VALUES (?, ?, ?, ?)',
      [id, latitude, longitude, accuracy]
    );

    return locationData;
  }

  static async updateStatus(id, status) {
    const validStatuses = ['active', 'inactive', 'emergency'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    await db.executeQuery(
      'UPDATE tourists SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    return await this.findById(id);
  }

  static async getLocationHistory(id, limit = 50, hours = 24) {
    return await db.getAllQuery(
      `SELECT * FROM location_history 
       WHERE tourist_id = ? AND timestamp >= datetime('now', '-${hours} hours')
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [id, limit]
    );
  }

  static async getActiveAlerts(id) {
    return await db.getAllQuery(
      'SELECT * FROM alerts WHERE tourist_id = ? AND status = "active" ORDER BY created_at DESC',
      [id]
    );
  }

  static async getQRCodes(id, activeOnly = false) {
    let query = 'SELECT * FROM qr_codes WHERE tourist_id = ?';
    const params = [id];

    if (activeOnly) {
      query += ' AND is_active = true AND expires_at > datetime("now")';
    }

    query += ' ORDER BY created_at DESC';

    return await db.getAllQuery(query, params);
  }

  static async delete(id) {
    // Note: In a real application, you might want to soft delete or archive instead
    await db.executeQuery('DELETE FROM tourists WHERE id = ?', [id]);
    return true;
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM tourists WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.nationality) {
      query += ' AND nationality = ?';
      params.push(filters.nationality);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return await db.getAllQuery(query, params);
  }

  static async getStats() {
    const totalTourists = await db.getQuery('SELECT COUNT(*) as count FROM tourists');
    const activeTourists = await db.getQuery('SELECT COUNT(*) as count FROM tourists WHERE status = "active"');
    const emergencyTourists = await db.getQuery('SELECT COUNT(*) as count FROM tourists WHERE status = "emergency"');
    const todayRegistrations = await db.getQuery(
      'SELECT COUNT(*) as count FROM tourists WHERE DATE(created_at) = DATE("now")'
    );

    return {
      total: totalTourists.count,
      active: activeTourists.count,
      emergency: emergencyTourists.count,
      today_registrations: todayRegistrations.count
    };
  }
}

module.exports = Tourist;