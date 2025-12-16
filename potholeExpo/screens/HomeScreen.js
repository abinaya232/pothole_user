import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import Svg, { Polyline, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

/* ===== CONSTANTS ===== */
const POTHOLE_THRESHOLD = 6.2;
const MIN_SPEED = 8;
const COOLDOWN_MS = 2000;
const PEAK_DELTA = 2.0;
const GRAVITY = 9.8;

export default function HomeScreen() {
  const router = useRouter();

  const [isDetecting, setIsDetecting] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [detections, setDetections] = useState([]);
  const [accelData, setAccelData] = useState([]);
  const [popup, setPopup] = useState(null);

  const locationSub = useRef(null);
  const accelSub = useRef(null);

  const speedRef = useRef(0);
  const lastDetectionRef = useRef(0);
  const prevZRef = useRef(0);

  const currentLocationRef = useRef({ latitude: 0, longitude: 0 });

  /* ===== CLEANUP ===== */
  useEffect(() => {
    return () => {
      locationSub.current?.remove();
      accelSub.current?.remove();
    };
  }, []);

  /* ===== START DETECTION ===== */
  const startDetection = async () => {
    setIsDetecting(true);
    setDetections([]);
    setAccelData([]);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Location permission denied');
      return;
    }

    // Get current location immediately
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    const sp = loc.coords.speed ? loc.coords.speed * 3.6 : 0;
    setSpeed(sp);
    speedRef.current = sp;

    currentLocationRef.current = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    // Watch location updates
    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 500,
        distanceInterval: 1,
      },
      (loc) => {
        const sp = loc.coords.speed ? loc.coords.speed * 3.6 : 0;
        setSpeed(sp);
        speedRef.current = sp;

        currentLocationRef.current = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }
    );

    // Accelerometer
    Accelerometer.setUpdateInterval(100);
