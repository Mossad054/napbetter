import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Target, Clock, TrendingUp, Heart, Brain, Moon, Activity } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Habit } from '@/constants/habits';

interface HabitDetailModalProps {
  visible: boolean;
  onClose: () => void;
  habit: Habit | null;
  onStartHabit: (habit: Habit) => void;
}

export default function HabitDetailModal({ 
  visible, 
  onClose, 
  habit,
  onStartHabit
}: HabitDetailModalProps) {
  if (!habit) return null;

  const getCategoryDetails = () => {
    switch (habit.category) {
      case 'sleep':
        return {
          icon: Moon,
          color: COLORS.primary,
          name: 'Sleep',
          importance: 'Quality sleep is essential for physical recovery, mental clarity, and emotional regulation. It affects every aspect of your wellbeing.',
          results: 'Better energy levels, improved mood, enhanced cognitive function, stronger immune system'
        };
      case 'mood':
        return {
          icon: Heart,
          color: COLORS.error,
          name: 'Mood',
          importance: 'Managing your mood helps you maintain emotional balance, build resilience, and enjoy life more fully.',
          results: 'Increased happiness, reduced stress, better relationships, improved self-esteem'
        };
      case 'anxiety':
        return {
          icon: Activity,
          color: COLORS.warning,
          name: 'Anxiety',
          importance: 'Managing anxiety helps you feel more calm and in control, allowing you to face challenges with confidence.',
          results: 'Reduced stress, better focus, improved sleep, enhanced overall wellbeing'
        };
      case 'mentalClarity':
        return {
          icon: Brain,
          color: COLORS.success,
          name: 'Mental Clarity',
          importance: 'Mental clarity helps you think more clearly, make better decisions, and stay focused on your goals.',
          results: 'Improved focus, better decision-making, enhanced creativity, reduced mental fog'
        };
      case 'intimacy':
        return {
          icon: Heart,
          color: '#FF69B4',
          name: 'Intimacy',
          importance: 'Intimacy contributes to emotional connection, stress relief, and overall life satisfaction.',
          results: 'Stronger relationships, reduced stress, increased happiness, better emotional health'
        };
      case 'health':
        return {
          icon: Activity,
          color: COLORS.accent,
          name: 'Health',
          importance: 'Good health habits form the foundation for all other areas of wellbeing and life satisfaction.',
          results: 'Increased energy, better mood, reduced disease risk, improved longevity'
        };
      case 'productivity':
        return {
          icon: Target,
          color: COLORS.accent,
          name: 'Productivity',
          importance: 'Productivity habits help you accomplish your goals efficiently while maintaining work-life balance.',
          results: 'Better time management, increased accomplishments, reduced stress, enhanced confidence'
        };
      default:
        return {
          icon: Target,
          color: COLORS.textSecondary,
          name: habit.category,
          importance: 'This habit contributes to your overall wellbeing and personal growth.',
          results: 'Improved quality of life and personal development'
        };
    }
  };

  const getDifficultyLabel = () => {
    switch (habit.difficulty) {
      case 'easy': return 'Beginner Friendly';
      case 'medium': return 'Moderate Challenge';
      case 'hard': return 'Advanced Level';
      default: return 'Moderate Challenge';
    }
  };

  const getFrequencyLabel = () => {
    switch (habit.frequency) {
      case 'daily': return 'Daily Practice';
      case 'weekly': return 'Weekly Practice';
      case 'custom': return 'Flexible Schedule';
      default: return 'Regular Practice';
    }
  };

  const categoryDetails = getCategoryDetails();
  const IconComponent = categoryDetails.icon;

  const handleStartHabit = () => {
    onStartHabit(habit);
    onClose();
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Habit Details</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={COLORS.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.habitHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryDetails.color + '20' }]}>
                <IconComponent color={categoryDetails.color} size={20} />
                <Text style={[styles.categoryText, { color: categoryDetails.color }]}>
                  {categoryDetails.name}
                </Text>
              </View>
              <Text style={styles.habitTitle}>{habit.title}</Text>
              <Text style={styles.habitDescription}>{habit.description}</Text>
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Target color={COLORS.primary} size={20} />
                  <Text style={styles.detailTitle}>Difficulty & Frequency</Text>
                </View>
                <Text style={styles.detailText}>{getDifficultyLabel()}</Text>
                <Text style={styles.detailText}>{getFrequencyLabel()}</Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Heart color={COLORS.error} size={20} />
                  <Text style={styles.detailTitle}>Importance</Text>
                </View>
                <Text style={styles.detailText}>{categoryDetails.importance}</Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <TrendingUp color={COLORS.success} size={20} />
                  <Text style={styles.detailTitle}>Expected Results</Text>
                </View>
                <Text style={styles.detailText}>{categoryDetails.results}</Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Clock color={COLORS.warning} size={20} />
                  <Text style={styles.detailTitle}>Getting Started</Text>
                </View>
                <Text style={styles.detailText}>
                  Start small and build consistency. Focus on performing this habit at the same time each day or week. 
                  Track your progress to stay motivated and adjust as needed.
                </Text>
              </View>

              {habit.evidenceBased && (
                <View style={styles.evidenceBadge}>
                  <Text style={styles.evidenceText}>🔬 Evidence-Based Practice</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartHabit}
          >
            <Text style={styles.startButtonText}>Start This Habit with Tracking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '90%',
    maxHeight: '80%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  } as any,
  scrollContent: {
    flex: 1,
  },
  habitHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  habitTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  } as any,
  habitDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  } as any,
  detailsSection: {
    gap: SPACING.md,
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontSize: 18,
  } as any,
  detailText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  } as any,
  evidenceBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  evidenceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  startButtonText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '600' as '600',
  },
});