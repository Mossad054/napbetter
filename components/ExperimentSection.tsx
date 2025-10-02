import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TestTube } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface ExperimentSectionProps {
  onPress: () => void;
}

const ExperimentSection: React.FC<ExperimentSectionProps> = ({ onPress }) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <TestTube color={COLORS.primary} size={20} />
        <Text style={styles.sectionTitle}>🧪 Run Your Own Experiments</Text>
      </View>
      <Text style={styles.sectionSubtitle}>
        Test daily activities and see how they affect your mood, sleep, and clarity.
      </Text>
      
      <TouchableOpacity 
        style={styles.experimentButton}
        onPress={onPress}
      >
        <Text style={styles.experimentButtonText}>Start Experiment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: SPACING.lg,
    marginHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  experimentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  experimentButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ExperimentSection;