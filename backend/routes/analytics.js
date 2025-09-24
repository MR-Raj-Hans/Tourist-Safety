const express = require('express');
const router = express.Router();

// Mock data for demonstration - In production, this would come from your database
const mockData = {
  kpiData: {
    safetyScore: { value: 87, trend: 'up', change: '+5.2%' },
    activeIncidents: { value: 12, trend: 'down', change: '-23%' },
    touristCount: { value: 2847, trend: 'up', change: '+12.5%' },
    responseTime: { value: 4.2, trend: 'down', change: '-18%' }
  },
  
  liveData: {
    activeAlerts: 3,
    safeZones: 45,
    responseTeams: 8
  },

  incidents: [
    {
      id: 1,
      type: 'theft',
      title: 'Theft Reported',
      description: 'Pickpocketing incident near Mysuru Palace',
      location: { lat: 12.3051, lng: 76.6551, name: 'Mysuru Palace' },
      severity: 'medium',
      status: 'active',
      timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
      reportedBy: 'Tourist',
      responseTeam: 'Team Alpha'
    },
    {
      id: 2,
      type: 'medical',
      title: 'Medical Emergency',
      description: 'Tourist requiring medical assistance',
      location: { lat: 12.9716, lng: 77.5946, name: 'Brigade Road' },
      severity: 'high',
      status: 'resolved',
      timestamp: new Date(Date.now() - 28 * 60 * 1000), // 28 minutes ago
      reportedBy: 'Bystander',
      responseTeam: 'Medical Team 1'
    },
    {
      id: 3,
      type: 'traffic',
      title: 'Traffic Congestion',
      description: 'Heavy traffic causing delays',
      location: { lat: 12.9716, lng: 77.5946, name: 'MG Road Junction' },
      severity: 'low',
      status: 'resolved',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      reportedBy: 'Traffic Police',
      responseTeam: 'Traffic Control'
    },
    {
      id: 4,
      type: 'safety',
      title: 'Safety Patrol',
      description: 'Routine safety patrol deployment',
      location: { lat: 12.9698, lng: 77.5859, name: 'Cubbon Park' },
      severity: 'low',
      status: 'active',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      reportedBy: 'System',
      responseTeam: 'Patrol Unit 3'
    },
    {
      id: 5,
      type: 'scam',
      title: 'Tourist Scam Alert',
      description: 'Fake travel agency reported',
      location: { lat: 12.9352, lng: 77.6245, name: 'Commercial Street' },
      severity: 'medium',
      status: 'investigating',
      timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
      reportedBy: 'Tourist',
      responseTeam: 'Investigation Unit'
    }
  ],

  safetyTrends: {
    '7days': {
      safety: [
        { time: '00:00', value: 85, date: '2025-09-07' },
        { time: '04:00', value: 88, date: '2025-09-08' },
        { time: '08:00', value: 82, date: '2025-09-09' },
        { time: '12:00', value: 87, date: '2025-09-10' },
        { time: '16:00', value: 89, date: '2025-09-11' },
        { time: '20:00', value: 86, date: '2025-09-12' },
        { time: '24:00', value: 87, date: '2025-09-13' }
      ],
      incidents: [
        { time: '00:00', value: 15, date: '2025-09-07' },
        { time: '04:00', value: 8, date: '2025-09-08' },
        { time: '08:00', value: 22, date: '2025-09-09' },
        { time: '12:00', value: 18, date: '2025-09-10' },
        { time: '16:00', value: 12, date: '2025-09-11' },
        { time: '20:00', value: 16, date: '2025-09-12' },
        { time: '24:00', value: 12, date: '2025-09-13' }
      ],
      response: [
        { time: '00:00', value: 5.2, date: '2025-09-07' },
        { time: '04:00', value: 4.8, date: '2025-09-08' },
        { time: '08:00', value: 6.1, date: '2025-09-09' },
        { time: '12:00', value: 4.5, date: '2025-09-10' },
        { time: '16:00', value: 4.2, date: '2025-09-11' },
        { time: '20:00', value: 3.9, date: '2025-09-12' },
        { time: '24:00', value: 4.2, date: '2025-09-13' }
      ]
    },
    '30days': {
      safety: Array.from({ length: 30 }, (_, i) => ({
        time: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 20 + 75),
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })),
      incidents: Array.from({ length: 30 }, (_, i) => ({
        time: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 25 + 5),
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })),
      response: Array.from({ length: 30 }, (_, i) => ({
        time: `Day ${i + 1}`,
        value: (Math.random() * 3 + 3).toFixed(1),
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }))
    }
  },

  statistics: {
    touristSatisfaction: 99.2,
    emergencyResponseAvailability: '24/7',
    incidentsPreventedThisMonth: 156,
    averageSafetyRating: 4.8,
    totalTouristsServed: 25847,
    responseTeamsDeployed: 24,
    safeZonesCovered: 45,
    emergencyContactsActive: 1250
  }
};

