// Auto-start service — removes the manual START RIDE dependency
//
// Strategy: GPS speed is the cheap trigger, accelerometer is the expensive watcher.
// IDLE   -> low-power location watch, no accelerometer
// RIDING -> full 100Hz crash detection
//
// LIMITATION: works while app is open in Expo Go.
// Full background operation comes with the standalone Play Store build.

import * as Location from 'expo-location';
import { startCrashDetection, stopCrashDetection } from './crashDetection';

const CONFIG = {
  RIDE_START_SPEED_MS: 5.0,   // ~18 km/h — faster than running
  RIDE_START_HOLD_MS: 20000,  // must hold speed 20s (filters GPS jitter)
  RIDE_END_SPEED_MS: 1.4,     // ~5 km/h
  RIDE_END_HOLD_MS: 180000,   // 3 min slow = ride over (red lights don't end rides)
};

let locationSub = null;
let state = 'IDLE';           // IDLE | RIDING
let speedAboveSince = null;
let speedBelowSince = null;
let callbacks = {};

export function getAutoState() {
  return state;
}

export async function startAutoMode(cbs) {
  callbacks = cbs; // { onStateChange, onGForceUpdate, onCrashDetected }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    callbacks.onStateChange?.('PERMISSION_DENIED');
    return false;
  }

  locationSub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,  // low power — not High
      timeInterval: 5000,                    // check every 5 seconds
      distanceInterval: 20,                  // or every 20 metres
    },
    (loc) => handleSpeed(loc.coords.speed ?? 0)
  );

  callbacks.onStateChange?.('IDLE');
  return true;
}

function handleSpeed(speed) {
  const now = Date.now();

  if (state === 'IDLE') {
    if (speed >= CONFIG.RIDE_START_SPEED_MS) {
      if (!speedAboveSince) speedAboveSince = now;
      if (now - speedAboveSince >= CONFIG.RIDE_START_HOLD_MS) {
        enterRiding();
      }
    } else {
      speedAboveSince = null;
    }
  } else if (state === 'RIDING') {
    if (speed <= CONFIG.RIDE_END_SPEED_MS) {
      if (!speedBelowSince) speedBelowSince = now;
      if (now - speedBelowSince >= CONFIG.RIDE_END_HOLD_MS) {
        exitRiding();
      }
    } else {
      speedBelowSince = null; // moving again — red light, not ride end
    }
  }
}

function enterRiding() {
  state = 'RIDING';
  speedAboveSince = null;
  console.log('[ADEROS] Vehicle motion detected — monitoring ON');
  startCrashDetection({
    onGForceUpdate: callbacks.onGForceUpdate,
    onCrashDetected: callbacks.onCrashDetected,
  });
  callbacks.onStateChange?.('RIDING');
}

function exitRiding() {
  state = 'IDLE';
  speedBelowSince = null;
  console.log('[ADEROS] Ride ended — monitoring OFF (battery saved)');
  stopCrashDetection();
  callbacks.onStateChange?.('IDLE');
}

export function stopAutoMode() {
  locationSub?.remove();
  locationSub = null;
  if (state === 'RIDING') stopCrashDetection();
  state = 'IDLE';
  speedAboveSince = null;
  speedBelowSince = null;
}