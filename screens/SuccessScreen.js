import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

export default function SuccessScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  
  // Extracting the Report ID from the data we sent to the Admin
  const parsedData = data ? JSON.parse(data) : null;
  const referenceId = parsedData?.report_id || `RD-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* CELEBRATION AREA */}
      <View style={styles.content}>
        <View style={styles.successIconOuter}>
          <View style={styles.successIconInner}>
            <Ionicons name="checkmark-sharp" size={width * 0.15} color="#10B981" />
          </View>
        </View>

        <Text style={styles.title}>Submission Successful</Text>
        <Text style={styles.subtitle}>
          Your road condition report has been uploaded to the Central Grievance Dashboard.
        </Text>

        {/* REFERENCE CARD */}
        <View style={styles.refCard}>
          <Text style={styles.refLabel}>REFERENCE ID</Text>
          <Text style={styles.refId}>{referenceId}</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Processing by Authority</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="time-outline" size={width * 0.045} color="#6B7280" />
          <Text style={styles.infoText}>Expected review time: 3-5 business days</Text>
        </View>
      </View>

      {/* FOOTER ACTION */}
      <View style={styles.footer}>
        <Pressable 
          style={styles.homeBtn} 
          onPress={() => router.replace('/')}
        >
          <Ionicons name="home-outline" size={width * 0.05} color="#fff" />
          <Text style={styles.homeBtnText}>Return to Dashboard</Text>
        </Pressable>
        
        <Text style={styles.thankYou}>Thank you for improving our roads.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: width * 0.08 
  },
  
  successIconOuter: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  successIconInner: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: (width * 0.25) / 2,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  title: { 
    fontSize: width * 0.065, 
    fontWeight: '900', 
    color: '#111827', 
    textAlign: 'center', 
    letterSpacing: -0.5 
  },
  subtitle: { 
    fontSize: width * 0.038, 
    color: '#6B7280', 
    textAlign: 'center', 
    marginTop: 12, 
    lineHeight: 22, 
    fontWeight: '500' 
  },

  refCard: {
    backgroundColor: '#F9FAFB',
    width: '100%',
    padding: width * 0.06,
    borderRadius: 24,
    marginTop: height * 0.05,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  refLabel: { 
    fontSize: width * 0.025, 
    fontWeight: '800', 
    color: '#9CA3AF', 
    letterSpacing: 1 
  },
  refId: { 
    fontSize: width * 0.06, 
    fontWeight: '900', 
    color: '#111827', 
    marginTop: 8, 
    letterSpacing: 1 
  },
  
  statusRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 12, 
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#F3F4F6' 
  },
  statusDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#6366F1', 
    marginRight: 8 
  },
  statusText: { 
    fontSize: width * 0.03, 
    fontWeight: '700', 
    color: '#6366F1' 
  },

  infoBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: height * 0.03, 
    gap: 8 
  },
  infoText: { 
    fontSize: width * 0.032, 
    color: '#9CA3AF', 
    fontWeight: '500' 
  },

  footer: { 
    paddingHorizontal: width * 0.08, 
    paddingBottom: height * 0.05 
  },
  homeBtn: { 
    backgroundColor: '#6366F1', 
    flexDirection: 'row', 
    height: 64, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12,
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  homeBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  thankYou: { 
    textAlign: 'center', 
    marginTop: 24, 
    fontSize: 10, 
    color: '#D1D5DB', 
    fontWeight: '600', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
});