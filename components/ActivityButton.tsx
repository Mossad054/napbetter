import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Activity } from '@/types/mood';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import * as Icons from 'lucide-react-native';

interface ActivityButtonProps {
  activity: Activity;
  selected: boolean;
  onPress: () => void;
}

export default function ActivityButton({ activity, selected, onPress }: ActivityButtonProps) {
  const IconComponent = (Icons as any)[activity.icon] || Icons.Circle;
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <IconComponent 
          size={24} 
          color={selected ? COLORS.primary : COLORS.textSecondary}
        />
      </View>
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {activity.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    minWidth: 80,
    margin: SPACING.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});