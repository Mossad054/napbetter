import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { X, Heart, Moon, Brain, Activity as ActivityIcon, Check, X as XIcon } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { CalendarDayData, Mood, Activity } from '@/types/mood';
import { HABIT_LIBRARY } from '@/constants/habits';
import { MOODS } from '@/constants/moods';

// Types for the original data structure (from Add Entry page)
interface MoodData {
  emoji: string;
  score: number;
  note: string;
}

interface ActivityData {
  emoji: string;
  name: string;
  category: string;
  duration: number;
  impact: number;
}

interface SleepData {
  hours: number;
  quality: string;
  bedtime: string;
  wake: string;
  impact: string;
}

interface ClarityData {
  score: number;
  factors: string[];
}

interface HabitData {
  name: string;
  completed: boolean;
}

// Types for the new mock data structure (from Intimacy page)
interface MockMoodData {
  emoji: string;
  score: number;
}

interface MockActivityData {
  emoji: string;
  name: string;
  category: string;
  duration: string;
  impact: string;
}

interface MockSleepData {
  hours: number;
  quality: string;
  bedtime: string;
  wake: string;
}

interface MockClarityData {
  score: number;
  factors: string[];
}

interface MockDayData {
  date: string;
  mood: MockMoodData;
  impactSummary: string;
  activities: MockActivityData[];
  sleep: MockSleepData;
  clarity: MockClarityData;
  habits: string[];
  notes: string;
}

// Props for the component - support all data structures
interface DayDetailModalProps {
  visible: boolean;
  onClose: () => void;
  date: string;
  dayData?: CalendarDayData | MockDayData | null;
  data?: {
    mood: MoodData;
    summary: string;
    activities: ActivityData[];
    sleep: SleepData;
    clarity: ClarityData;
    habits: HabitData[];
  } | null;
}

