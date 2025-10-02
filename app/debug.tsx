import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export default function DebugScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Screen</Text>
      <Text style={styles.text}>If you can see this, the routing is working correctly.</Text>
      <Text style={styles.text}>The issue might be with one of the tab components.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
});