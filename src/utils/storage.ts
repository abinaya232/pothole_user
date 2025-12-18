import { PotholeDetection, AppSettings } from '../types';

const STORAGE_KEYS = {
  DETECTIONS: 'pothole_detections',
  SETTINGS: 'app_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  sensitivity: 'medium',
  alertsEnabled: true,
  alertSound: true,
  alertVibration: true,
  dataUsage: 'wifi-and-mobile',
};

export const storage = {
  // Detections
  saveDetection(detection: PotholeDetection) {
    const detections = this.getAllDetections();
    detections.unshift(detection);
    localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify(detections));
  },

  getAllDetections(): PotholeDetection[] {
    const data = localStorage.getItem(STORAGE_KEYS.DETECTIONS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  updateDetectionSyncStatus(id: string, synced: boolean) {
    const detections = this.getAllDetections();
    const updated = detections.map(d => 
      d.id === id ? { ...d, synced } : d
    );
    localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify(updated));
  },

  clearAllDetections() {
    localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify([]));
  },

  // Settings
  getSettings(): AppSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Sync simulation
  async syncPendingDetections(): Promise<number> {
    const detections = this.getAllDetections();
    const unsynced = detections.filter(d => !d.synced);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mark all as synced if online
    if (navigator.onLine) {
      unsynced.forEach(d => {
        this.updateDetectionSyncStatus(d.id, true);
      });
      return unsynced.length;
    }
    
    return 0;
  },
};
