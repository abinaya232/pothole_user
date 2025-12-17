import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ReportPreview() {
  const router = useRouter();
  const { data } = useLocalSearchParams();

  if (!data) return <Text>Loading...</Text>;

  const parsed = JSON.parse(data);

  const {
    potholes = [],
    patchyRoads = [],
    totalPotholes = 0,
    totalPatchy = 0,
  } = parsed;

  const primaryEvent =
    potholes.length > 0
      ? potholes[potholes.length - 1]
      : patchyRoads[patchyRoads.length - 1];

  if (!primaryEvent) {
    return (
      <View style={styles.center}>
        <Text>No detection data available</Text>
      </View>
    );
  }

  const getSeverityStyle = (severity) => {
    if (severity === 'high')
      return { bg: '#FEE2E2', text: '#B91C1C' };
    if (severity === 'medium')
      return { bg: '#FEF3C7', text: '#B45309' };
    return { bg: '#DCFCE7', text: '#15803D' };
  };

  const severityStyle =
    potholes.length > 0
      ? getSeverityStyle(primaryEvent.severity)
      : { bg: '#E0F2FE', text: '#0369A1' };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Road Condition Report</Text>
        <Text style={styles.subtitle}>
          Auto-generated using sensor data
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SUMMARY */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            🚧 Potholes detected: {totalPotholes}
          </Text>
          <Text style={styles.summaryText}>
            🛣 Patchy roads: {totalPatchy > 0 ? totalPatchy : 'None detected'}
          </Text>
        </View>

        {/* LAT */}
        <InfoCard
          icon="location-outline"
          label="Latitude"
          value={primaryEvent.latitude.toFixed(6)}
        />

        {/* LON */}
        <InfoCard
          icon="location-outline"
          label="Longitude"
          value={primaryEvent.longitude.toFixed(6)}
        />

        {/* CONDITION */}
        <View style={styles.card}>
          <Text style={styles.label}>Road Condition</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: severityStyle.bg },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: severityStyle.text },
              ]}
            >
              {potholes.length > 0
                ? `POTHOLE • ${primaryEvent.severity.toUpperCase()}`
                : 'PATCHY ROAD'}
            </Text>
          </View>
        </View>

        {/* TIME */}
        <InfoCard
          icon="time-outline"
          label="Detected At"
          value={new Date(
            primaryEvent.timestamp ||
              primaryEvent.endTime
          ).toLocaleString()}
        />

        {/* NOTE */}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            This report is generated automatically using
            accelerometer and GPS anomalies.
          </Text>
        </View>
      </ScrollView>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <Pressable
          style={styles.submit}
          onPress={() => router.push('/success')}
        >
          <Text style={styles.submitText}>Submit Complaint</Text>
        </Pressable>

        <Pressable
          style={styles.cancel}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ===== SMALL COMPONENT ===== */
const InfoCard = ({ icon, label, value }) => (
  <View style={styles.card}>
    <Ionicons name={icon} size={22} color="#2563EB" />
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

/* ===== STYLES ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#6B7280', marginTop: 4 },

  content: { padding: 16 },

  summary: {
    backgroundColor: '#DBEAFE',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryText: {
    color: '#1E40AF',
    fontSize: 15,
    marginBottom: 4,
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  label: { color: '#6B7280', fontSize: 13 },
  value: { fontSize: 16, fontWeight: '600', marginTop: 4 },

  badge: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  badgeText: { fontWeight: '700' },

  note: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
  },
  noteText: { color: '#6B7280', textAlign: 'center' },

  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  submit: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitText: { color: '#fff', fontWeight: '600' },
  cancel: {
    backgroundColor: '#E5E7EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: { fontWeight: '600' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
