/**
 * API Service for Pothole Detection App
 * Connects to the backend server
 */

// Change this to your server URL
const API_BASE_URL = __DEV__ 
  ? 'http://172.26.229.227:5000/api'  // Android emulator
  : 'http://localhost:5000/api'; // iOS simulator / Web

// For physical devices, use your machine's IP address:
// const API_BASE_URL = 'http://192.168.1.100:5000/api';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const getHeaders = (additionalHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0',
    ...additionalHeaders
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
};

/**
 * Register device (anonymous user)
 */
export const registerDevice = async (deviceInfo: {
  deviceId: string;
  deviceModel?: string;
  devicePlatform?: string;
  appVersion?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/register-device`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(deviceInfo)
  });

  const data = await response.json();
  
  if (response.ok && data.token) {
    setAuthToken(data.token);
  }

  return data;
};

/**
 * Submit road audit report
 * This is the main function called when user submits a report from the app
 */
export const submitReport = async (reportData: {
  report_id: string;
  device_id: string;
  reported_at: string;
  anomalies: Array<{
    location_id: string;
    type: 'pothole' | 'road_anomaly';
    severity: 'Low' | 'Medium' | 'High';
    latitude: number;
    longitude: number;
    timestamp?: string;
    // For road_anomaly type
    start_latitude?: number;
    start_longitude?: number;
    end_latitude?: number;
    end_longitude?: number;
    start_timestamp?: string;
    end_timestamp?: string;
    duration_seconds?: number;
  }>;
}) => {
  const response = await fetch(`${API_BASE_URL}/reports/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(reportData)
  });

  return response.json();
};

/**
 * Get aggregated pothole locations (for map display)
 */
export const getAggregatedLocations = async (filters?: {
  status?: 'pending' | 'assigned' | 'fixed';
  severity?: 'Low' | 'Medium' | 'High';
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
}) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
  }

  const response = await fetch(
    `${API_BASE_URL}/reports/aggregated/locations?${params.toString()}`,
    { headers: getHeaders() }
  );

  return response.json();
};

/**
 * Get nearby potholes
 */
export const getNearbyPotholes = async (lat: number, lng: number, radiusKm: number = 5) => {
  const response = await fetch(
    `${API_BASE_URL}/reports/location/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`,
    { headers: getHeaders() }
  );

  return response.json();
};

/**
 * Get statistics
 */
export const getStatistics = async () => {
  const response = await fetch(`${API_BASE_URL}/reports/stats/overview`, {
    headers: getHeaders()
  });

  return response.json();
};

/**
 * User login
 */
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  
  if (response.ok && data.token) {
    setAuthToken(data.token);
  }

  return data;
};

/**
 * User registration
 */
export const register = async (userData: {
  email: string;
  password: string;
  deviceId?: string;
  deviceModel?: string;
  devicePlatform?: string;
  appVersion?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData)
  });

  const data = await response.json();
  
  if (response.ok && data.token) {
    setAuthToken(data.token);
  }

  return data;
};

/**
 * Get user profile
 */
export const getProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    headers: getHeaders()
  });

  return response.json();
};

/**
 * Get user's reports
 */
export const getMyReports = async () => {
  const response = await fetch(`${API_BASE_URL}/user/reports`, {
    headers: getHeaders()
  });

  return response.json();
};

/**
 * Get user settings
 */
export const getSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/user/settings`, {
    headers: getHeaders()
  });

  return response.json();
};

/**
 * Update user settings
 */
export const updateSettings = async (settings: {
  sensitivity?: 'low' | 'medium' | 'high';
  alerts_enabled?: boolean;
  alert_sound?: boolean;
  alert_vibration?: boolean;
  data_usage?: 'wifi-only' | 'wifi-and-mobile';
}) => {
  const response = await fetch(`${API_BASE_URL}/user/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(settings)
  });

  return response.json();
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

export default {
  setAuthToken,
  registerDevice,
  submitReport,
  getAggregatedLocations,
  getNearbyPotholes,
  getStatistics,
  login,
  register,
  getProfile,
  getMyReports,
  getSettings,
  updateSettings,
  healthCheck
};
