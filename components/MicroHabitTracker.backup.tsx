import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { MicroHabitRecommendation } from '@/types/mood';
import { CheckCircle, Target, Flame, Sparkles, Heart, Activity, Bell, Play, ThumbsUp, ThumbsDown, Clock, Plus, Brain } from 'lucide-react-native';
import AddHabitModal from '@/components/AddHabitModal';
import { useHabits } from '@/hooks/use-habits';
import TimePickerModal from '@/components/TimePickerModal';
import Toast from '@/components/Toast';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface MicroHabitTrackerProps {
  recommendations?: MicroHabitRecommendation[];
  onHabitToggle?: (habitId: string, completed: boolean) => void;
  onHabitAdd?: (habit: ExtendedMicroHabitRecommendation) => void;
}

export interface ExtendedMicroHabitRecommendation extends MicroHabitRecommendation {
  isActive?: boolean;
  startDate?: string;
  duration?: number;
  reminderEnabled?: boolean;
  reminderTime?: string;
  lastFeedback?: 'good' | 'neutral' | 'bad';
  totalCompleted?: number;
}

const generateMotivationalNudge = (habit: ExtendedMicroHabitRecommendation): string => {
  if (habit.isCompletedToday) {
    if (habit.streak >= 30) {
      return "Incredible consistency! You're building a powerful habit!";
    } else if (habit.streak >= 14) {
      return "Great job! Two weeks of consistency is impressive!";
    } else if (habit.streak >= 7) {
      return "Weekly streak! You're building momentum!";
    } else if (habit.streak >= 3) {
      return "Three days in a row - you're on a roll!";
    } else {
      return "Great start! Keep up the good work!";
    }
  } else {
    if (habit.streak >= 30) {
      return "Don't break your month-long streak! You've got this!";
    } else if (habit.streak >= 14) {
      return "Protect your two-week streak! Just one more check!";
    } else if (habit.streak >= 7) {
      return "Keep your weekly streak going!";
    } else if (habit.streak > 0) {
      return "Continue your streak today!";
    } else {
      return "Start building a positive habit today!";
    }
  }
};

const sampleRecommendations: ExtendedMicroHabitRecommendation[] = [];

