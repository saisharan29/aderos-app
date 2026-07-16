// Emergency Service (Week 3 focus)
// On crash: get GPS → compose message → send SMS to all emergency contacts
// Also logs the event to the backend (Week 4)

import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Week 1 extra install: npx expo install @react-native-async-storage/async-storage

import { API_BASE_URL } from '../utils/constants';

/**
 * The full emergency flow. Called by CrashAlertScreen when countdown ends.
 */
export async function sendEmergencyAlert() {
  try {
    // 1. Get GPS location
    const { status } = await Location.requestForegroundPermissionsAsync();
    let locationText = 'Location unavailable';
    let coords = null;

    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      coords = loc.coords;
      locationText = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
    }

    // 2. Load emergency contacts
    const stored = await AsyncStorage.getItem('emergencyContacts');
    const contacts = stored ? JSON.parse(stored) : [];

    if (contacts.length === 0) {
      console.warn('[ADEROS] No emergency contacts configured!');
      return { success: false, reason: 'no_contacts' };
    }

    // 3. Compose the message
    const message =
      `🚨 ADEROS EMERGENCY ALERT 🚨\n` +
      `A possible crash was detected.\n` +
      `Location: ${locationText}\n` +
      `Time: ${new Date().toLocaleString()}\n` +
      `This is an automated alert from the ADEROS safety app.`;

    // 4. Send SMS (opens SMS composer pre-filled — user taps send)
    // NOTE: Fully automatic background SMS needs a paid service (Twilio)
    // via the backend — that's the Week 4+ upgrade. MVP uses device SMS.
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const phoneNumbers = contacts.map((c) => c.phone);
      await SMS.sendSMSAsync(phoneNumbers, message);
    }

    // 5. Log to backend (fire-and-forget, don't block on failure)
    logCrashToBackend(coords).catch(() => {});

    return { success: true };
  } catch (err) {
    console.error('[ADEROS] Emergency alert failed:', err);
    return { success: false, reason: err.message };
  }
}

async function logCrashToBackend(coords) {
  await fetch(`${API_BASE_URL}/api/v1/crash-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      timestamp: new Date().toISOString(),
    }),
  });
}
