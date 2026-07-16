# ADEROS – Ride Safe 🏍️

Crash detection app: detects accidents via phone sensors, auto-alerts emergency contacts with GPS location.

## Structure

```
aderos-app/
├── mobile/          # React Native app (Expo)
│   └── src/
│       ├── screens/       # 5 screens
│       ├── services/      # crash detection, GPS, SMS
│       ├── components/    # reusable UI
│       └── utils/         # helpers, constants
└── backend/         # FastAPI server
    └── app/
        ├── routes/        # API endpoints
        ├── models/        # database models
        └── core/          # config, security
```

## Week 1 Setup (do these in order)

### Mobile app
```bash
# 1. Install Node.js LTS if not installed (nodejs.org)
# 2. Create Expo app (Expo = easiest React Native setup)
npx create-expo-app@latest aderos-mobile --template blank
cd aderos-mobile

# 3. Install the sensors + location + SMS packages
npx expo install expo-sensors expo-location expo-sms expo-task-manager

# 4. Copy the src/ folder from this repo into your project
# 5. Run it
npx expo start
# Scan QR code with Expo Go app on your phone
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# API docs at http://localhost:8000/docs
```

## The Core Formula (Week 2)

```
Crash Score = √(ax² + ay² + az²)
Threshold: > 3g sustained 100ms = crash
Confirm: no movement for 5s after impact
Then: 30s countdown → auto-SMS with GPS link
```

## Roadmap
- [x] Week 1: This structure
- [ ] Week 2: Sensor core (crash detection)
- [ ] Week 3: Emergency pipeline (GPS + SMS + countdown)
- [ ] Week 4: Backend connected
- [ ] Week 5: UI polish (FR/EN, dark mode)
- [ ] Week 6: Real ride testing
- [ ] Week 7: Store submission
- [ ] Week 8: Launch 🚀
