// Screen 4: Crash Alert — the countdown before help is called
//
// Must be impossible to miss: full red, huge text, vibration.
// Reports honestly what actually happened — never claims help is coming
// if the alert failed to send.

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { COLORS, CRASH_CONFIG } from '../utils/constants';
import { sendEmergencyAlert } from '../services/emergencyService';

export default function CrashAlertScreen({ navigation, route }) {
  const [secondsLeft, setSecondsLeft] = useState(CRASH_CONFIG.COUNTDOWN_SECONDS);
  const [alertSent, setAlertSent] = useState(false);
  const [result, setResult] = useState(null);

  const peakG = route?.params?.peakG ?? null;

  useEffect(() => {
    // Vibrate in a repeating pattern to get attention
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
    const r = await sendEmergencyAlert({ peakG });
    setResult(r);
    console.log('[ADEROS] Alert result:', r);
  };

  const cancelAlert = () => {
    Vibration.cancel();
    navigation.goBack();
  };

  // ── Result state ──────────────────────────────────
  if (alertSent) {
    const pending = result === null;
    const ok = result?.success === true;
    const manual = result?.method === 'device_sms_manual';

    let headline;
    let detail;
    let bg;

    if (pending) {
      headline = 'SENDING ALERT…';
      detail = 'Contacting your emergency contacts.';
      bg = COLORS.charcoal;
    } else if (ok && !manual) {
      headline = 'HELP IS ON THE WAY';
      detail = `Alert delivered to ${result.sent} contact${result.sent > 1 ? 's' : ''} with your location.`;
      bg = COLORS.charcoal;
    } else if (manual) {
      headline = 'ACTION NEEDED';
      detail = 'No connection to our servers. Your messages app is open — please press SEND.';
      bg = '#8A6D00';
    } else if (result?.reason === 'no_contacts') {
      headline = 'NO CONTACTS SET';
      detail = 'No emergency contacts were configured. Call 112 if you need help.';
      bg = COLORS.red;
    } else {
      headline = 'ALERT NOT DELIVERED';
      detail = 'We could not reach anyone. Call 112 if you need help.';
      bg = COLORS.red;
    }

    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <Text style={styles.sentTitle}>{headline}</Text>
        <Text style={styles.sentText}>{detail}</Text>

        <TouchableOpacity style={styles.okButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.okButtonText}>I'm OK now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Countdown state ───────────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRASH DETECTED</Text>
      <Text style={styles.question}>Are you OK?</Text>

      {peakG != null && (
        <Text style={styles.impact}>Impact: {peakG.toFixed(1)}g</Text>
      )}

      <Text style={styles.countdown}>{secondsLeft}</Text>
      <Text style={styles.countdownLabel}>
        Emergency contacts will be alerted{'\n'}with your GPS location
      </Text>

      {/* Huge target — easy to hit with shaking hands */}
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
  impact: { fontSize: 13, color: '#FFD0D4', marginTop: 6, fontWeight: '600' },
  countdown: { fontSize: 130, fontWeight: 'bold', color: '#FFF', marginVertical: 8 },
  countdownLabel: { color: '#FFD0D4', textAlign: 'center', fontSize: 14, lineHeight: 20 },
  cancelButton: {
    backgroundColor: '#FFF',
    paddingVertical: 22,
    paddingHorizontal: 40,
    borderRadius: 40,
    marginTop: 44,
    minWidth: '80%',
    alignItems: 'center',
  },
  cancelButtonText: { color: COLORS.red, fontSize: 20, fontWeight: 'bold' },
  sendNowButton: { marginTop: 18, padding: 12 },
  sendNowText: { color: '#FFF', textDecorationLine: 'underline', fontSize: 14 },

  sentTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFF', letterSpacing: 1, textAlign: 'center' },
  sentText: { color: '#DDD', textAlign: 'center', marginTop: 16, fontSize: 15, lineHeight: 22 },
  okButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 40,
  },
  okButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});