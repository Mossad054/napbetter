import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { getColors } from '@/constants/theme';
import { SPACING } from '@/constants/theme';

interface FeaturesSettingsProps {
  isDarkMode: boolean;
}

const FeaturesSettings: React.FC<FeaturesSettingsProps> = ({ isDarkMode }) => {
  const COLORS = getColors(isDarkMode);
  
  return (
    <View style={styles.container}>
      <Text style={[styles.infoText, { color: COLORS.textSecondary }]}>
        Customize which features are enabled in the app
      </Text>
      {/* Add feature toggles here as needed */}
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
});

export default FeaturesSettings;