// Minimal i18n — no library needed for an app this size.

export const STRINGS = {
  en: {
    tagline: "Ride safe. We're watching over you.",
    startRide: 'START RIDE',
    contacts: 'Emergency Contacts',
    settings: 'Settings',
    ready: 'READY',
    protected: 'PROTECTED',
    liveG: 'Live G-Force',
    startMonitoring: 'START MONITORING',
    endRide: 'END RIDE',
    hint: 'Keep your phone in your pocket or mount.\nADEROS monitors automatically.',
    crashDetected: 'CRASH DETECTED',
    areYouOk: 'Are you OK?',
    countdownLabel: 'Emergency contacts will be alerted\nwith your GPS location',
    imOk: "I'M OK — CANCEL",
    sendNow: 'SEND ALERT NOW',
    helpComing: 'HELP IS ON THE WAY',
  },
  fr: {
    tagline: 'Roulez tranquille. On veille sur vous.',
    startRide: 'DÉMARRER',
    contacts: "Contacts d'urgence",
    settings: 'Paramètres',
    ready: 'PRÊT',
    protected: 'PROTÉGÉ',
    liveG: 'Force G en direct',
    startMonitoring: 'ACTIVER LA SURVEILLANCE',
    endRide: 'TERMINER',
    hint: 'Gardez votre téléphone dans la poche ou sur support.\nADEROS surveille automatiquement.',
    crashDetected: 'CHOC DÉTECTÉ',
    areYouOk: 'Tout va bien ?',
    countdownLabel: "Vos contacts d'urgence seront alertés\navec votre position GPS",
    imOk: 'JE VAIS BIEN — ANNULER',
    sendNow: "ENVOYER L'ALERTE",
    helpComing: 'LES SECOURS ARRIVENT',
  },
};

export function t(lang, key) {
  return (STRINGS[lang] || STRINGS.en)[key] ?? key;
}