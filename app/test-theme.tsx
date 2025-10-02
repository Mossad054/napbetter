import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/theme';

export default function TestThemeScreen() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <Text style={[styles.text, { color: COLORS.text }]}>
        Current theme: {isDarkMode ? 'Dark' : 'Light'}
      </Text>
      <Text style={[styles.text, { color: COLORS.textSecondary }]}>
        Secondary text
      </Text>
      <Text style={[styles.text, { color: COLORS.primary }]}>
        Primary color
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: COLORS.primary }]}
        onPress={toggleTheme}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>
          Toggle Theme
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});