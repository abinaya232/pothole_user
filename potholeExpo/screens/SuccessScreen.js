import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={42} color="#fff" />
        </View>
      </View>

      {/* Main Text */}
      <Text style={styles.title}>Complaint submitted successfully</Text>
      <Text style={styles.subtitle}>
        Report has been sent to the government dashboard
      </Text>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardText}>• Your report is anonymous and secure</Text>
        <Text style={styles.cardText}>
          • Authorities will review the data for road maintenance
        </Text>
        <Text style={styles.cardText}>
          • Thank you for helping improve road safety
        </Text>
      </View>

      {/* Button */}
      <Pressable style={styles.button} onPress={() => router.replace('/')}>
        <Ionicons name="home-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}> Back to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FFF7',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 90,
  },

  iconWrapper: {
    marginBottom: 20,
  },

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#14B85A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    color: '#111',
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 28,
    elevation: 3,
  },

  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E5BFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    position: 'absolute',
    bottom: 30,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
