# ADEROS — Ride Safe

**Automatic crash detection for riders.** Detects an accident using phone sensors and alerts emergency contacts with GPS location — without the rider having to do anything.

When someone crashes alone, help arrives because a person noticed and called. That takes 8–12 minutes on average. ADEROS removes the human from that loop.

---

## Status

| Component | State |
|---|---|
| Mobile app (React Native) | ✅ Running on device |
| Crash detection engine | ✅ Working, thresholds being tuned |
| GPS + SMS alert pipeline | ✅ Built |
| Backend API | ✅ Deployed — [aderos-api.onrender.com/docs](https://aderos-api.onrender.com/docs) |
| Play Store release | 🟡 In progress |
| Real-world validation | ❌ Not yet — see [Limitations](#limitations) |

---

## How detection works

The hard part is not detecting an impact. It is rejecting the thousands of impacts that are not crashes — potholes, speed bumps, a phone dropped on a table.

Detection runs in two phases:

**Phase 1 — Impact**

```
G = √(ax² + ay² + az²)
```

Acceleration magnitude sampled at 100 Hz from the device IMU. The reading must cross the threshold *and stay above it* for 100 ms. A single noisy sample is discarded — real impacts have duration.

| Vehicle | Threshold |
|---|---|
| Motorcycle / scooter | 3.0 g |
| Car | 5.0 g |
| Truck / bus | 2.5 g |

**Phase 2 — Stillness**

After an impact, the app checks whether movement stops:

```
|G − 1.0| < 0.3   sustained for 5 seconds
```

A rider who has crashed stops moving. A rider who hit a pothole keeps going. Phase 2 is what makes the app usable — without it, every speed bump would fire an alert.

**Then:** a 30-second countdown appears. The rider can cancel. If they don't, an SMS with their GPS coordinates goes to their emergency contacts.

```
sensor → impact? → sustained? → still? → countdown → alert
              ↓          ↓         ↓
           discard   discard    discard
```

---

## Why SMS

SMS is the transport layer, not a fallback. It works on any network standard since 1991 — including 2G, which still covers rural roads and tunnels where data does not. Detection itself is entirely on-device, so no connection is needed to *notice* a crash, only to report it.

---

## Stack

| Layer | Technology |
|---|---|
| App | React Native (Expo SDK 54) |
| Sensing | `expo-sensors` — 100 Hz accelerometer, `expo-location`, `expo-sms` |
| Storage | AsyncStorage (emergency contacts, local ride history) |
| Backend | FastAPI · Python 3.12 |
| Hosting | Render |

---

## Running it locally

```bash
git clone https://github.com/saisharan29/aderos-app.git
cd aderos-app
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone. Requires SDK 54.

**Testing detection:** shaking the phone opens Expo's own developer menu, so it can't be used to trigger a crash. Lower `CRASH_THRESHOLD_G` in `src/utils/constants.js` to ~1.4 and set the phone down firmly instead. Set it back to 3.0 before any real use.

---

## Structure

```
src/
├── screens/
│   ├── HomeScreen.js         Start ride
│   ├── RideModeScreen.js     Live G-force, monitoring state
│   ├── CrashAlertScreen.js   30 s countdown, cancel, send
│   ├── ContactsScreen.js     Emergency contacts
│   └── SettingsScreen.js     Sensitivity, language
├── services/
│   ├── crashDetection.js     Two-phase detection engine
│   └── emergencyService.js   GPS lock → SMS → backend log
└── utils/
    └── constants.js          All tunable thresholds
```

Every threshold lives in `constants.js`. Nothing is hardcoded elsewhere.

---

## Limitations

Stated plainly, because they matter more than the feature list:

- **False positives are unsolved at scale.** Thresholds are tuned on a handful of test rides, not hundreds of hours of real riding data.
- **No real-crash validation.** The system has never detected an actual accident. All testing so far is simulated.
- **Battery cost is unmeasured.** Continuous 100 Hz sampling drains a phone. If it kills a courier's battery mid-shift, they uninstall.
- **No user validation yet.** Rider interviews are the next step. Demand is currently assumed, not proven.

---

## Roadmap

- Threshold tuning against real riding data
- Battery profiling and adaptive sampling
- Rider interviews in Paris
- Play Store release
- Radar + vision fusion for pre-impact prediction *(research)*
- Municipal pilot — accident detection on existing city cameras *(research)*

---

## Related

- **Backend** — [aderos-api](https://github.com/saisharan29/aderos-api) · [live docs](https://aderos-api.onrender.com/docs)

---

Built as part of an MSc Artificial Intelligence at ECE Paris. Detection approach originates from undergraduate thesis research on video-based accident detection.

MIT License.
