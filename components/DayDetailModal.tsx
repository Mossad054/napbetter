import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { X, Heart, Moon, Brain, Activity, Check, X as XIcon } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { CalendarDayData, TimelineEntry, Activity as ActivityType } from '@/types/mood';
import { HABIT_LIBRARY } from '@/constants/habits';
import { MOODS } from '@/constants/moods';

interface DayDetailModalProps {
  visible: boolean;
  onClose: () => void;
  date: string;
  dayData: CalendarDayData | null;
}

// Mock data for demonstration
const MOCK_ACTIVITIES: ActivityType[] = [
  { id: 1, name: 'Family Time', icon: '👨‍👩‍👧‍👦', category: 'Social', isGood: true },
  { id: 2, name: 'Meetings', icon: '📞', category: 'Work', isGood: false },
  { id: 3, name: 'Meditation', icon: '🧘', category: 'Rest', isGood: true },
  { id: 4, name: 'Reading', icon: '📚', category: 'Hobbies', isGood: true },
];

const MOCK_HABITS = [
  { id: 'health_1', title: 'Drink Water', completed: true },
  { id: 'productivity_1', title: 'Exercise', completed: true },
  { id: 'clarity_2', title: 'Meditate', completed: false },
  { id: 'mood_1', title: 'Journal', completed: true },
];

const MOCK_SLEEP_DATA = {
  hours: 7.7,
  quality: 'good',
  bedtime: '22:01',
  wakeTime: '06:26',
};

const MOCK_MENTAL_CLARITY = {
  score: 5,
  factors: ['Good sleep quality', 'Morning exercise', 'Healthy breakfast'],
};

export default function DayDetailModal({ visible, onClose, date, dayData }: DayDetailModalProps) {
  if (!dayData) return null;

  // Generate daily impact analysis summary
  const generateDailyImpactAnalysis = () => {
    const mood = dayData.moods[0]?.mood;
    const activities = dayData.activities;
    const sleepQuality = dayData.sleepQuality;
    
    if (!mood && activities.length === 0) {
      return "No data available for this day.";
    }
    
    let summary = "";
    if (mood) {
      summary += `You had a ${mood.name} day! `;
    }
    
    if (activities.length > 0) {
      const positiveActivities = activities.filter(a => a.isGood);
      if (positiveActivities.length > 0) {
        const activityNames = positiveActivities.map(a => a.name.toLowerCase()).join(', ');
        summary += `Your mood was boosted by ${activityNames}`;
      }
    }
    
    if (sleepQuality && sleepQuality >= 4) {
      summary += `${activities.length > 0 ? ' and' : ''} getting ${MOCK_SLEEP_DATA.hours} hours of quality sleep.`;
    } else {
      summary += '.';
    }
    
    return summary || "You had a balanced day with various activities.";
  };

  // Calculate activity impact value
  const getActivityImpact = (activity: ActivityType) => {
    // Mock impact values based on activity type
    const impactValues: Record<string, number> = {
      'Family Time': 1.4,
      'Meetings': -0.9,
      'Meditation': 1.1,
      'Reading': 0.9,
    };
    
    return impactValues[activity.name] || (activity.isGood ? 0.5 : -0.3);
  };

  // Get sleep quality text
  const getSleepQualityText = (quality: number) => {
    if (quality >= 4) return 'good quality';
    if (quality >= 3) return 'average quality';
    return 'poor quality';
  };

  // Get sleep impact sentence
  const getSleepImpactSentence = (quality: number) => {
    if (quality >= 4) {
      return "Sleep contributed positively to your mood and mental clarity.";
    } else if (quality >= 3) {
      return "Sleep was okay but could be improved for better mood and clarity.";
    } else {
      return "Poor sleep may have negatively affected your mood and mental clarity.";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <X color={COLORS.text} size={24} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {/* Daily Impact Analysis */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Daily Impact Analysis</Text>
            <Text style={styles.analysisText}>{generateDailyImpactAnalysis()}</Text>
          </View>
          
          {/* Activities & Impact */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Activities & Impact</Text>
            {dayData.activities.length > 0 ? (
              dayData.activities.map((activity, index) => {
                const impact = getActivityImpact(activity);
                return (
                  <View key={index} style={styles.activityItem}>
                    <Text style={styles.activityEmoji}>{activity.icon}</Text>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <Text style={styles.activityCategory}>{activity.category}</Text>
                    </View>
                    <View style={styles.activityMetrics}>
                      <Text style={styles.activityDuration}>65m</Text>
                      <Text style={[
                        styles.activityImpact, 
                        { color: impact >= 0 ? COLORS.success : COLORS.error }
                      ]}>
                        {impact >= 0 ? '✅' : '❌'} {impact >= 0 ? '+' : ''}{impact.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noDataText}>No activities logged for this day</Text>
            )}
          </View>
          
          {/* Sleep Analysis */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Sleep Analysis</Text>
            <View style={styles.sleepSummary}>
              <Text style={styles.sleepEmoji}>😴</Text>
              <Text style={styles.sleepHours}>{MOCK_SLEEP_DATA.hours} hours</Text>
              <Text style={styles.sleepQuality}>{MOCK_SLEEP_DATA.quality} quality</Text>
            </View>
            <View style={styles.sleepTimes}>
              <Text style={styles.sleepTimeLabel}>Bedtime: {MOCK_SLEEP_DATA.bedtime}</Text>
              <Text style={styles.sleepTimeSeparator}>|</Text>
              <Text style={styles.sleepTimeLabel}>Wake: {MOCK_SLEEP_DATA.wakeTime}</Text>
            </View>
            <Text style={styles.sleepImpact}>{getSleepImpactSentence(MOCK_SLEEP_DATA.quality === 'good' ? 5 : 3)}</Text>
          </View>
          
          {/* Mental Clarity */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Mental Clarity</Text>
            <View style={styles.clarityScoreContainer}>
              <Text style={styles.clarityScore}>{MOCK_MENTAL_CLARITY.score}/5</Text>
            </View>
            <View style={styles.clarityFactors}>
              {MOCK_MENTAL_CLARITY.factors.map((factor, index) => (
                <View key={index} style={styles.factorItem}>
                  <Text style={styles.factorBullet}>•</Text>
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Habits Tracking */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Habits Tracking</Text>
            <View style={styles.habitsGrid}>
              {MOCK_HABITS.map((habit, index) => {
                const habitInfo = HABIT_LIBRARY.find(h => h.id === habit.id);
                return (
                  <View key={index} style={styles.habitItem}>
                    <Text style={styles.habitEmoji}>💧</Text>
                    <Text style={styles.habitName}>{habitInfo?.title || habit.title}</Text>
                    {habit.completed ? (
                      <Check color={COLORS.success} size={16} />
                    ) : (
                      <XIcon color={COLORS.error} size={16} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
          
          {/* Notes / Journal */}
          {dayData.note && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.noteText}>{dayData.note}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  analysisText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityEmoji: {
    fontSize: 20,
    width: 30,
  },
  activityInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  activityName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  activityCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  activityMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  activityDuration: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  activityImpact: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  sleepSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sleepEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  sleepHours: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
    marginRight: SPACING.sm,
  },
  sleepQuality: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sleepTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sleepTimeLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sleepTimeSeparator: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.sm,
  },
  sleepImpact: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  clarityScoreContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clarityScore: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  clarityFactors: {
    marginTop: SPACING.sm,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  factorBullet: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  factorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: SPACING.sm,
  },
  habitEmoji: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  habitName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  notesContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  noteText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  noDataText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
});