// THE CORE: Crash Detection Service (Week 2 focus)
//
// Formula: CrashScore = √(ax² + ay² + az²)
// Trigger: > CRASH_THRESHOLD_G sustained for IMPACT_DURATION_MS
// Confirm: near-zero movement for STILLNESS_DURATION_MS after impact
//          (filters out potholes: pothole = spike then normal movement continues)

import { Accelerometer } from 'expo-sensors';
import { CRASH_CONFIG } from '../utils/constants';

let subscription = null;
let impactStartTime = null;
let crashCandidate = false;
let stillnessStartTime = null;
let callbacks = {};

/**
 * Start monitoring. Call from RideModeScreen.
 * @param {Object} cbs - { onGForceUpdate(g), onCrashDetected() }
 */
export function startCrashDetection(cbs) {
  callbacks = cbs;

  // 100Hz sampling = update every 10ms
  Accelerometer.setUpdateInterval(CRASH_CONFIG.SAMPLE_INTERVAL_MS);

  subscription = Accelerometer.addListener(({ x, y, z }) => {
    // Expo gives values in g already (1.0 = gravity)
    const gForce = Math.sqrt(x * x + y * y + z * z);

    callbacks.onGForceUpdate?.(gForce);

    const now = Date.now();

    if (!crashCandidate) {
      // PHASE 1: Watch for impact spike
      if (gForce > CRASH_CONFIG.CRASH_THRESHOLD_G) {
        if (!impactStartTime) impactStartTime = now;

        // Sustained impact? (not just a single noisy sample)
        if (now - impactStartTime >= CRASH_CONFIG.IMPACT_DURATION_MS) {
          crashCandidate = true;
          stillnessStartTime = null;
          console.log(`[ADEROS] Impact detected: ${gForce.toFixed(2)}g`);
        }
      } else {
        impactStartTime = null; // reset if spike ended too fast
      }
    } else {
      // PHASE 2: Confirm crash via stillness
      // After a real crash, the phone stops moving (rider down)
      // After a pothole, movement continues normally
      const isStill = Math.abs(gForce - 1.0) < CRASH_CONFIG.STILLNESS_TOLERANCE_G;

      if (isStill) {
        if (!stillnessStartTime) stillnessStartTime = now;

        if (now - stillnessStartTime >= CRASH_CONFIG.STILLNESS_DURATION_MS) {
          // CRASH CONFIRMED
          console.log('[ADEROS] CRASH CONFIRMED — triggering alert flow');
          crashCandidate = false;
          impactStartTime = null;
          callbacks.onCrashDetected?.();
        }
      } else {
        // Movement resumed → it was a pothole/bump, reset
        if (stillnessStartTime && now - stillnessStartTime > 2000) {
          console.log('[ADEROS] Movement resumed — false alarm, resetting');
          crashCandidate = false;
          impactStartTime = null;
          stillnessStartTime = null;
        }
      }
    }
  });
}

export function stopCrashDetection() {
  subscription?.remove();
  subscription = null;
  impactStartTime = null;
  crashCandidate = false;
  stillnessStartTime = null;
}

// WEEK 2 TESTING TIPS:
// 1. Lower CRASH_THRESHOLD_G to 1.5 temporarily for desk testing
// 2. Shake phone hard then place flat & still → should trigger
// 3. Shake phone hard then keep moving → should NOT trigger
// 4. Log every state transition, tune thresholds from real bike rides
