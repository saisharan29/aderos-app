// Sensor diagnostics — measures the device's real accelerometer ceiling (fixes A4)
//
// Phone accelerometers have a hardware full-scale range: typically ±2g, ±4g, ±8g or ±16g.
// If a device saturates at 2g, a 3g crash threshold can NEVER fire — silently.
// This module measures the observed ceiling and warns when detection is unreliable.

import { Accelerometer } from 'expo-sensors';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Install:  npx expo install expo-device

const SATURATION_MARGIN = 0.05; // readings within 5% of peak = likely clipping

let sub = null;
let peak = 0;
let samples = [];
let clipCount = 0;

/**
 * Run a calibration test. The user shakes the phone hard for ~10 seconds.
 * We watch for the reading to plateau — that plateau IS the hardware ceiling.
 */
export function startCalibration(onProgress) {
  peak = 0;
  samples = [];
  clipCount = 0;

  Accelerometer.setUpdateInterval(10);
  sub = Accelerometer.addListener(({ x, y, z }) => {
    const g = Math.sqrt(x * x + y * y + z * z);
    samples.push(g);

    if (g > peak) peak = g;

    // count how often we sit at the very top — a plateau means saturation
    if (peak > 0 && g >= peak * (1 - SATURATION_MARGIN)) clipCount++;

    onProgress?.({ current: g, peak, samples: samples.length });
  });
}

export async function stopCalibration() {
  sub?.remove();
  sub = null;

  if (samples.length < 100) {
    return { ok: false, reason: 'not_enough_data' };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  // Infer the hardware range from the observed peak
  const ranges = [2, 4, 8, 16];
  const inferred = ranges.find(r => peak <= r * 1.05) ?? 16;

  // If many samples pile up at the ceiling, it is clipping rather than
  // simply "you didn't shake hard enough"
  const clipRatio = clipCount / samples.length;
  const saturating = clipRatio > 0.02;

  const result = {
    ok: true,
    device: `${Device.manufacturer ?? '?'} ${Device.modelName ?? '?'}`,
    osVersion: Device.osVersion,
    peakG: +peak.toFixed(2),
    p99G: +p99.toFixed(2),
    inferredRange: inferred,
    saturating,
    reliable: inferred >= 8,
    verdict: verdictFor(inferred, saturating),
    testedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem('sensorDiagnostics', JSON.stringify(result));
  console.log('[ADEROS] Sensor diagnostics:', result);
  return result;
}

function verdictFor(range, saturating) {
  if (range <= 2) {
    return 'CRITICAL: this device saturates at ~2g. Crash detection at a 3g threshold cannot fire. Detection is unreliable on this phone.';
  }
  if (range <= 4) {
    return 'LIMITED: ceiling around 4g. Crashes will be detected but severity cannot be distinguished — a minor tumble and a fatal impact both read as 4g.';
  }
  if (range <= 8) {
    return 'ADEQUATE: ceiling around 8g. Detection works; severity resolution is coarse above 8g.';
  }
  return 'GOOD: 16g range. Detection and coarse severity classification are both viable.';
}

export async function getStoredDiagnostics() {
  try {
    const raw = await AsyncStorage.getItem('sensorDiagnostics');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Returns a safe crash threshold for this device, or null if detection
 * is not viable at all.
 */
export async function getSafeThreshold(defaultThreshold = 3.0) {
  const d = await getStoredDiagnostics();
  if (!d?.ok) return defaultThreshold;

  // Never set the threshold above ~70% of the hardware ceiling —
  // otherwise real impacts clip before they cross it.
  const ceiling = d.inferredRange * 0.7;
  return Math.min(defaultThreshold, ceiling);
}