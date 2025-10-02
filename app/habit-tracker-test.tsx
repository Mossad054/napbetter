import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HabitTrackerCalendar from '@/components/HabitTrackerCalendar';

export default function HabitTrackerTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Habit Tracker</Text>
      <HabitTrackerCalendar />
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