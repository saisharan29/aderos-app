// Screen 5: Settings — sensitivity, language, sensor diagnostics, ride data recording
//
// Settings persist to AsyncStorage.
// Sensor test measures the device's accelerometer ceiling (fixes flaw A4).
// Ride logger captures raw data for threshold tuning (issue #1).

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';
import { startLogging, stopAndExport, mark } from '../services/rideLogger';
import { startCalibration, stopCalibration, getStoredDiagnostics } from '../services/sensorDiagnostics';

export default function SettingsScreen() {
  const [highSensitivity, setHighSensitivity] = useState(false);
  const [french, setFrench] = useState(false);
  const [logging, setLogging] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [livePeak, setLivePeak] = useState(0);
  const [diagnostics, setDiagnostics] = useState(null);

  // Load saved settings and any previous sensor test result
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('settings');
        if (saved) {
          const s = JSON.parse(saved);
          setHighSensitivity(s.highSensitivity ?? false);
          setFrench(s.french ?? false);
        }
        const d = await getStoredDiagnostics();
        if (d) setDiagnostics(d);
      } catch (e) {
        console.log('[ADEROS] Could not load settings:', e);
      }
    })();
  }, []);

  const saveSettings = async (next) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(next));
    } catch (e) {
      console.log('[ADEROS] Could not save settings:', e);
    }
  };

  const toggleSensitivity = (v) => {
    setHighSensitivity(v);
    saveSettings({ highSensitivity: v, french });
  };

  const toggleFrench = (v) => {
    setFrench(v);
    saveSettings({ highSensitivity, french: v });
  };

  // ── Sensor range test ──────────────────────────────
  const handleCalibration = async () => {
    if (calibrating) {
      const r = await stopCalibration();
      setCalibrating(false);
      if (r.ok) {
        setDiagnostics(r);
        Alert.alert(
          `Peak reading: ${r.peakG}g`,
          `${r.device}\nInferred hardware range: \u00B1${r.inferredRange}g\nSamples: ${r.sampleCount}\n\n${r.verdict}`
        );
      } else {
        Alert.alert('Test inconclusive', r.hint);
      }
    } else {
      setLivePeak(0);
      startCalibration(({ peak }) => setLivePeak(peak));
      setCalibrating(true);
      Alert.alert(
        'Shake hard',
        'Shake the phone as hard as you safely can for at least 10 seconds, then press stop.\n\nExpo Go\u2019s dev menu may appear \u2014 dismiss it and keep shaking.'
      );
    }
  };

  // ── Ride data logging ──────────────────────────────
  const handleLogging = async () => {
    if (logging) {
      const r = await stopAndExport();
      setLogging(false);
      Alert.alert(
        'Recording stopped',
        r ? `Exported ${r.count} samples.\n${r.filename}` : 'No data was recorded.'
      );
    } else {
      startLogging();
      setLogging(true);
      Alert.alert('Recording started', 'Tap the event buttons when you hit a pothole or brake hard.');
    }
  };

  const verdictColour = () => {
    if (!diagnostics) return COLORS.muted;
    if (!diagnostics.reliable) return COLORS.red;
    return COLORS.green ?? '#1A7A1A';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>

      {/* ── Preferences ── */}
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.label}>High sensitivity mode</Text>
          <Text style={styles.hint}>Detects lighter impacts. May increase false alarms.</Text>
        </View>
        <Switch
          value={highSensitivity}
          onValueChange={toggleSensitivity}
          trackColor={{ true: COLORS.red }}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.label}>Français</Text>
          <Text style={styles.hint}>Switch app language to French</Text>
        </View>
        <Switch
          value={french}
          onValueChange={toggleFrench}
          trackColor={{ true: COLORS.red }}
        />
      </View>

      {/* ── Sensor diagnostics ── */}
      <Text style={styles.sectionLabel}>SENSOR TEST</Text>

      {diagnostics && (
        <View style={[styles.diagCard, { borderLeftColor: verdictColour() }]}>
          <Text style={styles.diagDevice}>{diagnostics.device}</Text>
          <Text style={styles.diagRange}>
            Peak {diagnostics.peakG}g · inferred range ±{diagnostics.inferredRange}g
          </Text>
          <Text style={[styles.diagVerdict, { color: verdictColour() }]}>
            {diagnostics.verdict}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: calibrating ? COLORS.red : COLORS.charcoal }]}
        onPress={handleCalibration}
      >
        <Text style={styles.actionButtonText}>
          {calibrating ? `⏹  Stop — peak ${livePeak.toFixed(1)}g` : '📊  Test Sensor Range'}
        </Text>
      </TouchableOpacity>

      {!diagnostics && (
        <Text style={styles.markHint}>
          Run this once per device. If the phone saturates below 8g, crash detection is unreliable.
        </Text>
      )}

      {/* ── Ride data ── */}
      <Text style={styles.sectionLabel}>RIDE DATA</Text>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: logging ? COLORS.red : COLORS.charcoal }]}
        onPress={handleLogging}
      >
        <Text style={styles.actionButtonText}>
          {logging ? '⏹  Stop & Export Ride Data' : '⏺  Record Ride Data'}
        </Text>
      </TouchableOpacity>

      {logging && (
        <>
          <Text style={styles.markHint}>Tap when it happens — labels the data:</Text>
          <View style={styles.markRow}>
            {['Pothole', 'Hard brake', 'Bump'].map((l) => (
              <TouchableOpacity key={l} style={styles.markButton} onPress={() => mark(l)}>
                <Text style={styles.markText}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* ── About ── */}
      <View style={styles.about}>
        <Text style={styles.aboutTitle}>ADEROS – Ride Safe</Text>
        <Text style={styles.aboutText}>v0.1.0 · Made in Paris 🇫🇷</Text>
        <Text style={styles.aboutText}>aderos.fr</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },

  row: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: { flex: 1, paddingRight: 12 },
  label: { fontWeight: 'bold', color: COLORS.charcoal, fontSize: 15 },
  hint: { color: COLORS.slate, fontSize: 12, marginTop: 3 },

  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.muted,
    letterSpacing: 2,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },

  diagCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
  },
  diagDevice: { fontSize: 13, fontWeight: 'bold', color: COLORS.charcoal },
  diagRange: { fontSize: 12, color: COLORS.slate, marginTop: 2 },
  diagVerdict: { fontSize: 11, marginTop: 8, lineHeight: 16 },

  actionButton: { borderRadius: 12, padding: 16, alignItems: 'center' },
  actionButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  markHint: { fontSize: 11, color: COLORS.muted, marginTop: 10, marginLeft: 4, lineHeight: 16 },
  markRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  markButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    paddingVertical: 14,
    borderRadius: 8,
  },
  markText: { textAlign: 'center', fontSize: 12, color: COLORS.charcoal, fontWeight: '600' },

  about: { marginTop: 30, alignItems: 'center' },
  aboutTitle: { fontWeight: 'bold', color: COLORS.charcoal },
  aboutText: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
});