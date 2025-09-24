import axios from 'axios';

// API base URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AnalyticsService {
  
  // Get KPI dashboard statistics
  async getStats() {
    try {
      const response = await apiClient.get('/analytics/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
      throw this.handleError(error);
    }
  }

  // Get safety trends data
  async getTrends(days = '7days', metric = 'safety') {
    try {
      const response = await apiClient.get('/analytics/trends', {
        params: { days, metric }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trends data:', error);
      throw this.handleError(error);
    }
  }

  // Get incidents with filtering options
  async getIncidents(filters = {}) {
    try {
      const {
        type = 'all',
        status = 'all',
        severity = 'all',
        limit = 10,
        offset = 0
      } = filters;

      const response = await apiClient.get('/analytics/incidents', {
        params: { type, status, severity, limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw this.handleError(error);
    }
  }

  // Get live monitoring data
  async getLiveData() {
    try {
      const response = await apiClient.get('/analytics/live');
      return response.data;
    } catch (error) {
      console.error('Error fetching live data:', error);
      throw this.handleError(error);
    }
  }

  // Get overall statistics summary
  async getSummary() {
    try {
      const response = await apiClient.get('/analytics/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw this.handleError(error);
    }
  }

  // Create a new incident report
  async createIncident(incidentData) {
    try {
      const response = await apiClient.post('/analytics/incident', incidentData);
      return response.data;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw this.handleError(error);
    }
  }

  // Update incident status
  async updateIncident(id, updateData) {
    try {
      const response = await apiClient.put(`/analytics/incident/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating incident:', error);
      throw this.handleError(error);
    }
  }

  // Export dashboard data (placeholder - would generate and download file)
  async exportData(format = 'json', timeframe = '7days') {
    try {
      // In a real implementation, this would call an export endpoint
      // For now, we'll simulate by fetching all data and formatting it
      
      const [stats, trends, incidents, summary] = await Promise.all([
        this.getStats(),
        this.getTrends(timeframe),
        this.getIncidents({ limit: 100 }),
        this.getSummary()
      ]);

      const exportData = {
        generatedAt: new Date().toISOString(),
        timeframe,
        stats: stats.data,
        trends: trends.data,
        incidents: incidents.data,
        summary: summary.data
      };

      if (format === 'json') {
        this.downloadJSON(exportData, `safetravel-analytics-${timeframe}-${Date.now()}.json`);
      } else if (format === 'csv') {
        this.downloadCSV(exportData, `safetravel-analytics-${timeframe}-${Date.now()}.csv`);
      }

      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw this.handleError(error);
    }
  }

  // Utility function to download JSON data
  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Utility function to download CSV data
  downloadCSV(data, filename) {
    // Convert incidents to CSV format
    const incidents = data.incidents || [];
    const headers = ['ID', 'Type', 'Title', 'Description', 'Location', 'Severity', 'Status', 'Timestamp', 'Reported By'];
    
    const csvContent = [
      headers.join(','),
      ...incidents.map(incident => [
        incident.id,
        incident.type,
        `"${incident.title}"`,
        `"${incident.description}"`,
        `"${incident.location?.name || 'Unknown'}"`,
        incident.severity,
        incident.status,
        incident.formattedTime || incident.timestamp,
        `"${incident.reportedBy}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Get real-time updates using polling (in production, consider WebSocket)
  startRealTimeUpdates(callback, interval = 30000) {
    const updateInterval = setInterval(async () => {
      try {
        const [stats, liveData] = await Promise.all([
          this.getStats(),
          this.getLiveData()
        ]);
        
        callback({
          stats: stats.data,
          live: liveData.data,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error in real-time update:', error);
      }
    }, interval);

    return updateInterval;
  }

  // Stop real-time updates
  stopRealTimeUpdates(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  // Error handling utility
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.error || error.response.data?.message || 'Server error',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response
      return {
        message: 'Network error - unable to reach server',
        status: 0,
        data: null
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Unknown error occurred',
        status: 0,
        data: null
      };
    }
  }

  // Get analytics dashboard configuration
  getDashboardConfig() {
    return {
      refreshIntervals: [
        { label: '30 seconds', value: 30000 },
        { label: '1 minute', value: 60000 },
        { label: '5 minutes', value: 300000 },
        { label: '10 minutes', value: 600000 }
      ],
      timeframes: [
        { label: 'Last 7 Days', value: '7days' },
        { label: 'Last 30 Days', value: '30days' },
        { label: 'Custom Range', value: 'custom' }
      ],
      incidentTypes: [
        { label: 'All Types', value: 'all' },
        { label: 'Theft', value: 'theft' },
        { label: 'Medical', value: 'medical' },
        { label: 'Traffic', value: 'traffic' },
        { label: 'Safety', value: 'safety' },
        { label: 'Scam', value: 'scam' },
        { label: 'Accident', value: 'accident' }
      ],
      severityLevels: [
        { label: 'All Levels', value: 'all' },
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' }
      ],
      statusOptions: [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Investigating', value: 'investigating' },
        { label: 'Resolved', value: 'resolved' }
      ],
      chartMetrics: [
        { label: 'Safety Score', value: 'safety' },
        { label: 'Incident Count', value: 'incidents' },
        { label: 'Response Time', value: 'response' }
      ]
    };
  }
}

export default new AnalyticsService();