// screens/SuccessScreen.js
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconWrapper}>
        <Ionicons name="checkmark-circle" size={80} color="white" />
      </View>

      <Text style={styles.title}>Complaint submitted successfully</Text>
      <Text style={styles.subtitle}>Report has been sent to the government dashboard</Text>

      {/* Back Button */}
      <Pressable 
        style={styles.button} 
        onPress={() => router.replace('/')} // Use replace to go home and remove this page from stack
      >
        <Ionicons name="home" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Back to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 24 },
  iconWrapper: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#065F46', marginBottom: 32 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
