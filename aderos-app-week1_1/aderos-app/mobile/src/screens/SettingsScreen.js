// Screen 5: Settings — sensitivity, language, about
// Keep minimal for MVP. More options come post-launch based on feedback.

import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/constants';

export default function SettingsScreen() {
  const [highSensitivity, setHighSensitivity] = useState(false);
  const [french, setFrench] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.label}>High sensitivity mode</Text>
          <Text style={styles.hint}>Detects lighter impacts. May increase false alarms.</Text>
        </View>
        <Switch
          value={highSensitivity}
          onValueChange={setHighSensitivity}
          trackColor={{ true: COLORS.red }}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.label}>Français</Text>
          <Text style={styles.hint}>Switch app language to French (Week 5)</Text>
        </View>
        <Switch value={french} onValueChange={setFrench} trackColor={{ true: COLORS.red }} />
      </View>

      <TouchableOpacity style={styles.testButton}>
        <Text style={styles.testButtonText}>Test Alert (sends to yourself)</Text>
      </TouchableOpacity>

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
  testButton: {
    backgroundColor: COLORS.charcoal,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  testButtonText: { color: '#FFF', fontWeight: '600' },
  about: { marginTop: 'auto', alignItems: 'center', paddingBottom: 20 },
  aboutTitle: { fontWeight: 'bold', color: COLORS.charcoal },
  aboutText: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
});
