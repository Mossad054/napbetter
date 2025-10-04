import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getColors } from '@/constants/theme';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';

interface FeaturesSettingsProps {
  isDarkMode: boolean;
}

const FeaturesSettings: React.FC<FeaturesSettingsProps> = ({ isDarkMode }) => {
  const COLORS = getColors(isDarkMode);
  const router = useRouter();
  
  const handleSupabaseTest = () => {
    router.push('/supabase-test');
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.infoText, { color: COLORS.textSecondary }]}>
        Customize which features are enabled in the app
      </Text>
      {/* Add feature toggles here as needed */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: COLORS.surfaceLight }]}
        onPress={handleSupabaseTest}
      >
        <Text style={[styles.buttonText, { color: COLORS.primary }]}>
          Supabase Integration Test
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600' as const,
  },
});

export default FeaturesSettings;