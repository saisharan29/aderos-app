// Screen 5: Settings — sensitivity, language, and ride data recording
// Settings persist to AsyncStorage. Logger captures raw sensor data for threshold tuning.

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';
import { startLogging, stopAndExport, mark } from '../services/rideLogger';

export default function SettingsScreen() {
  const [highSensitivity, setHighSensitivity] = useState(false);
  const [french, setFrench] = useState(false);
  const [logging, setLogging] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('settings');
        if (saved) {
          const s = JSON.parse(saved);
          setHighSensitivity(s.highSensitivity ?? false);
          setFrench(s.french ?? false);
        }
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

  return (
    <View style={styles.container}>
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

      {/* ── Ride data recording (dev tool for threshold tuning) ── */}
      <Text style={styles.sectionLabel}>RIDE DATA</Text>

      <TouchableOpacity
        style={[styles.recordButton, { backgroundColor: logging ? COLORS.red : COLORS.charcoal }]}
        onPress={handleLogging}
      >
        <Text style={styles.recordButtonText}>
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

      <View style={styles.about}>
        <Text style={styles.aboutTitle}>ADEROS – Ride Safe</Text>
        <Text style={styles.aboutText}>v0.1.0 · Made in Paris 🇫🇷</Text>
        <Text style={styles.aboutText}>aderos.fr</Text>
      </View>
    </View>
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
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  recordButton: { borderRadius: 12, padding: 16, alignItems: 'center' },
  recordButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  markHint: { fontSize: 11, color: COLORS.muted, marginTop: 12, marginLeft: 4 },
  markRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  markButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    paddingVertical: 14,
    borderRadius: 8,
  },
  markText: { textAlign: 'center', fontSize: 12, color: COLORS.charcoal, fontWeight: '600' },

  about: { marginTop: 'auto', alignItems: 'center', paddingBottom: 20 },
  aboutTitle: { fontWeight: 'bold', color: COLORS.charcoal },
  aboutText: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
});