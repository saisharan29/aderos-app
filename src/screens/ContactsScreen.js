// Screen 3: Emergency Contacts — add/remove people to alert
// Stored locally in AsyncStorage (synced to backend in Week 4)

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => { loadContacts(); }, []);

  const loadContacts = async () => {
    const stored = await AsyncStorage.getItem('emergencyContacts');
    if (stored) setContacts(JSON.parse(stored));
  };

  const saveContacts = async (updated) => {
    setContacts(updated);
    await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updated));
  };

  const addContact = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing info', 'Please enter both name and phone number.');
      return;
    }
    const updated = [...contacts, { id: Date.now().toString(), name: name.trim(), phone: phone.trim() }];
    saveContacts(updated);
    setName('');
    setPhone('');
  };

  const removeContact = (id) => {
    saveContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        These people receive an SMS with your GPS location if a crash is detected.
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name (e.g. Mom)"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone (+33 6 12 34 56 78)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Text style={styles.addButtonText}>+ Add Contact</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No contacts yet. Add at least one!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.contactRow}>
            <View>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => removeContact(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  subtitle: { color: COLORS.slate, fontSize: 13, marginBottom: 20, lineHeight: 19 },
  form: { marginBottom: 24 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.midGray,
  },
  addButton: {
    backgroundColor: COLORS.red,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFF', fontWeight: 'bold' },
  contactRow: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: { fontWeight: 'bold', color: COLORS.charcoal, fontSize: 15 },
  contactPhone: { color: COLORS.slate, fontSize: 13, marginTop: 2 },
  remove: { color: COLORS.red, fontWeight: '600' },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 30 },
});
