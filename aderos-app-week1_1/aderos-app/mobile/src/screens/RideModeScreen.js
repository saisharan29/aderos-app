// Screen 2: Ride Mode — active monitoring screen
// Shows ride status, live G-force, and listens for crashes (Week 2 wires this fully)

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { startCrashDetection, stopCrashDetection } from '../services/crashDetection';

export default function RideModeScreen({ navigation }) {
  const [riding, setRiding] = useState(false);
  const [gForce, setGForce] = useState(1.0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let timer;
    if (riding) {
      timer = setInterval(() => setDuration(d => d + 1), 1000);

      // Start the crash detection service (built in Week 2)
      startCrashDetection({
        onGForceUpdate: (g) => setGForce(g),
        onCrashDetected: () => {
          // Navigate to the crash alert countdown screen
          navigation.navigate('CrashAlert');
        },
      });
    }
    return () => {
      clearInterval(timer);
      stopCrashDetection();
    };
  }, [riding]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={[styles.statusDot, { backgroundColor: riding ? COLORS.green : COLORS.midGray }]} />
      <Text style={styles.status}>{riding ? 'PROTECTED' : 'READY'}</Text>

      <Text style={styles.timer}>{formatTime(duration)}</Text>

      <View style={styles.gForceBox}>
        <Text style={styles.gForceLabel}>Live G-Force</Text>
        <Text style={styles.gForceValue}>{gForce.toFixed(2)}g</Text>
      </View>

      <TouchableOpacity
        style={[styles.rideButton, { backgroundColor: riding ? COLORS.charcoal : COLORS.red }]}
        onPress={() => setRiding(!riding)}
      >
        <Text style={styles.rideButtonText}>{riding ? 'END RIDE' : 'START MONITORING'}</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Keep your phone in your pocket or mount.{'\n'}ADEROS monitors automatically.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  statusDot: { width: 16, height: 16, borderRadius: 8, marginBottom: 8 },
  status: { fontSize: 18, fontWeight: 'bold', color: COLORS.charcoal, letterSpacing: 3 },
  timer: { fontSize: 64, fontWeight: '200', color: COLORS.charcoal, marginVertical: 30 },
  gForceBox: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
    minWidth: 160,
  },
  gForceLabel: { fontSize: 12, color: COLORS.slate },
  gForceValue: { fontSize: 32, fontWeight: 'bold', color: COLORS.red },
  rideButton: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 32,
  },
  rideButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  hint: { marginTop: 24, textAlign: 'center', color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
