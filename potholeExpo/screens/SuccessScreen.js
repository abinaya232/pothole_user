import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Glow + Icon */}
      <View style={styles.glowWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={44} color="#fff" />
        </View>
      </View>

      {/* Text */}
      <Text style={styles.title}>Complaint submitted successfully</Text>
      <Text style={styles.subtitle}>
        Report has been sent to the government dashboard
      </Text>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.cardText}>
            Your report is anonymous and secure
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.cardText}>
            Authorities will review the data for road maintenance
          </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.cardText}>
            Thank you for helping improve road safety
          </Text>
        </View>
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
    backgroundColor: '#F3FFF7',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  glowWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(20,184,90,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#14B85A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginTop: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginTop: 26,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B85A',
    marginTop: 7,
    marginRight: 10,
  },

  cardText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E5BFF',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    position: 'absolute',
    bottom: 28,
    elevation: 4,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
