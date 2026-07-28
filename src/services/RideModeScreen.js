// Screen 2: Ride Mode — manual monitoring + auto mode
// Auto mode: monitoring starts by itself when vehicle motion is detected.

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { startCrashDetection, stopCrashDetection } from '../services/crashDetection';
import { startAutoMode, stopAutoMode } from '../services/autoStart';

export default function RideModeScreen({ navigation }) {
  const [riding, setRiding] = useState(false);
  const [gForce, setGForce] = useState(1.0);
  const [duration, setDuration] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const [autoState, setAutoState] = useState('OFF');

  // Manual mode
  useEffect(() => {
    let timer;
    if (riding && !autoMode) {
      timer = setInterval(() => setDuration((d) => d + 1), 1000);
      startCrashDetection({
        onGForceUpdate: (g) => setGForce(g),
        onCrashDetected: () => navigation.navigate('CrashAlert'),
      });
    }
    return () => {
      clearInterval(timer);
      if (!autoMode) stopCrashDetection();
    };
  }, [riding, autoMode]);

  // Auto mode
  useEffect(() => {
    if (autoMode) {
      setRiding(false); // manual off when auto is on
      startAutoMode({
        onStateChange: (st) => setAutoState(st),
        onGForceUpdate: (g) => setGForce(g),
        onCrashDetected: () => navigation.navigate('CrashAlert'),
      });
    } else {
      stopAutoMode();
      setAutoState('OFF');
    }
    return () => stopAutoMode();
  }, [autoMode]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const isProtected = riding || autoState === 'RIDING';
  const statusText = autoMode
    ? autoState === 'RIDING' ? 'PROTECTED (AUTO)' : 'WAITING FOR MOVEMENT'
    : riding ? 'PROTECTED' : 'READY';

  return (
    <View style={styles.container}>
      <View style={[styles.statusDot, { backgroundColor: isProtected ? COLORS.green : COLORS.midGray }]} />
      <Text style={styles.status}>{statusText}</Text>

      <Text style={styles.timer}>{formatTime(duration)}</Text>

      <View style={styles.gForceBox}>
        <Text style={styles.gForceLabel}>Live G-Force</Text>
        <Text style={styles.gForceValue}>{gForce.toFixed(2)}g</Text>
      </View>

      {!autoMode && (
        <TouchableOpacity
          style={[styles.rideButton, { backgroundColor: riding ? COLORS.charcoal : COLORS.red }]}
          onPress={() => setRiding(!riding)}
        >
          <Text style={styles.rideButtonText}>
            {riding ? 'END RIDE' : 'START MONITORING'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.autoButton} onPress={() => setAutoMode(!autoMode)}>
        <Text style={[styles.autoText, { color: autoMode ? COLORS.green : COLORS.muted }]}>
          {autoMode ? '⚡ AUTO MODE ON — tap to disable' : '⚡ Enable Auto Mode'}
        </Text>
      </TouchableOpacity>

      {autoMode && (
        <Text style={styles.autoHint}>
          Monitoring starts automatically when you're moving faster than 18 km/h.
        </Text>
      )}

      {/* TEST ONLY — remove before launch */}
      <TouchableOpacity
        style={{ marginTop: 16, padding: 10 }}
        onPress={() => navigation.navigate('CrashAlert')}
      >
        <Text style={{ color: '#9A9FB0', textDecorationLine: 'underline', fontSize: 12 }}>
          🧪 Simulate Crash (test)
        </Text>
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
  status: { fontSize: 16, fontWeight: 'bold', color: COLORS.charcoal, letterSpacing: 2 },
  timer: { fontSize: 56, fontWeight: '200', color: COLORS.charcoal, marginVertical: 20 },
  gForceBox: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 28,
    minWidth: 160,
  },
  gForceLabel: { fontSize: 12, color: COLORS.slate },
  gForceValue: { fontSize: 30, fontWeight: 'bold', color: COLORS.red },
  rideButton: {
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 32,
  },
  rideButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
  autoButton: { marginTop: 16, padding: 10 },
  autoText: { fontSize: 14, fontWeight: '600' },
  autoHint: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
  },
  hint: { marginTop: 18, textAlign: 'center', color: COLORS.muted, fontSize: 11, lineHeight: 17 },
});