// GET /api/analytics/stats - Get KPI dashboard statistics
router.get('/stats', (req, res) => {
  try {
    // Add some real-time variation to the data
    const stats = {
      ...mockData.kpiData,
      safetyScore: {
        ...mockData.kpiData.safetyScore,
        value: Math.max(70, Math.min(95, mockData.kpiData.safetyScore.value + (Math.random() - 0.5) * 2))
      },
      activeIncidents: {
        ...mockData.kpiData.activeIncidents,
        value: Math.max(0, Math.min(30, mockData.kpiData.activeIncidents.value + Math.floor((Math.random() - 0.5) * 3)))
      },
      touristCount: {
        ...mockData.kpiData.touristCount,
        value: mockData.kpiData.touristCount.value + Math.floor((Math.random() - 0.5) * 100)
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// GET /api/analytics/trends - Get safety trends data
router.get('/trends', (req, res) => {
  try {
    const { days = '7days', metric = 'safety' } = req.query;
    
    const validDays = ['7days', '30days'];
    const validMetrics = ['safety', 'incidents', 'response'];
    
    if (!validDays.includes(days)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter. Use "7days" or "30days"'
      });
    }
    
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metric parameter. Use "safety", "incidents", or "response"'
      });
    }

    const trendsData = mockData.safetyTrends[days][metric];
    
    res.json({
      success: true,
      data: trendsData,
      parameters: { days, metric },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends data',
      message: error.message
    });
  }
});

// GET /api/analytics/incidents - Get incidents data with filtering
router.get('/incidents', (req, res) => {
  try {
    const { 
      type = 'all', 
      status = 'all', 
      severity = 'all',
      limit = 10,
      offset = 0 
    } = req.query;

    let filteredIncidents = [...mockData.incidents];

    // Filter by type
    if (type !== 'all') {
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.type.toLowerCase() === type.toLowerCase()
      );
    }

    // Filter by status
    if (status !== 'all') {
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter by severity
    if (severity !== 'all') {
      filteredIncidents = filteredIncidents.filter(incident => 
        incident.severity.toLowerCase() === severity.toLowerCase()
      );
    }

    // Sort by timestamp (most recent first)
    filteredIncidents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const total = filteredIncidents.length;
    const paginatedIncidents = filteredIncidents.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );

    // Format timestamps for display
    const formattedIncidents = paginatedIncidents.map(incident => ({
      ...incident,
      timeAgo: getTimeAgo(incident.timestamp),
      formattedTime: incident.timestamp.toLocaleString()
    }));

    res.json({
      success: true,
      data: formattedIncidents,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      },
      filters: { type, status, severity },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch incidents',
      message: error.message
    });
  }
});

// GET /api/analytics/live - Get live monitoring data
router.get('/live', (req, res) => {
  try {
    // Add some real-time variation
    const liveData = {
      activeAlerts: mockData.liveData.activeAlerts + Math.floor(Math.random() * 3 - 1),
      safeZones: mockData.liveData.safeZones,
      responseTeams: mockData.liveData.responseTeams + Math.floor(Math.random() * 3 - 1),
      lastUpdate: new Date().toISOString()
    };

    // Ensure values don't go below 0
    Object.keys(liveData).forEach(key => {
      if (typeof liveData[key] === 'number' && liveData[key] < 0) {
        liveData[key] = 0;
      }
    });

    res.json({
      success: true,
      data: liveData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch live data',
      message: error.message
    });
  }
});

// GET /api/analytics/summary - Get overall statistics summary
router.get('/summary', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockData.statistics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary',
      message: error.message
    });
  }
});

// POST /api/analytics/incident - Create a new incident report
router.post('/incident', (req, res) => {
  try {
    const { type, title, description, location, severity, reportedBy } = req.body;

    // Validate required fields
    if (!type || !title || !description || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, title, description, location'
      });
    }

    const newIncident = {
      id: mockData.incidents.length + 1,
      type,
      title,
      description,
      location,
      severity: severity || 'medium',
      status: 'active',
      timestamp: new Date(),
      reportedBy: reportedBy || 'Anonymous',
      responseTeam: getAssignedTeam(type)
    };

    mockData.incidents.unshift(newIncident);

    // Update active incidents count
    mockData.kpiData.activeIncidents.value += 1;

    res.status(201).json({
      success: true,
      data: newIncident,
      message: 'Incident reported successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create incident',
      message: error.message
    });
  }
});

// PUT /api/analytics/incident/:id - Update incident status
router.put('/incident/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseTeam, notes } = req.body;

    const incidentIndex = mockData.incidents.findIndex(inc => inc.id === parseInt(id));
    
    if (incidentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found'
      });
    }

    // Update incident
    if (status) mockData.incidents[incidentIndex].status = status;
    if (responseTeam) mockData.incidents[incidentIndex].responseTeam = responseTeam;
    if (notes) mockData.incidents[incidentIndex].notes = notes;
    
    mockData.incidents[incidentIndex].lastUpdated = new Date();

    // Update active incidents count if resolved
    if (status === 'resolved' && mockData.incidents[incidentIndex].status !== 'resolved') {
      mockData.kpiData.activeIncidents.value = Math.max(0, mockData.kpiData.activeIncidents.value - 1);
    }

    res.json({
      success: true,
      data: mockData.incidents[incidentIndex],
      message: 'Incident updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update incident',
      message: error.message
    });
  }
});

// Utility functions
function getTimeAgo(timestamp) {
  const now = new Date();
  const diffMs = now - new Date(timestamp);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

function getAssignedTeam(incidentType) {
  const teams = {
    theft: 'Security Team Alpha',
    medical: 'Medical Response Unit',
    traffic: 'Traffic Control',
    safety: 'Safety Patrol',
    scam: 'Investigation Unit',
    accident: 'Emergency Response Team'
  };
  
  return teams[incidentType] || 'General Response Team';
}

module.exports = router;