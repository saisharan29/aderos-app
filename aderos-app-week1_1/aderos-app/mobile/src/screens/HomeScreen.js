// Screen 1: Home — the main hub
// Big "Start Ride" button + quick access to contacts/settings

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ADEROS</Text>
      <Text style={styles.tagline}>Ride safe. We're watching over you.</Text>

      {/* The one big action */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('RideMode')}
      >
        <Text style={styles.startButtonText}>START RIDE</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Text style={styles.secondaryText}>Emergency Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.secondaryText}>Settings</Text>
        </TouchableOpacity>
      </View>
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
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.charcoal,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.slate,
    marginTop: 8,
    marginBottom: 60,
  },
  startButton: {
    backgroundColor: COLORS.red,
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.red,
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    marginTop: 60,
    gap: 16,
  },
  secondaryButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  secondaryText: {
    color: COLORS.charcoal,
    fontWeight: '600',
  },
});
