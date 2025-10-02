import React from 'react';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export default function Index() {
  return <Redirect href={"/(tabs)/home" as Href} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.text,
    fontSize: 18,
    marginBottom: 10,
  },
});