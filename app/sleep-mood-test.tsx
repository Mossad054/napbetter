import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SleepMoodCalendar from '@/components/SleepMoodCalendar';

export default function SleepMoodTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sleep & Mood Tracker</Text>
      <SleepMoodCalendar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    margin: 16,
    textAlign: 'center',
  },
});