// ADEROS – Ride Safe
// Main app entry: navigation between the 5 screens

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import RideModeScreen from './src/screens/RideModeScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import CrashAlertScreen from './src/screens/CrashAlertScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Extra install needed (Week 1):
// npm install @react-navigation/native @react-navigation/native-stack
// npx expo install react-native-screens react-native-safe-area-context

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#2B2D42' },
          headerTintColor: '#FFFFFF',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ADEROS' }} />
        <Stack.Screen name="RideMode" component={RideModeScreen} options={{ title: 'Ride Mode' }} />
        <Stack.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Emergency Contacts' }} />
        <Stack.Screen name="CrashAlert" component={CrashAlertScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
