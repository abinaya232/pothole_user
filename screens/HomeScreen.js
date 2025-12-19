import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import Svg, { Polyline, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import * as Device from 'expo-device';

const { width, height } = Dimensions.get('window');

/* ===== ADMIN CONFIG & HEADERS ===== */
const API_HEADERS = {
  'Content-Type': 'application/json',
  'X-Device-Platform': Device.osName || 'Smartphone',
  'X-App-Version': '1.0.0',
};

/* ===== INDIAN ROAD CONSTANTS ===== */
// POTHOLES - Refined for sharp hits only
const MIN_SPEED = 15;        
const PEAK_DELTA = 4.0;      
const Z_MIN_THRESHOLD = 7.0; 
const COOLDOWN_MS = 3000;    

// PATCHY - Unchanged as per your request
const SPEED_NOISE = 3; 
const PATCHY_MIN = 1.5; 
const PATCHY_MAX = 6.5; 
const PATCHY_DURATION = 3500; 
const GRAVITY = 9.8;

export default function HomeScreen() {
  const router = useRouter();

  const [isDetecting, setIsDetecting] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [detections, setDetections] = useState([]);
  const [patchyEvents, setPatchyEvents] = useState([]);
  const [accelData, setAccelData] = useState(new Array(50).fill({ zAxis: 0 }));
  const [popup, setPopup] = useState(null);

  const locationSub = useRef(null);
  const accelSub = useRef(null);
  const speedRef = useRef(0);
  const prevZRef = useRef(0);
  const lastDetectionRef = useRef(0);
  const patchyStartRef = useRef(null);
  const patchyAlertRef = useRef(false);
  const lastPatchyVibrationRef = useRef(0);
  const currentLocationRef = useRef({ latitude: 0, longitude: 0 });

  useEffect(() => {
    return () => {
      locationSub.current?.remove();
      accelSub.current?.remove();
    };
  }, []);

  const startDetection = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied', 'Location access is required.');

    setIsDetecting(true);
    setDetections([]);
    setPatchyEvents([]);
    setAccelData(new Array(50).fill({ zAxis: 0 }));

    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 1 },
      (loc) => {
        let sp = loc.coords.speed ? loc.coords.speed * 3.6 : 0;
        if (sp < SPEED_NOISE) sp = 0;
        setSpeed(sp);
        speedRef.current = sp;
        currentLocationRef.current = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      }
    );

    Accelerometer.setUpdateInterval(100);
    accelSub.current = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const zCorrected = Math.abs(magnitude - 1.0) * GRAVITY;
      const now = Date.now();
      const delta = Math.abs(zCorrected - prevZRef.current);

      // --- 1. PATCHY LOGIC (EXISTING - NO CHANGES) ---
      if (speedRef.current >= MIN_SPEED && zCorrected >= PATCHY_MIN && zCorrected < PATCHY_MAX) {
        lastPatchyVibrationRef.current = now;
        if (!patchyStartRef.current) patchyStartRef.current = now;
        if (now - patchyStartRef.current >= PATCHY_DURATION && !patchyAlertRef.current) {
          setPatchyEvents(p => [...p, { lat: currentLocationRef.current.latitude, lon: currentLocationRef.current.longitude, start: patchyStartRef.current, end: now }]);
          setPopup('low');
          patchyAlertRef.current = true;
          setTimeout(() => setPopup(null), 3000);
        }
      } else if (now - lastPatchyVibrationRef.current > 800) {
        patchyStartRef.current = null;
        patchyAlertRef.current = false;
      }

      // --- 2. POTHOLE LOGIC (REFINED SENSITIVITY) ---
      if (
        speedRef.current >= MIN_SPEED && 
        delta > PEAK_DELTA && 
        zCorrected >= Z_MIN_THRESHOLD && 
        now - lastDetectionRef.current > COOLDOWN_MS
      ) {
        let severity = zCorrected >= 9.0 ? 'High' : 'Medium';
        setDetections(prev => [...prev, { lat: currentLocationRef.current.latitude, lon: currentLocationRef.current.longitude, z: zCorrected, time: now, sev: severity }]);
        setPopup(severity.toLowerCase());
        lastDetectionRef.current = now;
        setTimeout(() => setPopup(null), 2500);
      }

      prevZRef.current = zCorrected;
      setAccelData(prev => [...prev.slice(-49), { zAxis: zCorrected }]);
    });
  };

  const stopDetection = () => {
    setIsDetecting(false);
    locationSub.current?.remove();
    accelSub.current?.remove();

    if (detections.length === 0 && patchyEvents.length === 0) {
      Alert.alert('No Data', 'No road anomalies were detected.');
      return;
    }

    const reportId = `RD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substr(2,4).toUpperCase()}`;
    const deviceId = Device.modelName ? `${Device.modelName.replace(/\s+/g,'_')}_${Device.osInternalBuildId?.slice(-4)}` : "DEV_UNKNOWN";

    const finalReport = {
      "report_id": reportId,
      "device_id": deviceId,
      "reported_at": new Date().toISOString(),
      "anomalies": [
        ...detections.map(d => ({
          "location_id": `loc_${d.lat.toFixed(3)}_${d.lon.toFixed(3)}`,
          "type": "pothole",
          "severity": d.sev,
          "latitude": d.lat,
          "longitude": d.lon,
          "timestamp": new Date(d.time).toISOString()
        })),
        ...patchyEvents.map(p => ({
          "location_id": `loc_${p.lat.toFixed(3)}_${p.lon.toFixed(3)}`,
          "type": "road_anomaly",
          "severity": "Medium",
          "start_latitude": p.lat,
          "start_longitude": p.lon,
          "start_timestamp": new Date(p.start).toISOString(),
          "end_latitude": p.lat,
          "end_longitude": p.lon,
          "end_timestamp": new Date(p.end).toISOString(),
          "duration_seconds": Math.floor((p.end - p.start) / 1000)
        }))
      ]
    };

    router.push({
      pathname: '/report',
      params: { data: JSON.stringify(finalReport), headers: JSON.stringify(API_HEADERS) },
    });
  };

  const AccelerometerGraph = ({ data }) => {
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 64);
      const y = 100 - (Math.min(d.zAxis, 10) / 10) * 100;
      return `${x},${y}`;
    }).join(' ');
    return (
      <View style={styles.graphContainer}>
        <Svg width="100%" height="120">
          {[0, 25, 50, 75, 100].map((v) => (
            <Line key={v} x1="0" y1={v} x2={width} y2={v} stroke="#F3F4F6" strokeWidth="1" />
          ))}
          <Polyline points={points} fill="none" stroke="#6366F1" strokeWidth="3" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {popup && (
        <View style={[styles.popup, styles[popup]]}>
          <Ionicons name="warning" size={20} color="#fff" />
          <Text style={styles.popupText}>
            {popup === 'low' ? 'Patchy Road Detected' : `Pothole: ${popup.toUpperCase()}`}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.brand}>RoadInspector <Text style={styles.pro}>PRO</Text></Text>
        <Text style={styles.headerSub}>Intelligent Scanning Active</Text>
      </View>

      {!isDetecting ? (
        <View style={styles.startWrapper}>
          <View style={styles.heroCircle}><Ionicons name="shield-checkmark" size={width * 0.2} color="#6366F1" /></View>
          <Text style={styles.readyText}>System Ready</Text>
          <Text style={styles.readySub}>Sensors calibrated for Indian roads</Text>
          <Pressable style={styles.mainStartBtn} onPress={startDetection}>
            <Text style={styles.startBtnText}>Initialize Scanner</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.liveContent}>
          <View style={styles.row}>
            <View style={[styles.miniCard, { flex: 1.2 }]}>
              <Text style={styles.label}>Velocity</Text>
              <Text style={styles.val}>{speed.toFixed(0)} <Text style={styles.unit}>km/h</Text></Text>
            </View>
            <View style={[styles.miniCard, { flex: 2 }]}>
              <Text style={styles.label}>Location Accuracy</Text>
              <View style={styles.gpsRow}>
                <Ionicons name="radio-button-on" size={14} color="#10B981" />
                <Text style={styles.gpsStatus}>High Precision</Text>
              </View>
            </View>
          </View>

          <View style={styles.visualCard}>
            <Text style={styles.visualTitle}>Vibration Waveform</Text>
            <AccelerometerGraph data={accelData} />
          </View>

          <View style={styles.row}>
            <View style={styles.counterCard}>
              <Text style={styles.counterLabel}>Potholes</Text>
              <Text style={[styles.counterVal, { color: '#F59E0B' }]}>{detections.length}</Text>
            </View>
            <View style={styles.counterCard}>
              <Text style={styles.counterLabel}>Patchy</Text>
              <Text style={[styles.counterVal, { color: '#10B981' }]}>{patchyEvents.length}</Text>
            </View>
          </View>

          <View style={styles.locationStrip}>
            <Ionicons name="navigate-circle" size={18} color="#6366F1" />
            <Text style={styles.coordText} numberOfLines={1}>
              {currentLocationRef.current.latitude.toFixed(5)}, {currentLocationRef.current.longitude.toFixed(5)}
            </Text>
          </View>

          <Pressable style={styles.finishBtn} onPress={stopDetection}>
             <Ionicons name="stop-circle" size={24} color="#fff" />
             <Text style={styles.finishText}>Finalize Trip Report</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: width * 0.06, paddingTop: height * 0.07, paddingBottom: 20 },
  brand: { fontSize: width * 0.06, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  pro: { color: '#6366F1' },
  headerSub: { color: '#9CA3AF', fontSize: width * 0.035, fontWeight: '500' },
  startWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  heroCircle: { width: width * 0.4, height: width * 0.4, borderRadius: width * 0.2, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  readyText: { fontSize: width * 0.055, fontWeight: '800', color: '#1F2937' },
  readySub: { fontSize: width * 0.035, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 40 },
  mainStartBtn: { backgroundColor: '#6366F1', flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 32, borderRadius: 20, alignItems: 'center', elevation: 8 },
  startBtnText: { color: '#fff', fontSize: width * 0.045, fontWeight: '700', marginRight: 10 },
  liveContent: { padding: width * 0.05 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  miniCard: { backgroundColor: '#F9FAFB', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#F3F4F6' },
  label: { fontSize: width * 0.028, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  val: { fontSize: width * 0.07, fontWeight: '800', color: '#111827', marginTop: 4 },
  unit: { fontSize: 14, color: '#9CA3AF' },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  gpsStatus: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  visualCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6', elevation: 2 },
  visualTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 15 },
  graphContainer: { height: 120, width: '100%', overflow: 'hidden' },
  counterCard: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 20, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  counterLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  counterVal: { fontSize: width * 0.08, fontWeight: '900', marginTop: 4 },
  locationStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3FF', padding: 12, borderRadius: 14, gap: 8, marginBottom: 24 },
  coordText: { fontSize: 13, color: '#6366F1', fontWeight: '600', fontFamily: 'monospace' },
  finishBtn: { backgroundColor: '#111827', flexDirection: 'row', height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 10 },
  finishText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  popup: { position: 'absolute', top: height * 0.06, left: 20, right: 20, padding: 16, borderRadius: 16, flexDirection: 'row', gap: 12, alignItems: 'center', zIndex: 100, elevation: 10 },
  popupText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  high: { backgroundColor: '#EF4444' },
  medium: { backgroundColor: '#F59E0B' },
  low: { backgroundColor: '#10B981' },
});