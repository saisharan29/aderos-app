// Emergency Service — server-side alert dispatch (fixes A1)
//
// The phone's only job is to REPORT. The backend sends the SMS via Twilio,
// so an unconscious rider never has to press anything.
//
// Fallback chain:
//   1. Server dispatch (works when unconscious — the whole point)
//   2. Device SMS composer (only if the rider is conscious and there's no data)
//
// Also caches GPS continuously during a ride so a crash alert always carries
// a position, even if the fix fails at the moment of impact (fixes A5).

import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

// ── GPS cache (A5) ────────────────────────────────
let lastFix = null;        // { latitude, longitude, accuracy, timestamp }
let cacheSub = null;

export async function startLocationCache() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return false;

  cacheSub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 3000,
      distanceInterval: 10,
    },
    (loc) => {
      lastFix = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        timestamp: Date.now(),
      };
    }
  );
  return true;
}

export function stopLocationCache() {
  cacheSub?.remove();
  cacheSub = null;
}

/**
 * Best available position: try a fresh fix quickly, fall back to the cache.
 * Never blocks the alert for more than ~4 seconds.
 */
async function getBestPosition() {
  try {
    const fresh = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000)),
    ]);
    return {
      latitude: fresh.coords.latitude,
      longitude: fresh.coords.longitude,
      accuracy: fresh.coords.accuracy,
      ageSeconds: 0,
    };
  } catch {
    if (lastFix) {
      return {
        latitude: lastFix.latitude,
        longitude: lastFix.longitude,
        accuracy: lastFix.accuracy,
        ageSeconds: (Date.now() - lastFix.timestamp) / 1000,
      };
    }
    return null;
  }
}

/**
 * The full emergency flow. Called by CrashAlertScreen when the countdown ends.
 * @param {Object} opts - { peakG }
 */
export async function sendEmergencyAlert(opts = {}) {
  const pos = await getBestPosition();

  const stored = await AsyncStorage.getItem('emergencyContacts');
  const contacts = stored ? JSON.parse(stored) : [];

  if (contacts.length === 0) {
    console.warn('[ADEROS] No emergency contacts configured');
    return { success: false, reason: 'no_contacts' };
  }

  const payload = {
    latitude: pos?.latitude ?? null,
    longitude: pos?.longitude ?? null,
    location_accuracy_m: pos?.accuracy ?? null,
    location_age_s: pos?.ageSeconds ?? null,
    peak_g: opts.peakG ?? null,
    timestamp: new Date().toISOString(),
    contacts: contacts.map((c) => ({ name: c.name, phone: c.phone })),
    user_name: (await AsyncStorage.getItem('userName')) || null,
  };

  // ── 1. Server dispatch — works when the rider cannot act ──
  try {
    const res = await Promise.race([
      fetch(`${API_BASE_URL}/api/v1/emergency-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000)),
    ]);

    const data = await res.json();
    console.log('[ADEROS] Server alert result:', data);

    if (data.sent > 0) {
      return { success: true, method: 'server', sent: data.sent, total: data.total };
    }
    // Server reachable but nothing delivered — fall through
    console.warn('[ADEROS] Server sent 0 messages, falling back to device SMS');
  } catch (err) {
    console.warn('[ADEROS] Server unreachable, falling back to device SMS:', err.message);
  }

  // ── 2. Device SMS fallback — requires a conscious user ──
  try {
    const available = await SMS.isAvailableAsync();
    if (available) {
      const locText = pos
        ? `https://maps.google.com/?q=${pos.latitude},${pos.longitude}` +
          (pos.ageSeconds > 30 ? `\n(last known, ${Math.round(pos.ageSeconds)}s before impact)` : '')
        : 'Location unavailable';

      const message =
        `ADEROS EMERGENCY ALERT\n` +
        `A possible accident was detected.\n` +
        `Location: ${locText}\n` +
        `Time: ${new Date().toLocaleString()}\n` +
        `Automated alert — please call, and 112 if unreachable.`;

      await SMS.sendSMSAsync(contacts.map((c) => c.phone), message);
      return { success: true, method: 'device_sms_manual' };
    }
  } catch (err) {
    console.error('[ADEROS] Device SMS fallback failed:', err);
  }

  return { success: false, reason: 'all_methods_failed' };
}