export default function MicroHabitTracker({ 
  recommendations = sampleRecommendations,
  onHabitToggle,
  onHabitAdd
}: MicroHabitTrackerProps) {
  const { 
    habits: userHabits, 
    completeHabit, 
    undoHabitCompletion, 
    updateHabit, 
    isHabitCompletedToday,
    addHabit
  } = useHabits();
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [addHabitModalVisible, setAddHabitModalVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('21:00');
  
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [userHabits]);
  
  const allHabits = [
    ...recommendations, 
    ...userHabits.map(habit => {
      // Map UserHabit properties to ExtendedMicroHabitRecommendation properties
      const mappedHabit: any = {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        // Map category - need to handle the mismatch between Habit.category and MicroHabitRecommendation.category
        category: habit.category === 'anxiety' || habit.category === 'productivity' || habit.category === 'mentalClarity' 
          ? 'health' 
          : habit.category,
        streak: habit.streak,
        isCompletedToday: isHabitCompletedToday(habit.id),
        lastCompleted: habit.lastCompleted,
        isActive: true, // Default to active for user habits
        startDate: habit.createdAt,
        duration: 7, // Default duration
        reminderEnabled: habit.notificationsEnabled,
        reminderTime: undefined, // UserHabit doesn't have this property
        totalCompleted: habit.streak, // Use streak as approximation
        lastFeedback: habit.feedback === 'positive' ? 'good' : habit.feedback === 'negative' ? 'bad' : undefined
      };
      
      return {
        ...mappedHabit,
        motivationNudge: generateMotivationalNudge(mappedHabit)
      };
    })
  ];
  
  const handleHabitToggle = (habitId: string) => {
    const isCurrentlyCompleted = isHabitCompletedToday(habitId);
    
    if (isCurrentlyCompleted) {
      undoHabitCompletion(habitId);
    } else {
      completeHabit(habitId);
    }
    
    onHabitToggle?.(habitId, !isCurrentlyCompleted);
  };

  const handleStartHabit = (habitId: string) => {
    // UserHabit doesn't have isActive property, so we'll use notes to track active status
    updateHabit(habitId, { notes: 'active' });
  };

  const handleReminderToggle = (habitId: string, enabled: boolean) => {
    updateHabit(habitId, { notificationsEnabled: enabled });
  };

  const showTimePicker = (habitId: string, currentTime?: string) => {
    setSelectedHabitId(habitId);
    setSelectedTime(currentTime || '21:00');
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
    setSelectedHabitId(null);
  };

  const handleTimeConfirm = (time: string) => {
    if (selectedHabitId) {
      // We'll store the time in notes since UserHabit doesn't have reminderTime
      updateHabit(selectedHabitId, { notes: `Reminder time: ${time}` });
    }
    hideTimePicker();
  };

  const handleFeedback = (habitId: string, feedback: 'good' | 'neutral' | 'bad') => {
    completeHabit(habitId, feedback);
    const feedbackText = feedback === 'good' ? '👍 Good' : feedback === 'neutral' ? '😐 Neutral' : '👎 Bad';
    Alert.alert('Feedback Saved', `Thank you for your feedback: ${feedbackText}`);
  };

  const handleAddCustomHabit = () => {
    setAddHabitModalVisible(true);
  };

  const handleCustomHabitConfirm = (habit: ExtendedMicroHabitRecommendation) => {
    addHabit({
      title: habit.title,
      description: habit.description,
      category: habit.category as any, // Type assertion to handle category mismatch
      frequency: 'daily',
      difficulty: 'medium',
      evidenceBased: false,
      createdAt: new Date().toISOString().split('T')[0],
      notificationsEnabled: habit.reminderEnabled || false,
    });
    
    onHabitAdd?.(habit);
    setAddHabitModalVisible(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return <Target color={COLORS.primary} size={16} />;
      case 'mindfulness':
        return <Sparkles color={COLORS.success} size={16} />;
      case 'intimacy':
        return <Heart color="#FF69B4" size={16} />;
      case 'mood':
        return <Heart color={COLORS.error} size={16} />;
      case 'health':
        return <Activity color={COLORS.warning} size={16} />;
      case 'anxiety':
        return <Activity color={COLORS.warning} size={16} />;
      case 'mentalClarity':
        return <Brain color={COLORS.success} size={16} />;
      default:
        return <CheckCircle color={COLORS.textSecondary} size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep':
        return COLORS.primary;
      case 'mindfulness':
        return COLORS.success;
      case 'intimacy':
        return '#FF69B4';
      case 'mood':
        return COLORS.error;
      case 'health':
        return COLORS.warning;
      case 'anxiety':
        return COLORS.warning;
      case 'mentalClarity':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const renderProgressVisualization = (habit: ExtendedMicroHabitRecommendation) => {
    if (!habit.isActive || !habit.duration) return null;
    
    const totalDays = habit.duration;
    const completedDays = habit.totalCompleted || 0;
    const progressPercentage = Math.min(100, (completedDays / totalDays) * 100);
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Day {completedDays}/{totalDays}</Text>
          <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: progressPercentage === 100 ? COLORS.success : COLORS.primary
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderStartButton = (habit: ExtendedMicroHabitRecommendation) => {
    if (habit.isActive) return null;
    
    return (
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => handleStartHabit(habit.id)}
      >
        <Play color={COLORS.primary} size={16} />
        <Text style={styles.startButtonText}>Start Habit</Text>
      </TouchableOpacity>
    );
  };

  const renderMarkDoneButton = (habit: ExtendedMicroHabitRecommendation) => {
    if (!habit.isActive) return null;
    
    const isCompletedToday = isHabitCompletedToday(habit.id);
    
    return (
      <TouchableOpacity 
        style={[
          styles.markDoneButton,
          isCompletedToday && styles.markDoneButtonCompleted
        ]}
        onPress={() => handleHabitToggle(habit.id)}
      >
        <CheckCircle 
          color={isCompletedToday ? COLORS.success : COLORS.textTertiary} 
          size={20} 
          fill={isCompletedToday ? COLORS.success : 'none'} 
        />
        <Text style={[
          styles.markDoneButtonText,
          isCompletedToday && styles.markDoneButtonTextCompleted
        ]}>
          {isCompletedToday ? 'Completed Today' : 'Mark as Done'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFeedbackPrompt = (habit: ExtendedMicroHabitRecommendation) => {
    const isCompletedToday = isHabitCompletedToday(habit.id);
    const hasFeedback = habit.lastFeedback;
    
    if (!isCompletedToday || hasFeedback) return null;
    
    return (
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>How did this habit feel?</Text>
        <View style={styles.feedbackButtons}>
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={() => handleFeedback(habit.id, 'good')}
          >
            <ThumbsUp color={COLORS.success} size={16} />
            <Text style={[styles.feedbackButtonText, { color: COLORS.success }]}>Good</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={() => handleFeedback(habit.id, 'neutral')}
          >
            <Text style={[styles.feedbackButtonText, { color: COLORS.textSecondary }]}>Neutral</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={() => handleFeedback(habit.id, 'bad')}
          >
            <ThumbsDown color={COLORS.error} size={16} />
            <Text style={[styles.feedbackButtonText, { color: COLORS.error }]}>Bad</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderReminderOption = (habit: ExtendedMicroHabitRecommendation) => {
    if (!habit.isActive) return null;
    
    return (
      <>
        <View style={styles.reminderContainer}>
          <Bell color={COLORS.textSecondary} size={16} />
          <Text style={styles.reminderText}>Reminder</Text>
          <Switch
            value={habit.reminderEnabled || false}
            onValueChange={(value) => handleReminderToggle(habit.id, value)}
            trackColor={{ false: COLORS.backgroundSecondary, true: COLORS.primary }}
          />
          {habit.reminderEnabled && (
            <TouchableOpacity 
              style={styles.reminderTimeButton}
              onPress={() => showTimePicker(habit.id, habit.reminderTime)}
            >
              <Clock color={COLORS.primary} size={16} />
              <Text style={styles.reminderTimeText}>
                {habit.reminderTime || 'Set Time'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TimePickerModal
          visible={timePickerVisible && selectedHabitId === habit.id}
          onClose={hideTimePicker}
          onConfirm={handleTimeConfirm}
          selectedTime={selectedTime}
        />
      </>
    );
  };

  return (
    <View key={refreshKey} style={styles.container}> 
      <View style={styles.header}>
        <Text style={styles.title}>My Active Habits</Text>
        <Text style={styles.subtitle}>Track your daily habits and build consistency</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.habitsContainer}
      >
        {allHabits.map((habit) => (
          <View key={habit.id} style={styles.habitCard}>
            <View style={styles.habitHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(habit.category) + '20' }]}>
                {getCategoryIcon(habit.category)}
                <Text style={[styles.categoryText, { color: getCategoryColor(habit.category) }]}>
                  {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                </Text>
              </View>
              
              <View style={styles.habitActions}>
                {renderStartButton(habit)}
                {renderMarkDoneButton(habit)}
              </View>
            </View>
            
            <Text style={styles.habitTitle}>{habit.title}</Text>
            <Text style={styles.habitDescription}>{habit.description}</Text>
            
            {renderProgressVisualization(habit)}
            
            <View style={styles.streakContainer}>
              <Flame color={COLORS.warning} size={16} />
              <Text style={styles.streakText}>{habit.streak} day streak</Text>
            </View>
            
            {renderReminderOption(habit)}
            {renderFeedbackPrompt(habit)}
            
            {habit.motivationNudge && (
              <View style={styles.motivationContainer}>
                <Text style={styles.motivationText}>✨ {habit.motivationNudge}</Text>
              </View>
            )}
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.addHabitCard}
          onPress={handleAddCustomHabit}
        >
          <View style={styles.addHabitContent}>
            <Plus color={COLORS.primary} size={24} />
            <Text style={styles.addHabitText}>Add Custom Habit</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      
      <AddHabitModal
        visible={addHabitModalVisible}
        onClose={() => setAddHabitModalVisible(false)}
        onAdd={handleCustomHabitConfirm}
      />
      
      <Toast 
        message={toastMessage} 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </View>
  );
}

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
  habitsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  habitCard: {
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
  addHabitCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: 280,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addHabitContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addHabitText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  habitHeader: {
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
  habitActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  startButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  markDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  markDoneButtonCompleted: {
    backgroundColor: COLORS.success + '20',
  },
  markDoneButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  markDoneButtonTextCompleted: {
    color: COLORS.success,
  },
  habitTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  habitDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  progressPercentage: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  streakText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    fontWeight: '600',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  reminderText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  reminderTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary + '20',
    borderRadius: BORDER_RADIUS.sm,
  },
  reminderTimeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  feedbackContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
  },
  feedbackTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.xs,
  },
  feedbackButtonText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  motivationContainer: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  motivationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timePickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '80%',
    alignItems: 'center',
  },
  timePickerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  timePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  picker: {
    height: 150,
    width: 80,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
  },
  timePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timePickerButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SPACING.sm,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  confirmButtonText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '600',
  },
});