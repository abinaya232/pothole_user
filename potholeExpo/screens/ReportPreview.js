// screens/ReportPreview.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ReportPreview({ data }) {
  const router = useRouter();

  if (!data) return <Text>Loading...</Text>; // safety check

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
      case 'medium': return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'low': return { bg: '#DCFCE7', text: '#15803D', border: '#A7F3D0' };
      default: return { bg: '#E5E7EB', text: '#374151', border: '#D1D5DB' };
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const severityStyle = getSeverityColor(data.severity);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Report Preview</Text>
        <Text style={styles.subtitle}>Review detected data before submission</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info */}
        {data.totalDetections > 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {data.totalDetections} pothole event{data.totalDetections !== 1 ? 's' : ''} detected during your ride
            </Text>
          </View>
        )}

        {/* Latitude */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="location-outline" size={24} color="#3B82F6" style={styles.iconBox} />
            <View style={styles.cardContent}>
              <Text style={styles.label}>Latitude</Text>
              <Text style={styles.value}>{data.latitude.toFixed(6)}</Text>
            </View>
          </View>
        </View>

        {/* Longitude */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="location-outline" size={24} color="#3B82F6" style={styles.iconBox} />
            <View style={styles.cardContent}>
              <Text style={styles.label}>Longitude</Text>
              <Text style={styles.value}>{data.longitude.toFixed(6)}</Text>
            </View>
          </View>
        </View>

        {/* Severity */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="alert-circle-outline" size={24} color="#EA580C" style={styles.iconBox} />
            <View style={styles.cardContent}>
              <Text style={styles.label}>Severity</Text>
              <View style={[styles.severityBox, { backgroundColor: severityStyle.bg, borderColor: severityStyle.border }]}>
                <Text style={{ color: severityStyle.text, fontWeight: '600' }}>{data.severity}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timestamp */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="time-outline" size={24} color="#7C3AED" style={styles.iconBox} />
            <View style={styles.cardContent}>
              <Text style={styles.label}>Timestamp</Text>
              <Text style={styles.value}>{formatTimestamp(data.timestamp)}</Text>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>All values are auto-filled and read-only</Text>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        {/* Navigate to Success screen */}
        <Pressable
          style={styles.submitBtn}
          onPress={() => router.push('/success')} // <--- navigate to Success screen
        >
          <Text style={styles.submitText}>Submit Complaint</Text>
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Keep your existing styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#fff', paddingVertical: 20, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#6B7280' },
  content: { padding: 16 },
  infoBox: { backgroundColor: '#DBEAFE', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center' },
  infoText: { color: '#1E40AF', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, marginBottom: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 32, height: 32 },
  cardContent: { flex: 1 },
  label: { color: '#6B7280', fontSize: 14, marginBottom: 4 },
  value: { color: '#111827', fontSize: 16 },
  severityBox: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  noteBox: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  noteText: { color: '#6B7280', fontSize: 14 },
  actions: { padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  submitBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelBtn: { backgroundColor: '#E5E7EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  cancelText: { color: '#374151', fontWeight: '600', fontSize: 16 },
});
