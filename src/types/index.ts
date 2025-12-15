export type SeverityLevel = 'low' | 'medium' | 'high';

export interface PotholeDetection {
  id: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  timestamp: number;
  synced: boolean;
  confirmationCount: number;
  vibrationMagnitude: number;
  speed: number;
  roadType?: string;
}

export interface SensorData {
  accelerometerMagnitude: number;
  vibrationLevel: 'Low' | 'Medium' | 'High';
  gyroscopeX: number;
  gyroscopeY: number;
  gyroscopeZ: number;
}

export interface GPSStatus {
  status: 'locked' | 'searching' | 'unavailable';
  latitude: number | null;
  longitude: number | null;
  speed: number;
}

export interface AppSettings {
  sensitivity: 'low' | 'medium' | 'high';
  alertsEnabled: boolean;
  alertSound: boolean;
  alertVibration: boolean;
  dataUsage: 'wifi-only' | 'wifi-and-mobile';
}