// Mock data for demonstration
const MOCK_ACTIVITIES: Activity[] = [
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

export default function DayDetailModal({ visible, onClose, date, dayData, data }: DayDetailModalProps) {
  // Handle different data structures
  const isCalendarDayData = dayData !== undefined && dayData !== null && !('impactSummary' in dayData);
  const isMockDayData = dayData !== undefined && dayData !== null && 'impactSummary' in dayData;
  
  if (isCalendarDayData) {
    // Using CalendarDayData structure (intimacy page - original)
    if (!dayData) return null;
  } else if (isMockDayData) {
    // Using MockDayData structure (intimacy page - new mock data)
    if (!dayData) return null;
  } else {
    // Using original data structure (add entry page)
    if (!data) return null;
  }

  // Format date
  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate daily impact analysis summary (for CalendarDayData)
  const generateDailyImpactAnalysis = () => {
    if (!isCalendarDayData || !dayData) return "";
    
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

  // Calculate activity impact value (for CalendarDayData)
  const getActivityImpact = (activity: Activity) => {
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
            {formatDate(date)}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <X color={COLORS.text} size={24} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {isCalendarDayData ? (
            // CalendarDayData structure (intimacy page - original)
            <>
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
            </>
          ) : isMockDayData ? (
            // MockDayData structure (intimacy page - new mock data)
            <>
              {/* Header: Show full date, mood emoji, and mood score */}
              <View style={styles.sectionCard}>
                <View style={styles.headerContainer}>
                  <Text style={styles.moodEmoji}>{(dayData as MockDayData).mood.emoji}</Text>
                  <View style={styles.moodInfo}>
                    <Text style={styles.moodTitle}>Mood: {(dayData as MockDayData).mood.score}/5</Text>
                  </View>
                </View>
              </View>

              {/* Daily Impact Analysis */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Daily Impact Analysis</Text>
                <Text style={styles.analysisText}>{(dayData as MockDayData).impactSummary}</Text>
              </View>

              {/* Activities & Impact */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Activities & Impact</Text>
                {(dayData as MockDayData).activities.length > 0 ? (
                  (dayData as MockDayData).activities.map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{activity.name}</Text>
                        <Text style={styles.activityCategory}>{activity.category}</Text>
                      </View>
                      <View style={styles.activityMetrics}>
                        <Text style={styles.activityDuration}>{activity.duration}</Text>
                        <Text style={[
                          styles.activityImpact, 
                          { color: activity.impact.startsWith('+') ? COLORS.success : COLORS.error }
                        ]}>
                          {activity.impact}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No activities logged for this day</Text>
                )}
              </View>

              {/* Sleep Analysis */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Sleep Analysis</Text>
                <View style={styles.sleepSummary}>
                  <Text style={styles.sleepEmoji}>😴</Text>
                  <Text style={styles.sleepHours}>{(dayData as MockDayData).sleep.hours} hours</Text>
                  <Text style={styles.sleepQuality}>{(dayData as MockDayData).sleep.quality} quality</Text>
                </View>
                <View style={styles.sleepTimes}>
                  <Text style={styles.sleepTimeLabel}>Bedtime: {(dayData as MockDayData).sleep.bedtime}</Text>
                  <Text style={styles.sleepTimeSeparator}>|</Text>
                  <Text style={styles.sleepTimeLabel}>Wake: {(dayData as MockDayData).sleep.wake}</Text>
                </View>
                <Text style={styles.sleepImpact}>Sleep contributed positively to your mood and mental clarity.</Text>
              </View>

              {/* Mental Clarity */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Mental Clarity</Text>
                <View style={styles.clarityScoreContainer}>
                  <Text style={styles.clarityScore}>{(dayData as MockDayData).clarity.score}/5</Text>
                </View>
                <View style={styles.clarityFactors}>
                  {(dayData as MockDayData).clarity.factors.map((factor, index) => (
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
                  {(dayData as MockDayData).habits.map((habit, index) => (
                    <View key={index} style={styles.habitItem}>
                      <Text style={styles.habitEmoji}>{habit.charAt(0)}</Text>
                      <Text style={styles.habitName}>{habit.substring(2)}</Text>
                      <Check color={COLORS.success} size={16} />
                    </View>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesContainer}>
                  <Text style={styles.noteText}>{(dayData as MockDayData).notes}</Text>
                </View>
              </View>
            </>
          ) : (
            // Original data structure (add entry page)
            <>
              {/* Header: Show full date, mood emoji, and mood score */}
              <View style={styles.sectionCard}>
                <View style={styles.headerContainer}>
                  <Text style={styles.moodEmoji}>{data?.mood.emoji}</Text>
                  <View style={styles.moodInfo}>
                    <Text style={styles.moodTitle}>Mood: {data?.mood.score}/5</Text>
                    <Text style={styles.moodNote}>{data?.mood.note}</Text>
                  </View>
                </View>
              </View>

              {/* Daily Impact Analysis: Short summary sentence about the day */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Daily Impact Analysis</Text>
                <Text style={styles.summaryText}>{data?.summary}</Text>
              </View>

              {/* Activities & Impact: Emoji, activity name, category, duration, mood impact (+/-) */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Activities & Impact</Text>
                {data?.activities && data.activities.length > 0 ? (
                  data.activities.map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{activity.name}</Text>
                        <Text style={styles.activityCategory}>{activity.category}</Text>
                      </View>
                      <View style={styles.activityMetrics}>
                        <Text style={styles.activityDuration}>
                          {activity.duration >= 60 
                            ? `${Math.floor(activity.duration / 60)}h ${activity.duration % 60}m` 
                            : `${activity.duration}m`}
                        </Text>
                        <Text style={[
                          styles.activityImpact, 
                          { color: activity.impact >= 0 ? COLORS.success : COLORS.error }
                        ]}>
                          {activity.impact >= 0 ? '+' : ''}{activity.impact.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No activities logged for this day</Text>
                )}
              </View>

              {/* Sleep Analysis: Hours slept, quality, bedtime, wake time, and note about impact */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Sleep Analysis</Text>
                <View style={styles.sleepSummary}>
                  <Text style={styles.sleepHours}>{data?.sleep.hours} hours</Text>
                  <Text style={styles.sleepQuality}>{data?.sleep.quality} quality</Text>
                </View>
                <View style={styles.sleepTimes}>
                  <Text style={styles.sleepTimeLabel}>Bedtime: {data?.sleep.bedtime}</Text>
                  <Text style={styles.sleepTimeSeparator}>|</Text>
                  <Text style={styles.sleepTimeLabel}>Wake: {data?.sleep.wake}</Text>
                </View>
                <Text style={styles.sleepImpact}>{data?.sleep.impact}</Text>
              </View>

              {/* Mental Clarity: Score (1–5) with contributing factors listed */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Mental Clarity</Text>
                <View style={styles.clarityScoreContainer}>
                  <Text style={styles.clarityScore}>{data?.clarity.score}/5</Text>
                </View>
                <View style={styles.clarityFactors}>
                  {data?.clarity.factors.map((factor, index) => (
                    <View key={index} style={styles.factorItem}>
                      <Text style={styles.factorBullet}>•</Text>
                      <Text style={styles.factorText}>{factor}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Habits Tracking: Mini streak icons showing which habits were completed */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Habits Tracking</Text>
                <View style={styles.habitsContainer}>
                  {data?.habits.map((habit, index) => (
                    <View key={index} style={styles.habitItem}>
                      <Text style={styles.habitName}>{habit.name}</Text>
                      <View style={[
                        styles.habitStatus, 
                        { backgroundColor: habit.completed ? COLORS.success : COLORS.error }
                      ]}>
                        <Text style={styles.habitStatusText}>
                          {habit.completed ? 'Completed' : 'Missed'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
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
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
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
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  // Styles for CalendarDayData structure
  analysisText: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: COLORS.text,
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
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: COLORS.text,
  },
  activityCategory: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  activityMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  activityDuration: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  activityImpact: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
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
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  sleepQuality: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  sleepTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sleepTimeLabel: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  sleepTimeSeparator: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.sm,
  },
  sleepImpact: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  clarityScoreContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clarityScore: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
    color: COLORS.primary,
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
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  factorText: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
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
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
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
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  // Styles for original data structure
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  moodInfo: {
    flex: 1,
  },
  moodTitle: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    color: COLORS.text,
  },
  moodNote: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: COLORS.text,
  },
  habitsContainer: {
    marginTop: SPACING.sm,
  },
  habitStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  habitStatusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: COLORS.surface,
  },
});