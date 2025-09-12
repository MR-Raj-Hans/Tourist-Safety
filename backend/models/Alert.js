const db = require('../db');

// Alert model
class Alert {
  static async create(alertData) {
    const { 
      tourist_id, 
      alert_type, 
      location, 
      latitude, 
      longitude, 
      description, 
      priority = 'medium' 
    } = alertData;
    
    const validAlertTypes = ['panic', 'medical', 'crime', 'lost'];
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    
    if (!validAlertTypes.includes(alert_type)) {
      throw new Error('Invalid alert type');
    }
    
    if (!validPriorities.includes(priority)) {
      throw new Error('Invalid priority level');
    }
    
    const result = await db.executeQuery(
      `INSERT INTO alerts (tourist_id, alert_type, location, latitude, longitude, description, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tourist_id, alert_type, location, latitude, longitude, description, priority]
    );
    
    return { id: result.id, ...alertData, status: 'active', created_at: new Date().toISOString() };
  }

  static async findById(id) {
    return await db.getQuery(`
      SELECT a.*, t.name as tourist_name, t.phone as tourist_phone, 
             t.nationality as tourist_nationality, t.emergency_contact,
             po.name as resolved_by_name, po.badge_number
      FROM alerts a
      JOIN tourists t ON a.tourist_id = t.id
      LEFT JOIN police_officers po ON a.resolved_by = po.id
      WHERE a.id = ?
    `, [id]);
  }

  static async findByTouristId(touristId, limit = 10) {
    return await db.getAllQuery(
      'SELECT * FROM alerts WHERE tourist_id = ? ORDER BY created_at DESC LIMIT ?',
      [touristId, limit]
    );
  }

  static async getActive(filters = {}) {
    let query = `
      SELECT a.*, t.name as tourist_name, t.phone as tourist_phone, 
             t.nationality as tourist_nationality, t.emergency_contact
      FROM alerts a
      JOIN tourists t ON a.tourist_id = t.id
      WHERE a.status = 'active'
    `;
    const params = [];

    if (filters.alert_type) {
      query += ' AND a.alert_type = ?';
      params.push(filters.alert_type);
    }

    if (filters.priority) {
      query += ' AND a.priority = ?';
      params.push(filters.priority);
    }

    if (filters.location) {
      query += ' AND a.location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    query += ' ORDER BY a.priority DESC, a.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return await db.getAllQuery(query, params);
  }

  static async updateStatus(id, status, resolvedBy = null) {
    const validStatuses = ['active', 'resolved', 'false_alarm'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    let query = 'UPDATE alerts SET status = ?';
    const params = [status];

    if (status === 'resolved' && resolvedBy) {
      query += ', resolved_by = ?, resolved_at = CURRENT_TIMESTAMP';
      params.push(resolvedBy);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.executeQuery(query, params);
    return await this.findById(id);
  }

  static async update(id, updateData) {
    const allowedFields = ['location', 'latitude', 'longitude', 'description', 'priority', 'status'];
    const fields = Object.keys(updateData).filter(field => allowedFields.includes(field));
    const values = fields.map(field => updateData[field]);
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(id);
    
    await db.executeQuery(
      `UPDATE alerts SET ${setClause} WHERE id = ?`,
      values
    );
    
    return await this.findById(id);
  }

  static async delete(id) {
    await db.executeQuery('DELETE FROM alerts WHERE id = ?', [id]);
    return true;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT a.*, t.name as tourist_name, t.phone as tourist_phone, 
             t.nationality as tourist_nationality,
             po.name as resolved_by_name, po.badge_number
      FROM alerts a
      JOIN tourists t ON a.tourist_id = t.id
      LEFT JOIN police_officers po ON a.resolved_by = po.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND a.status = ?';
      params.push(filters.status);
    }

    if (filters.alert_type) {
      query += ' AND a.alert_type = ?';
      params.push(filters.alert_type);
    }

    if (filters.priority) {
      query += ' AND a.priority = ?';
      params.push(filters.priority);
    }

    if (filters.tourist_id) {
      query += ' AND a.tourist_id = ?';
      params.push(filters.tourist_id);
    }

    if (filters.date_from) {
      query += ' AND DATE(a.created_at) >= DATE(?)';
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ' AND DATE(a.created_at) <= DATE(?)';
      params.push(filters.date_to);
    }

    query += ' ORDER BY a.priority DESC, a.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return await db.getAllQuery(query, params);
  }

  static async getStats(dateRange = 7) {
    const totalAlerts = await db.getQuery('SELECT COUNT(*) as count FROM alerts');
    const activeAlerts = await db.getQuery('SELECT COUNT(*) as count FROM alerts WHERE status = "active"');
    const resolvedAlerts = await db.getQuery('SELECT COUNT(*) as count FROM alerts WHERE status = "resolved"');
    const falseAlarms = await db.getQuery('SELECT COUNT(*) as count FROM alerts WHERE status = "false_alarm"');
    
    const recentAlerts = await db.getQuery(
      `SELECT COUNT(*) as count FROM alerts WHERE created_at >= datetime('now', '-${dateRange} days')`
    );

    // Alert type distribution
    const alertTypeStats = await db.getAllQuery(`
      SELECT alert_type, COUNT(*) as count 
      FROM alerts 
      WHERE created_at >= datetime('now', '-${dateRange} days')
      GROUP BY alert_type
    `);

    // Priority distribution
    const priorityStats = await db.getAllQuery(`
      SELECT priority, COUNT(*) as count 
      FROM alerts 
      WHERE created_at >= datetime('now', '-${dateRange} days')
      GROUP BY priority
    `);

    // Average response time (for resolved alerts)
    const avgResponseTime = await db.getQuery(`
      SELECT AVG(julianday(resolved_at) - julianday(created_at)) * 24 * 60 as avg_minutes
      FROM alerts 
      WHERE status = 'resolved' AND resolved_at IS NOT NULL
      AND created_at >= datetime('now', '-${dateRange} days')
    `);

    return {
      total: totalAlerts.count,
      active: activeAlerts.count,
      resolved: resolvedAlerts.count,
      false_alarms: falseAlarms.count,
      recent: recentAlerts.count,
      alert_types: alertTypeStats,
      priorities: priorityStats,
      avg_response_time_minutes: avgResponseTime.avg_minutes ? Math.round(avgResponseTime.avg_minutes) : null,
      date_range_days: dateRange
    };
  }

  static async getByLocation(latitude, longitude, radiusKm = 5) {
    // Simple distance calculation using Haversine formula approximation
    // For more accurate results, consider using PostGIS or similar
    return await db.getAllQuery(`
      SELECT a.*, t.name as tourist_name, t.phone as tourist_phone,
             (6371 * acos(cos(radians(?)) * cos(radians(a.latitude)) * 
              cos(radians(a.longitude) - radians(?)) + sin(radians(?)) * 
              sin(radians(a.latitude)))) AS distance_km
      FROM alerts a
      JOIN tourists t ON a.tourist_id = t.id
      WHERE a.status = 'active'
      HAVING distance_km <= ?
      ORDER BY distance_km ASC
    `, [latitude, longitude, latitude, radiusKm]);
  }

  static async escalate(id, newPriority) {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(newPriority)) {
      throw new Error('Invalid priority level');
    }

    await db.executeQuery(
      'UPDATE alerts SET priority = ? WHERE id = ?',
      [newPriority, id]
    );

    return await this.findById(id);
  }

  static async getTrendData(days = 30) {
    return await db.getAllQuery(`
      SELECT DATE(created_at) as date, 
             COUNT(*) as total_alerts,
             SUM(CASE WHEN alert_type = 'panic' THEN 1 ELSE 0 END) as panic_alerts,
             SUM(CASE WHEN alert_type = 'medical' THEN 1 ELSE 0 END) as medical_alerts,
             SUM(CASE WHEN alert_type = 'crime' THEN 1 ELSE 0 END) as crime_alerts,
             SUM(CASE WHEN alert_type = 'lost' THEN 1 ELSE 0 END) as lost_alerts
      FROM alerts 
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
  }
}

module.exports = Alert;