import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { AlertTriangle, Wind, Brain, RotateCcw, BookOpen } from 'lucide-react-native';

interface TriggerDetectionProps {
  triggers: string[];
  onSuggestionPress: (suggestion: string) => void;
}

const TriggerDetection: React.FC<TriggerDetectionProps> = ({ triggers, onSuggestionPress }) => {
  const suggestions = [
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      description: '4-7-8 breathing to calm your nervous system',
      icon: <Wind color={COLORS.primary} size={24} />,
    },
    {
      id: 'meditation',
      title: 'Meditation',
      description: '5-minute mindfulness meditation',
      icon: <Brain color={COLORS.success} size={24} />,
    },
    {
      id: 'cbt',
      title: 'CBT Reframing',
      description: 'Challenge negative thought patterns',
      icon: <RotateCcw color={COLORS.warning} size={24} />,
    },
    {
      id: 'therapy',
      title: 'Therapy Resources',
      description: 'Access guided therapy exercises',
      icon: <BookOpen color={COLORS.accent} size={24} />,
    },
  ];

  if (triggers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AlertTriangle color={COLORS.warning} size={24} />
        <Text style={styles.title}>Potential Triggers Detected</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.triggersContainer}>
        {triggers.map((trigger, index) => (
          <View key={index} style={styles.triggerTag}>
            <Text style={styles.triggerText}>{trigger}</Text>
          </View>
        ))}
      </ScrollView>
      
      <Text style={styles.suggestionsTitle}>Recommended Actions</Text>
      
      <View style={styles.suggestionsContainer}>
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.suggestionCard}
            onPress={() => onSuggestionPress(suggestion.id)}
          >
            <View style={styles.suggestionHeader}>
              {suggestion.icon}
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            </View>
            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    margin: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  triggersContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  triggerTag: {
    backgroundColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
  },
  triggerText: {
    ...TYPOGRAPHY.caption,
    color: 'white',
    fontWeight: '600',
  },
  suggestionsTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  suggestionsContainer: {
    gap: SPACING.md,
  },
  suggestionCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  suggestionTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  suggestionDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});

export default TriggerDetection;