accelSub.current = Accelerometer.addListener(({ z }) => {
  const zCorrected = Math.abs(z - GRAVITY);

  // Update accelerometer graph (last 50 points)
  setAccelData(prev => [...prev.slice(-49), { zAxis: zCorrected }]);

  const now = Date.now();

  const prevZ = prevZRef.current;
const delta = zCorrected - prevZ;

// impact detection threshold (deep pothole only)
if (zCorrected > POTHOLE_THRESHOLD && delta > PEAK_DELTA) {

  let severity = 'low';

  if (zCorrected > 7.5) severity = 'high';
  else if (zCorrected > 6.5) severity = 'medium';
  else severity = 'low';

  const detection = {
    latitude: currentLocationRef.current.latitude,
    longitude: currentLocationRef.current.longitude,
    speed: speedRef.current,
    zAxis: zCorrected,
    timestamp: now,
    severity,
  };

  setDetections(prev => [...prev, detection]);
  setPopup(severity);
  lastDetectionRef.current = now;

  setTimeout(() => setPopup(null), 2000);
}


prevZRef.current = zCorrected;

  
});

  };

  /* ===== STOP DETECTION ===== */
  const stopDetection = () => {
    setIsDetecting(false);
    setSpeed(0);

    locationSub.current?.remove();
    accelSub.current?.remove();

    const lastDetection = detections[detections.length - 1] || {
      severity: 'low',
      latitude: currentLocationRef.current.latitude,
      longitude: currentLocationRef.current.longitude,
      timestamp: Date.now(),
    };

    router.push({
      pathname: '/report',
      params: {
        data: JSON.stringify({
          latitude: lastDetection.latitude,
          longitude: lastDetection.longitude,
          totalDetections: detections.length,
          severity: lastDetection.severity,
          timestamp: lastDetection.timestamp,
        }),
      },
    });
  };

  /* ===== ACCELEROMETER GRAPH ===== */
  const AccelerometerGraph = ({ data }) => {
    const maxZ = Math.max(...data.map(d => d.zAxis), 8);
    const points =
      data.length > 1
        ? data.map((d, i) => {
            const x = (i / (data.length - 1)) * (width - 40);
            const y = 120 - (d.zAxis / maxZ) * 120;
            return `${x},${y}`;
          }).join(' ')
        : '';

    return (
      <View style={styles.graphBox}>
        <Svg width="100%" height={140}>
          {[0.25, 0.5, 0.75].map((fraction, idx) => (
            <Line
              key={idx}
              x1="0"
              y1={140 * fraction}
              x2={width - 40}
              y2={140 * fraction}
              stroke="#E5E7EB"
              strokeDasharray="4 4"
            />
          ))}
          <Line
            x1="0"
            y1="70"
            x2={width - 40}
            y2="70"
            stroke="#9CA3AF"
            strokeDasharray="4 4"
          />
          <Polyline
            points={points}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth={2.5}
          />
        </Svg>
        <Text style={styles.graphLabel}>Z-Axis Acceleration (ΔG)</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {popup && (
        <View style={[styles.popup, styles[popup]]}>
          <Ionicons name="alert-circle" size={22} color="#fff" />
          <Text style={styles.popupText}>
            Pothole Detected • {popup.toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Pothole Detection</Text>
        <Text style={styles.subtitle}>Automatic road damage detection</Text>
      </View>

      {!isDetecting ? (
        <View style={styles.startScreen}>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>GPS</Text>
            <Ionicons name="locate" size={18} color="#10B981" />

          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>Sensors</Text>
            <Ionicons name="pulse" size={18} color="#10B981" />
          </View>
          <Pressable style={styles.startBtn} onPress={startDetection}>
            <Ionicons name="pulse" size={72} color="#fff" />
            <Text style={styles.startText}>Start Detection</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.live}>
          {/* Speed */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="speedometer" size={20} color="#2563EB" />
              <Text style={styles.cardTitle}>Current Speed</Text>
            </View>
            <Text style={styles.value}>{speed.toFixed(1)} km/h</Text>
          </View>

          {/* Current Location */}
          <View style={styles.locationCard}>
            <Text style={styles.locationLabel}>Current Location</Text>
            <Text style={styles.locationValue}>
              Lat: {currentLocationRef.current.latitude.toFixed(6)} | Lon: {currentLocationRef.current.longitude.toFixed(6)}
            </Text>
          </View>

          {/* Accelerometer */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="pulse" size={20} color="#7C3AED" />
              <Text style={styles.cardTitle}>Accelerometer</Text>
            </View>
            <AccelerometerGraph data={accelData} />
          </View>

          {/* Potholes */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="alert-circle" size={20} color="#F97316" />
              <Text style={styles.cardTitle}>Total Potholes Detected</Text>
            </View>
            <Text style={styles.count}>{detections.length}</Text>
          </View>

          <Pressable style={styles.stopBtn} onPress={stopDetection}>
            <Text style={styles.stopText}>Stop Detection</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#6B7280', marginTop: 4 },
  startScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  statusRow: { width: 240, backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', elevation: 2 },
  statusText: { color: '#374151', fontWeight: '500' },
  startBtn: { marginTop: 30, width: 260, height: 260, borderRadius: 130, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  startText: { color: '#fff', fontSize: 20, marginTop: 12 },
  live: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: '#374151', fontWeight: '600' },
  value: { fontSize: 34, color: '#2563EB', marginTop: 8 },
  count: { fontSize: 42, color: '#F97316', textAlign: 'center', marginTop: 8 },
  locationCard: { backgroundColor: '#EFF6FF', borderRadius: 14, padding: 16, marginBottom: 16 },
  locationLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  locationValue: { fontSize: 16, fontWeight: '600', color: '#1E40AF' },
  stopBtn: { height: 70, backgroundColor: '#DC2626', borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  stopText: { color: '#fff', fontSize: 22, fontWeight: '600' },
  popup: { position: 'absolute', top: 50, left: 20, right: 20, padding: 16, borderRadius: 14, flexDirection: 'row', gap: 10, alignItems: 'center', zIndex: 10 },
  popupText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  high: { backgroundColor: '#DC2626' },
  medium: { backgroundColor: '#F59E0B' },
  low: { backgroundColor: '#16A34A' },
  graphBox: { marginTop: 10, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  graphLabel: { marginTop: 6, fontSize: 12, color: '#6B7280', textAlign: 'right' },
});
