import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';


export default function ReportPreview() {
  const router = useRouter();
  const { data } = useLocalSearchParams();

  // data comes as string → parse it
  const reportData = JSON.parse(data);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'medium':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'low':
        return { bg: '#DCFCE7', text: '#15803D' };
      default:
        return { bg: '#E5E7EB', text: '#374151' };
    }
  };

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString();
  };

  const severityStyle = getSeverityColor(reportData.severity);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Preview</Text>

      <View
        style={[
          styles.card,
          {
            borderColor: severityStyle.text,
            backgroundColor: severityStyle.bg,
          },
        ]}
      >
        <Text>Latitude: {reportData.latitude.toFixed(6)}</Text>
        <Text>Longitude: {reportData.longitude.toFixed(6)}</Text>
        <Text>Severity: {reportData.severity}</Text>
        <Text>Detections: {reportData.totalDetections}</Text>
        <Text>Timestamp: {formatTimestamp(reportData.timestamp)}</Text>
      </View>

      <Pressable
        style={[styles.btn, { backgroundColor: '#2563EB' }]}
        onPress={() => {
          console.log('Submitting report:', reportData);
          router.back(); // go back to Home
        }}
      >
        <Text style={styles.btnText}>Submit Complaint</Text>
      </Pressable>

      <Pressable
        style={[styles.btn, { backgroundColor: '#E5E7EB' }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.btnText, { color: '#374151' }]}>Cancel</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
  },
  btn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
