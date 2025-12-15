import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import Svg, { Polyline, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';


export default function HomeScreen() {
  const router = useRouter();

  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [sensorActive, setSensorActive] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [detections, setDetections] = useState([]);
  const [accelData, setAccelData] = useState([]);
  const [popup, setPopup] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [accelSubscription, setAccelSubscription] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    return () => {
      locationSubscription && locationSubscription.remove();
      accelSubscription && accelSubscription.remove();
    };
  }, [locationSubscription, accelSubscription]);

  const startDetection = async () => {
    setIsDetecting(true);
    setSensorActive(true);
    setDetections([]);
    setAccelData([]);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Location permission denied');
      return;
    }

    // GPS subscription
    const locSub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 1, timeInterval: 500 },
      (loc) => {
        setGpsActive(true);
        setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        const s = loc.coords.speed != null ? loc.coords.speed * 3.6 : 0;
        setSpeed(s);
      }
    );
    setLocationSubscription(locSub);

    // Accelerometer subscription
    const accelSub = Accelerometer.addListener(({ x, y, z }) => {
      setAccelData((prev) => [...prev.slice(-49), { zAxis: z }]);

      if (z > 14) {
        const severity = z > 18 ? 'high' : z > 15 ? 'medium' : 'low';
        setDetections((prev) => [...prev, severity]);
        setPopup(severity);
        setTimeout(() => setPopup(null), 2500);
      }
    });
    Accelerometer.setUpdateInterval(200);
    setAccelSubscription(accelSub);
  };

  const stopDetection = () => {
  setIsDetecting(false);
  setGpsActive(false);
  setSensorActive(false);
  setSpeed(0);

  locationSubscription && locationSubscription.remove();
  accelSubscription && accelSubscription.remove();

  setLocationSubscription(null);
  setAccelSubscription(null);

  const reportData = {
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    severity:
      detections.length > 0
        ? detections[detections.length - 1]
        : 'low',
    timestamp: Date.now(),
    totalDetections: detections.length,
  };

  router.push({
    pathname: '/report',
    params: {
      data: JSON.stringify(reportData),
    },
  });
};



  const AccelerometerGraph = ({ data }) => {
    const points =
      data.length > 1
        ? data
            .map((d, i) => {
              const x = (i / (data.length - 1)) * 300;
              const y = 120 - ((d.zAxis - 5) / 20) * 120;
              return `${x},${y}`;
            })
            .join(' ')
        : '';

    return (
      <View style={styles.graphContainer}>
        <Svg width="100%" height="120">
          <Line x1="0" y1="60" x2="300" y2="60" stroke="#9CA3AF" strokeDasharray="4 4" />
          <Polyline points={points} fill="none" stroke="#8B5CF6" strokeWidth="2" />
        </Svg>
        <Text style={styles.graphLabel}>Baseline: 9.8 m/s²</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {popup && (
        <View style={[styles.popup, styles[popup]]}>
          <Ionicons name="alert-circle" size={24} color="#fff" />
          <Text style={styles.popupText}>Pothole Detected ({popup})</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Pothole Detection</Text>
        <Text style={styles.subtitle}>Automatic road damage detection</Text>
      </View>

      {!isDetecting ? (
        <View style={styles.center}>
          <Pressable style={styles.startBtn} onPress={startDetection}>
            <Ionicons name="pulse" size={60} color="#fff" />
            <Text style={styles.startText}>Start Detection</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.live}>
          {/* Status */}
          <View style={styles.statusContainer}>
            <View style={styles.statusCard}>
              <Ionicons name="navigate" size={20} color={gpsActive ? '#16A34A' : '#9CA3AF'} />
              <Text style={[styles.statusText, { color: gpsActive ? '#16A34A' : '#9CA3AF' }]}>
                GPS {gpsActive ? 'Active' : 'Searching'}
              </Text>
            </View>
            <View style={styles.statusCard}>
              <Ionicons name="pulse" size={20} color={sensorActive ? '#16A34A' : '#9CA3AF'} />
              <Text style={[styles.statusText, { color: sensorActive ? '#16A34A' : '#9CA3AF' }]}>
                Sensors {sensorActive ? 'Running' : 'Idle'}
              </Text>
            </View>
          </View>

          {/* Speed */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="speedometer" size={20} color="#2563EB" />
              <Text style={styles.cardTitle}>Current Speed</Text>
            </View>
            <Text style={styles.speed}>{speed.toFixed(1)} km/h</Text>
          </View>

          {/* Accelerometer Graph */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pulse" size={20} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Z-Axis Accelerometer</Text>
            </View>
            <AccelerometerGraph data={accelData} />
          </View>

          {/* Pothole Count */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="alert-circle" size={20} color="#F97316" />
              <Text style={styles.cardTitle}>Total Potholes Detected</Text>
            </View>
            <Text style={styles.count}>{detections.length}</Text>
          </View>

          {/* Stop Button */}
          <Pressable style={styles.stopBtn} onPress={stopDetection}>
            <Text style={styles.stopText}>Stop Detection</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#6B7280' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  startBtn: { width: 240, height: 240, borderRadius: 120, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  startText: { color: '#fff', fontSize: 18, marginTop: 10 },
  live: { padding: 20 },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  statusText: { fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { color: '#6B7280', fontWeight: '600' },
  speed: { fontSize: 32, color: '#2563EB' },
  count: { fontSize: 36, color: '#F97316' },
  stopBtn: { height: 70, backgroundColor: '#DC2626', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  stopText: { color: '#fff', fontSize: 22 },
  popup: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10, padding: 16, borderRadius: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  popupText: { color: '#fff', fontSize: 16 },
  high: { backgroundColor: '#DC2626' },
  medium: { backgroundColor: '#F59E0B' },
  low: { backgroundColor: '#16A34A' },
  graphContainer: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10 },
  graphLabel: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'right' },
});
