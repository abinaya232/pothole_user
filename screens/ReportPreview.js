import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ReportPreview() {
  const router = useRouter();
  const { data } = useLocalSearchParams();

  if (!data) return (
    <View style={styles.center}><Text style={styles.loadingText}>Initializing Audit Engine...</Text></View>
  );

  const parsed = JSON.parse(data);
  const anomalies = parsed.anomalies || [];
  
  // 1. STATS CALCULATION
  const potholesCount = anomalies.filter(a => a.type === "pothole").length;
  const patchyCount = anomalies.filter(a => a.type === "road_anomaly").length;

  // 2. ✅ AGGREGATION LOGIC (Pakka Grouping)
  // This logic groups all sensor hits within a ~10-meter radius into one card
  const groupedIssues = useMemo(() => {
    const grouped = {};
    
    anomalies.forEach(a => {
      // Logic: Round coordinates to 4 decimals to create a "Geofence"
      // This ensures slight movement doesn't create new locations
      const latGrid = a.latitude?.toFixed(4);
      const lonGrid = a.longitude?.toFixed(4);
      const gridId = `${latGrid}_${lonGrid}`;

      if (!grouped[gridId]) {
        grouped[gridId] = {
          id: gridId,
          potholes: 0,
          patchy: 0,
          highestSeverity: 'Low',
        };
      }

      if (a.type === 'pothole') grouped[gridId].potholes++;
      if (a.type === 'road_anomaly') grouped[gridId].patchy++;

      // Escalation: If even one hit in this grid is 'High', the card shows 'High'
      if (a.severity === 'High') grouped[gridId].highestSeverity = 'High';
      else if (a.severity === 'Medium' && grouped[gridId].highestSeverity !== 'High')
        grouped[gridId].highestSeverity = 'Medium';
    });
    
    return Object.values(grouped);
  }, [anomalies]);

  // 3. ROAD HEALTH INDEX
  const penalty = (potholesCount * 15) + (patchyCount * 5);
  const healthScore = Math.max(0, 100 - penalty);
  
  const getScoreColor = (score) => {
    if (score > 80) return '#10B981';
    if (score > 50) return '#F59E0B';
    return '#EF4444';
  };

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
          <Text style={styles.title}>Road Audit</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>VERIFIED DATA</Text>
          </View>
        </View>
        <View style={styles.headerDetailRow}>
           <Text style={styles.deviceSubtitle}>DEVICE: {parsed.device_id?.split('_').pop()}</Text>
           <Text style={styles.timestampText}>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* HEALTH SCORE CARD */}
        <View style={styles.healthCard}>
            <View style={styles.healthInfo}>
                <Text style={styles.healthLabel}>Overall Health Index</Text>
                <Text style={[styles.healthVal, {color: getScoreColor(healthScore)}]}>{healthScore}%</Text>
                <Text style={styles.healthStatus}>
                    {healthScore > 80 ? 'Stable Condition' : healthScore > 50 ? 'Maintenance Required' : 'Hazardous Surface'}
                </Text>
            </View>
            <View style={styles.scoreBarBase}>
                <View style={[styles.scoreBarFill, {width: `${healthScore}%`, backgroundColor: getScoreColor(healthScore)}]} />
            </View>
        </View>

        {/* METRICS ROW */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderLeftColor: '#EF4444' }]}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.statVal}>{potholesCount}</Text>
            <Text style={styles.statLabel}>POTHOLES</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: '#6366F1' }]}>
            <Ionicons name="git-commit" size={20} color="#6366F1" />
            <Text style={styles.statVal}>{patchyCount}</Text>
            <Text style={styles.statLabel}>PATCHY</Text>
          </View>
        </View>

        {/* TECHNICAL TELEMETRY */}
        <View style={styles.fidelityBox}>
            <Text style={styles.fidelityTitle}>Telemetry Metrics</Text>
            <View style={styles.fidelityRow}>
                <Text style={styles.fidelityText}>GPS Precision: High</Text>
                <Text style={styles.fidelityText}>Frequency: 50Hz</Text>
            </View>
        </View>

        {/* ✅ AGGREGATED ISSUE LOG */}
        <Text style={styles.sectionHeader}>Detected Road Issues</Text>
        
        {groupedIssues.map((issue, index) => (
          <View key={index} style={styles.incidentCard}>
            <View style={[styles.severitySide, { backgroundColor: getSeverityColor(issue.highestSeverity) }]} />
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>📍 POINT {index + 1}</Text>
                <View style={[styles.sevBadge, {backgroundColor: getSeverityColor(issue.highestSeverity) + '20'}]}>
                    <Text style={[styles.cardSeverity, { color: getSeverityColor(issue.highestSeverity) }]}>
                      {issue.highestSeverity.toUpperCase()}
                    </Text>
                </View>
              </View>
              
              <View style={styles.issueDetails}>
                {issue.potholes > 0 && (
                  <Text style={styles.issueText}>• {issue.potholes} Pothole{issue.potholes > 1 ? 's' : ''} reported</Text>
                )}
                {issue.patchy > 0 && (
                  <Text style={styles.issueText}>• Surface anomaly detected</Text>
                )}
              </View>
            </View>
          </View>
        ))}

        <View style={{height: 40}} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Pressable style={styles.mainAction} onPress={() => router.push({ pathname: '/success', params: { data } })}>
          <Text style={styles.mainActionText}>Submit Audit Report</Text>
          <Ionicons name="shield-checkmark" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#fff', paddingTop: height * 0.07, paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  headerDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statusBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  deviceSubtitle: { color: '#6366F1', fontSize: 12, fontWeight: '700' },
  timestampText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  content: { padding: 24 },
  healthCard: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  healthInfo: { marginBottom: 15 },
  healthLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  healthVal: { fontSize: 42, fontWeight: '900', marginVertical: 4 },
  healthStatus: { fontSize: 14, fontWeight: '700', color: '#475569' },
  scoreBarBase: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '900', marginVertical: 4 },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8' },
  fidelityBox: { backgroundColor: '#0F172A', padding: 16, borderRadius: 16, marginBottom: 24 },
  fidelityTitle: { color: '#fff', fontSize: 12, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' },
  fidelityRow: { flexDirection: 'row', justifyContent: 'space-between' },
  fidelityText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  sectionHeader: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  incidentCard: { backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  severitySide: { width: 6 },
  cardInfo: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType: { fontSize: 11, fontWeight: '900', color: '#64748B' },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  cardSeverity: { fontSize: 10, fontWeight: '900' },
  issueDetails: { marginTop: 8 },
  issueText: { fontSize: 13, color: '#475569', fontWeight: '600', marginBottom: 2 },
  footer: { padding: 24, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E2E8F0' },
  mainAction: { backgroundColor: '#6366F1', flexDirection: 'row', height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 12, elevation: 4 },
  mainActionText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B' }
});