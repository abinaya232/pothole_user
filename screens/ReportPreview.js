import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ReportPreview() {
  const router = useRouter();
  const { data, headers } = useLocalSearchParams();

  if (!data) return (
    <View style={styles.center}><Text style={styles.loadingText}>Compiling Data...</Text></View>
  );

  const parsed = JSON.parse(data);
  const anomalies = parsed.anomalies || [];
  const potholes = anomalies.filter(a => a.type === "pothole");
  const patchyRoads = anomalies.filter(a => a.type === "road_anomaly");

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      default: return '#10B981';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Trip Analysis</Text>
          <View style={styles.statusBadge}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>READY</Text>
          </View>
        </View>
        
        {/* TICKET ID (Unique for the Trip) */}
        {/* <Text style={styles.subtitle}>Ticket: {parsed.report_id}</Text> */}
        
        {/* DEVICE ID (The Phone Name - Added this line) */}
        <Text style={styles.deviceSubtitle}>Device: {parsed.device_id?.replace(/_/g, ' ')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderLeftColor: '#F59E0B' }]}>
            <Text style={styles.statLabel}>POTHOLES</Text>
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>{potholes.length}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: '#6366F1' }]}>
            <Text style={styles.statLabel}>PATCHY</Text>
            <Text style={[styles.statVal, { color: '#6366F1' }]}>{patchyRoads.length}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Detailed Log</Text>
        
        {anomalies.map((item, index) => (
          <View key={index} style={styles.incidentCard}>
            <View style={[styles.severitySide, { backgroundColor: item.type === 'pothole' ? getSeverityColor(item.severity) : '#6366F1' }]} />
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>{item.type.replace('_', ' ').toUpperCase()}</Text>
                <Text style={[styles.cardSeverity, { color: item.type === 'pothole' ? getSeverityColor(item.severity) : '#6366F1' }]}>
                  {item.severity?.toUpperCase() || 'ROUGH'}
                </Text>
              </View>
              <Text style={styles.cardMeta}>
                <Ionicons name="location" size={12} color="#9CA3AF" /> {item.location_id}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.mainAction} onPress={() => router.push({ pathname: '/success', params: { data } })}>
          <Text style={styles.mainActionText}>Submit to Authority</Text>
          <Ionicons name="cloud-upload" size={20} color="#fff" />
        </Pressable>
        <Pressable style={styles.secAction} onPress={() => router.back()}>
          <Text style={styles.secActionText}>Discard & Exit</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: height * 0.07, paddingHorizontal: width * 0.06, paddingBottom: 20, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: width * 0.065, fontWeight: '900', color: '#111827' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6366F1', marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#6366F1' },
  subtitle: { color: '#9CA3AF', fontSize: 13, marginTop: 4, fontWeight: '600' },
  
  // New style for the Device ID display
  deviceSubtitle: { color: '#6366F1', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },

  content: { padding: width * 0.06 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  statBox: { flex: 1, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 20, borderLeftWidth: 4 },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF' },
  statVal: { fontSize: width * 0.07, fontWeight: '900', marginTop: 4 },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 16 },
  incidentCard: { backgroundColor: '#FFFFFF', borderRadius: 16, flexDirection: 'row', marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  severitySide: { width: 5 },
  cardInfo: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType: { fontSize: 11, fontWeight: '800', color: '#9CA3AF' },
  cardSeverity: { fontSize: 11, fontWeight: '900' },
  cardMeta: { fontSize: 12, color: '#4B5563', marginTop: 6 },
  footer: { padding: width * 0.06, borderTopWidth: 1, borderColor: '#F3F4F6' },
  mainAction: { backgroundColor: '#111827', flexDirection: 'row', height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 12 },
  mainActionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secAction: { paddingVertical: 16, alignItems: 'center' },
  secActionText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
});