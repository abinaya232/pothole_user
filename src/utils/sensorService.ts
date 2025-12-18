import { SensorData, GPSStatus, PotholeDetection, SeverityLevel } from '../types';

class SensorService {
  private detectionCallbacks: Array<(detection: PotholeDetection) => void> = [];
  private sensorUpdateCallbacks: Array<(data: SensorData) => void> = [];
  private gpsUpdateCallbacks: Array<(status: GPSStatus) => void> = [];
  private isActive = false;
  private intervalId: number | null = null;
  private gpsIntervalId: number | null = null;
  
  // Simulated current position
  private currentLat = 37.7749;
  private currentLng = -122.4194;
  private currentSpeed = 0;
  private gpsLocked = false;

  startDetection(sensitivity: 'low' | 'medium' | 'high') {
    if (this.isActive) return;
    
    this.isActive = true;
    this.currentSpeed = 30 + Math.random() * 30; // 30-60 km/h
    
    // Simulate GPS locking
    setTimeout(() => {
      this.gpsLocked = true;
      this.notifyGPSUpdate();
    }, 2000);

    // Sensor updates every 100ms
    this.intervalId = window.setInterval(() => {
      const sensorData = this.generateSensorData();
      this.notifySensorUpdate(sensorData);

      // Simulate pothole detection based on sensitivity
      const detectionThreshold = sensitivity === 'high' ? 0.05 : sensitivity === 'medium' ? 0.03 : 0.02;
      if (Math.random() < detectionThreshold && this.gpsLocked && this.currentSpeed > 10) {
        this.simulatePotholeDetection();
      }
    }, 100);

    // GPS updates every 1s
    this.gpsIntervalId = window.setInterval(() => {
      this.updateGPSPosition();
      this.notifyGPSUpdate();
    }, 1000);
  }

  stopDetection() {
    this.isActive = false;
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.gpsIntervalId) clearInterval(this.gpsIntervalId);
    this.intervalId = null;
    this.gpsIntervalId = null;
    this.currentSpeed = 0;
  }

  private generateSensorData(): SensorData {
    // Generate realistic accelerometer data
    const baseMagnitude = 9.8 + (Math.random() - 0.5) * 2;
    const vibrationMagnitude = baseMagnitude - 9.8;
    
    let vibrationLevel: 'Low' | 'Medium' | 'High';
    if (Math.abs(vibrationMagnitude) < 0.5) vibrationLevel = 'Low';
    else if (Math.abs(vibrationMagnitude) < 1.0) vibrationLevel = 'Medium';
    else vibrationLevel = 'High';

    return {
      accelerometerMagnitude: baseMagnitude,
      vibrationLevel,
      gyroscopeX: (Math.random() - 0.5) * 0.1,
      gyroscopeY: (Math.random() - 0.5) * 0.1,
      gyroscopeZ: (Math.random() - 0.5) * 0.1,
    };
  }

  private updateGPSPosition() {
    if (!this.gpsLocked) return;
    
    // Simulate movement (approximately moving north-east)
    this.currentLat += (Math.random() - 0.4) * 0.0001;
    this.currentLng += (Math.random() - 0.4) * 0.0001;
    this.currentSpeed = 30 + Math.random() * 30; // Vary speed
  }

  private simulatePotholeDetection() {
    // Determine severity based on simulated impact
    const impactMagnitude = 12 + Math.random() * 8; // 12-20 m/s²
    let severity: SeverityLevel;
    
    if (impactMagnitude < 14) severity = 'low';
    else if (impactMagnitude < 17) severity = 'medium';
    else severity = 'high';

    const detection: PotholeDetection = {
      id: `detection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      latitude: this.currentLat,
      longitude: this.currentLng,
      severity,
      timestamp: Date.now(),
      synced: navigator.onLine,
      confirmationCount: Math.floor(Math.random() * 5) + 1,
      vibrationMagnitude: impactMagnitude,
      speed: this.currentSpeed,
      roadType: this.getRandomRoadType(),
    };

    this.notifyDetection(detection);
  }

  private getRandomRoadType(): string {
    const types = ['Highway', 'Main Road', 'Side Street', 'Residential'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getCurrentGPSStatus(): GPSStatus {
    if (!this.isActive) {
      return {
        status: 'unavailable',
        latitude: null,
        longitude: null,
        speed: 0,
      };
    }

    return {
      status: this.gpsLocked ? 'locked' : 'searching',
      latitude: this.gpsLocked ? this.currentLat : null,
      longitude: this.gpsLocked ? this.currentLng : null,
      speed: this.currentSpeed,
    };
  }

  onDetection(callback: (detection: PotholeDetection) => void) {
    this.detectionCallbacks.push(callback);
    return () => {
      this.detectionCallbacks = this.detectionCallbacks.filter(cb => cb !== callback);
    };
  }

  onSensorUpdate(callback: (data: SensorData) => void) {
    this.sensorUpdateCallbacks.push(callback);
    return () => {
      this.sensorUpdateCallbacks = this.sensorUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  onGPSUpdate(callback: (status: GPSStatus) => void) {
    this.gpsUpdateCallbacks.push(callback);
    return () => {
      this.gpsUpdateCallbacks = this.gpsUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyDetection(detection: PotholeDetection) {
    this.detectionCallbacks.forEach(cb => cb(detection));
  }

  private notifySensorUpdate(data: SensorData) {
    this.sensorUpdateCallbacks.forEach(cb => cb(data));
  }

  private notifyGPSUpdate() {
    const status = this.getCurrentGPSStatus();
    this.gpsUpdateCallbacks.forEach(cb => cb(status));
  }

  isDetectionActive(): boolean {
    return this.isActive;
  }
}

export const sensorService = new SensorService();
