import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Plus, Target, Moon, Heart, Activity, Brain } from 'lucide-react-native';
import { useHabitRecommendations } from '@/hooks/use-habit-recommendations';
import { useHabits } from '@/hooks/use-habits';
import Toast from '@/components/Toast'; // Import the Toast component

interface HabitSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  reason: string;
}

interface PersonalizedHabitSuggestionsProps {
  onHabitAdded?: () => void; // Callback when a habit is added
}

const CATEGORIES = [
  { id: 'sleep', name: 'Sleep', icon: Moon, color: COLORS.primary, emoji: '🛌' },
  { id: 'mood', name: 'Mood', icon: Heart, color: COLORS.error, emoji: '😊' },
  { id: 'anxiety', name: 'Anxiety', icon: Activity, color: COLORS.warning, emoji: '😟' },
  { id: 'mentalClarity', name: 'Mental Clarity', icon: Brain, color: COLORS.success, emoji: '🧠' },
  { id: 'intimacy', name: 'Intimacy', icon: Heart, color: '#FF69B4', emoji: '❤️' },
  { id: 'health', name: 'Health', icon: Activity, color: COLORS.accent, emoji: '💪' },
];

const PersonalizedHabitSuggestions: React.FC<PersonalizedHabitSuggestionsProps> = ({ onHabitAdded }) => {
  const { smartSuggestions } = useHabitRecommendations();
  const { addHabit } = useHabits();
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filter out dismissed suggestions
  const visibleSuggestions = smartSuggestions.filter(
    suggestion => !dismissedSuggestions.includes(suggestion.id)
  );

  // Limit to 5 suggestions max
  const suggestionsToShow = visibleSuggestions.slice(0, 5);

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    if (category) {
      const IconComponent = category.icon;
      return <IconComponent color={category.color} size={16} />;
    }
    return <Target color={COLORS.textSecondary} size={16} />;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.color : COLORS.textSecondary;
  };

  const getCategoryName = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const handleAddHabit = (suggestion: HabitSuggestion) => {
    try {
      // Add the habit using the useHabits hook
      addHabit({
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category as any,
        duration: 7, // Default 7-day duration
        reminderEnabled: false,
        startDate: new Date().toISOString().split('T')[0],
        isActive: true,
      });

      // Show success toast
      setToastMessage('Added to My Habits ✅');
      setToastVisible(true);

      // Notify parent component that a habit was added
      onHabitAdded?.();

      // Remove the suggestion from the list since it's been added
      setDismissedSuggestions(prev => [...prev, suggestion.id]);
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit. Please try again.');
    }
  };

  const handleDismissSuggestion = (id: string) => {
    setDismissedSuggestions(prev => [...prev, id]);
  };

  if (suggestionsToShow.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personalized Suggestions</Text>
        <Text style={styles.subtitle}>Based on your recent data and patterns</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}
      >
        {suggestionsToShow.map((suggestion) => (
          <View key={suggestion.id} style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(suggestion.category) + '20' }]}>
                {getCategoryIcon(suggestion.category)}
                <Text style={[styles.categoryText, { color: getCategoryColor(suggestion.category) }]}>
                  {getCategoryName(suggestion.category)}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.dismissButton}
                onPress={() => handleDismissSuggestion(suggestion.id)}
              >
                <Text style={styles.dismissButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            <Text style={styles.suggestionReason}>✨ {suggestion.reason}</Text>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleAddHabit(suggestion)}
            >
              <Plus color="white" size={16} />
              <Text style={styles.addButtonText}>Add to My Habits</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Toast Notification */}
      <Toast 
        message={toastMessage} 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    fontWeight: '600',
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  suggestionCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: 280,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  dismissButton: {
    padding: SPACING.xs,
  },
  dismissButtonText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  suggestionTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  suggestionDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  suggestionReason: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    ...TYPOGRAPHY.caption,
    color: 'white',
    fontWeight: '600',
  },
});

export default PersonalizedHabitSuggestions;