// Ride data logger — captures raw sensor data for threshold tuning (issue #1)
//
// Records every accelerometer sample during a ride, exports as CSV.
// Used to answer: where do real potholes actually land vs our 3.0g threshold?

import { Accelerometer } from 'expo-sensors';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Install first:  npx expo install expo-file-system expo-sharing

let sub = null;
let samples = [];
let startTime = null;
let markers = [];

export function startLogging() {
  samples = [];
  markers = [];
  startTime = Date.now();

  Accelerometer.setUpdateInterval(10); // 100 Hz
  sub = Accelerometer.addListener(({ x, y, z }) => {
    const g = Math.sqrt(x * x + y * y + z * z);
    samples.push({
      t: Date.now() - startTime,
      x: x.toFixed(4),
      y: y.toFixed(4),
      z: z.toFixed(4),
      g: g.toFixed(4),
    });
  });

  console.log('[ADEROS] Logging started');
}

// Tap this when you hit a pothole / brake hard — labels the data
export function mark(label) {
  markers.push({ t: Date.now() - startTime, label });
  console.log(`[ADEROS] Marked: ${label}`);
}

export function getSampleCount() {
  return samples.length;
}

export async function stopAndExport() {
  sub?.remove();
  sub = null;

  if (samples.length === 0) return null;

  // Build CSV, tagging each row with the nearest marker within 2s
  let csv = 'time_ms,ax,ay,az,g_force,event\n';
  samples.forEach((s) => {
    const m = markers.find((mk) => Math.abs(mk.t - s.t) < 2000);
    csv += `${s.t},${s.x},${s.y},${s.z},${s.g},${m ? m.label : ''}\n`;
  });

  const filename = `aderos_ride_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
  const uri = FileSystem.documentDirectory + filename;

  await FileSystem.writeAsStringAsync(uri, csv);
  console.log(`[ADEROS] Exported ${samples.length} samples to ${filename}`);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri); // opens share sheet — email it to yourself
  }

  return { filename, count: samples.length, uri };
}