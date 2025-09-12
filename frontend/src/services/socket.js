import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect(userData) {
    const socketURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketURL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      
      // Join room based on user type
      if (userData) {
        this.socket.emit('join', userData);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    // Set up default listeners
    this.setupDefaultListeners();

    return this.socket;
  }

  setupDefaultListeners() {
    // Listen for panic alerts (for police)
    this.socket.on('new_panic_alert', (alertData) => {
      this.notifyListeners('new_panic_alert', alertData);
    });

    // Listen for location updates (for police)
    this.socket.on('tourist_location_update', (locationData) => {
      this.notifyListeners('tourist_location_update', locationData);
    });

    // Listen for alert status updates
    this.socket.on('alert_status_update', (updateData) => {
      this.notifyListeners('alert_status_update', updateData);
    });

    // Listen for system notifications
    this.socket.on('system_notification', (notification) => {
      this.notifyListeners('system_notification', notification);
    });
  }

  // Send panic alert
  sendPanicAlert(alertData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('panic_alert', alertData);
    }
  }

  // Send location update
  updateLocation(locationData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('location_update', locationData);
    }
  }

  // Send alert status update
  updateAlertStatus(statusData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('alert_status_update', statusData);
    }
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Also set up socket listener if connected
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Unsubscribe from events
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    // Also remove socket listener if connected
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
    this.listeners.clear();
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Emit custom event
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Join a specific room
  joinRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', roomName);
    }
  }

  // Leave a specific room
  leaveRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', roomName);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;