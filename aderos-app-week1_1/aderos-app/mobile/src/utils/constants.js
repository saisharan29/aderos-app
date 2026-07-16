// ADEROS constants — all tunable values in ONE place

// Same palette as your pitch deck (no black!)
export const COLORS = {
  background: '#F7F8FA',
  lightGray: '#EEEFF2',
  midGray: '#DADDE3',
  charcoal: '#2B2D42',
  slate: '#4A4E69',
  muted: '#9A9FB0',
  red: '#E8192C',
  green: '#1A7A1A',
};

// THE crash detection tuning — Week 2 & 6 will refine these from real rides
export const CRASH_CONFIG = {
  SAMPLE_INTERVAL_MS: 10,        // 100Hz sampling
  CRASH_THRESHOLD_G: 3.0,        // impact threshold (motorcycle)
                                 // TIP: set 1.5 for desk testing, 3.0 for real use
  IMPACT_DURATION_MS: 100,       // spike must last this long
  STILLNESS_TOLERANCE_G: 0.3,    // "still" = within ±0.3g of gravity (1.0g)
  STILLNESS_DURATION_MS: 5000,   // 5s of no movement confirms crash
  COUNTDOWN_SECONDS: 30,         // "Are you OK?" countdown before alert
};

// Backend — change to your Render URL in Week 4
export const API_BASE_URL = 'http://localhost:8000';
// export const API_BASE_URL = 'https://aderos-api.onrender.com';
