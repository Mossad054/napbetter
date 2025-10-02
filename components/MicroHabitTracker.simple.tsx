import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { MicroHabitRecommendation } from '@/types/mood';
import { CheckCircle, Target, Flame, Sparkles, Heart, Activity, Bell, Play, ThumbsUp, ThumbsDown, Clock, Plus, Brain } from 'lucide-react-native';
import AddHabitModal from '@/components/AddHabitModal';
import TimePickerModal from '@/components/TimePickerModal';
import Toast from '@/components/Toast';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface MicroHabitTrackerProps {
  recommendations?: MicroHabitRecommendation[];
  onHabitToggle?: (habitId: string, completed: boolean) => void;
  onHabitAdd?: (habit: any) => void;
}

const sampleRecommendations = [
  {
    id: '1',
    title: 'Deep Breathing Exercise',
    description: '5 minutes of diaphragmatic breathing before bed',
    category: 'sleep',
    streak: 3,
    isCompletedToday: false,
    isActive: true,
    startDate: '2025-01-01',
    duration: 7,
    reminderEnabled: true,
    reminderTime: '21:30',
    totalCompleted: 3,
  },
  {
    id: '2',
    title: 'Gratitude Journaling',
    description: 'Write down 3 things you\'re grateful for',
    category: 'mood',
    streak: 7,
    isCompletedToday: true,
    isActive: true,
    startDate: '2025-01-01',
    duration: 14,
    reminderEnabled: false,
    totalCompleted: 7,
  },
  {
    id: '3',
    title: 'Morning Stretch',
    description: '5 minutes of gentle stretching upon waking',
    category: 'health',
    streak: 12,
    isCompletedToday: false,
    isActive: true,
    startDate: '2025-01-01',
    duration: 21,
    reminderEnabled: true,
    reminderTime: '07:00',
    totalCompleted: 12,
  },
];

export default function MicroHabitTracker({ 
  recommendations = sampleRecommendations,
  onHabitToggle,
  onHabitAdd
}: MicroHabitTrackerProps) {
  const [habits, setHabits] = useState<any[]>(sampleRecommendations);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [addHabitModalVisible, setAddHabitModalVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('21:00');
  
  const handleHabitToggle = (habitId: string) => {
    const isCurrentlyCompleted = habits.find(h => h.id === habitId)?.isCompletedToday || false;
    
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          isCompletedToday: !isCurrentlyCompleted,
          streak: !isCurrentlyCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
        };
      }
      return habit;
    });
    
    setHabits(updatedHabits);
    onHabitToggle?.(habitId, !isCurrentlyCompleted);
  };

  const handleStartHabit = (habitId: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          isActive: true,
          startDate: new Date().toISOString().split('T')[0],
        };
      }
      return habit;
    });
    
    setHabits(updatedHabits);
  };

  const handleReminderToggle = (habitId: string, enabled: boolean) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          reminderEnabled: enabled,
        };
      }
      return habit;
    });
    
    setHabits(updatedHabits);
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
      const updatedHabits = habits.map(habit => {
        if (habit.id === selectedHabitId) {
          return {
            ...habit,
            reminderTime: time,
          };
        }
        return habit;
      });
      
      setHabits(updatedHabits);
    }
    hideTimePicker();
  };

  const handleFeedback = (habitId: string, feedback: 'good' | 'neutral' | 'bad') => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          lastFeedback: feedback,
        };
      }
      return habit;
    });
    
    setHabits(updatedHabits);
    
    const feedbackText = feedback === 'good' ? '👍 Good' : feedback === 'neutral' ? '😐 Neutral' : '👎 Bad';
    Alert.alert('Feedback Saved', `Thank you for your feedback: ${feedbackText}`);
  };

  const handleAddCustomHabit = () => {
    setAddHabitModalVisible(true);
  };

  const handleCustomHabitConfirm = (habit: any) => {
    const newHabit = {
      ...habit,
      id: Date.now().toString(),
      streak: 0,
      isCompletedToday: false,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
    };
    
    setHabits([...habits, newHabit]);
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

  const renderProgressVisualization = (habit: any) => {
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

  const renderStartButton = (habit: any) => {
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

  const renderMarkDoneButton = (habit: any) => {
    if (!habit.isActive) return null;
    
    const isCompletedToday = habit.isCompletedToday;
    
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

  const renderFeedbackPrompt = (habit: any) => {
    const isCompletedToday = habit.isCompletedToday;
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

  const renderReminderOption = (habit: any) => {
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
        {habits.map((habit) => (
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