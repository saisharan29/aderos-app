// Screen 4: Crash Alert — the 30-second countdown
// "Are you OK?" — if no response, auto-send SMS with GPS to emergency contacts
// This screen must be IMPOSSIBLE to miss: full red, huge text, loud

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { COLORS, CRASH_CONFIG } from '../utils/constants';
import { sendEmergencyAlert } from '../services/emergencyService';

export default function CrashAlertScreen({ navigation }) {
  const [secondsLeft, setSecondsLeft] = useState(CRASH_CONFIG.COUNTDOWN_SECONDS);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    // Vibrate in pattern to get attention
    Vibration.vibrate([500, 500], true);

    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          fireAlert();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      Vibration.cancel();
    };
  }, []);

  const fireAlert = async () => {
    Vibration.cancel();
    setAlertSent(true);
    // Week 3: this sends real SMS with GPS location
    await sendEmergencyAlert();
  };

  const cancelAlert = () => {
    Vibration.cancel();
    navigation.goBack();
  };

  if (alertSent) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.charcoal }]}>
        <Text style={styles.sentTitle}>HELP IS ON THE WAY</Text>
        <Text style={styles.sentText}>
          Your emergency contacts have been notified with your location.
        </Text>
        <TouchableOpacity style={styles.okButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.okButtonText}>I'm OK now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRASH DETECTED</Text>
      <Text style={styles.question}>Are you OK?</Text>

      <Text style={styles.countdown}>{secondsLeft}</Text>
      <Text style={styles.countdownLabel}>
        Emergency contacts will be alerted{'\n'}with your GPS location
      </Text>

      {/* HUGE cancel button — easy to hit even with shaking hands */}
      <TouchableOpacity style={styles.cancelButton} onPress={cancelAlert}>
        <Text style={styles.cancelButtonText}>I'M OK — CANCEL</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sendNowButton} onPress={fireAlert}>
        <Text style={styles.sendNowText}>SEND ALERT NOW</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', letterSpacing: 2 },
  question: { fontSize: 20, color: '#FFD0D4', marginTop: 8 },
  countdown: { fontSize: 140, fontWeight: 'bold', color: '#FFF', marginVertical: 10 },
  countdownLabel: { color: '#FFD0D4', textAlign: 'center', fontSize: 14, lineHeight: 20 },
  cancelButton: {
    backgroundColor: '#FFF',
    paddingVertical: 22,
    paddingHorizontal: 40,
    borderRadius: 40,
    marginTop: 50,
    minWidth: '80%',
    alignItems: 'center',
  },
  cancelButtonText: { color: COLORS.red, fontSize: 20, fontWeight: 'bold' },
  sendNowButton: { marginTop: 20, padding: 12 },
  sendNowText: { color: '#FFF', textDecorationLine: 'underline', fontSize: 14 },
  sentTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },
  sentText: { color: '#CCC', textAlign: 'center', marginTop: 16, fontSize: 15, lineHeight: 22 },
  okButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 40,
  },
  okButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
