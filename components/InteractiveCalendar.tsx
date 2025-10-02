import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { 
  X, 
  Heart, 
  Moon, 
  Brain, 
  Activity
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { CalendarDayData, TimelineEntry, IntimacyEntry } from '@/types/mood';
import { MOODS } from '@/constants/moods';

interface InteractiveCalendarProps {
  onDateSelect?: (date: string) => void;
}

interface MarkedDates {
  [key: string]: {
    dots?: { key: string; color: string }[];
    marked?: boolean;
    dotColor?: string;
  };
}

export default function InteractiveCalendar({ onDateSelect }: InteractiveCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showDayDetail, setShowDayDetail] = useState<boolean>(false);
  const [dayData, setDayData] = useState<CalendarDayData | null>(null);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  useEffect(() => {
    generateSampleData();
  }, []);

  const generateSampleData = () => {
    const today = new Date();
    const marked: MarkedDates = {};
    
    // Generate sample data for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dots = [];
      
      // Random mood indicator
      if (Math.random() > 0.3) {
        const moodIndex = Math.floor(Math.random() * MOODS.length);
        dots.push({ key: 'mood', color: MOODS[moodIndex].color });
      }
      
      // Random sleep quality
      if (Math.random() > 0.4) {
        const sleepQuality = Math.floor(Math.random() * 5) + 1;
        const sleepColor = sleepQuality >= 4 ? COLORS.success : sleepQuality >= 3 ? COLORS.warning : COLORS.error;
        dots.push({ key: 'sleep', color: sleepColor });
      }
      
      // Random mental clarity
      if (Math.random() > 0.5) {
        dots.push({ key: 'clarity', color: COLORS.primary });
      }
      
      // Random intimacy activity
      if (Math.random() > 0.8) {
        dots.push({ key: 'intimacy', color: '#FF69B4' });
      }
      
      if (dots.length > 0) {
        marked[dateString] = { dots, marked: true };
      }
    }
    
    setMarkedDates(marked);
  };

  const handleDatePress = (day: DateData) => {
    setSelectedDate(day.dateString);
    generateDayData(day.dateString);
    setShowDayDetail(true);
    onDateSelect?.(day.dateString);
  };

  const generateDayData = (date: string) => {
    // Generate sample timeline data for the selected day
    const timelineEntries: TimelineEntry[] = [];
    
    // Morning mood
    if (Math.random() > 0.3) {
      timelineEntries.push({
        id: `mood-morning-${date}`,
        timestamp: `${date}T08:30:00Z`,
        type: 'mood',
        timeOfDay: 'morning',
        data: {
          mood: MOODS[Math.floor(Math.random() * MOODS.length)],
          note: 'Feeling good this morning!'
        }
      });
    }
    
    // Afternoon activities
    if (Math.random() > 0.4) {
      timelineEntries.push({
        id: `activity-afternoon-${date}`,
        timestamp: `${date}T14:15:00Z`,
        type: 'activity',
        timeOfDay: 'afternoon',
        data: {
          name: 'Exercise',
          icon: 'activity'
        }
      });
    }
    
    // Evening mood
    if (Math.random() > 0.2) {
      timelineEntries.push({
        id: `mood-evening-${date}`,
        timestamp: `${date}T20:45:00Z`,
        type: 'mood',
        timeOfDay: 'evening',
        data: {
          mood: MOODS[Math.floor(Math.random() * MOODS.length)],
          note: 'Reflecting on the day'
        }
      });
    }
    
    // Intimacy activity
    if (Math.random() > 0.8) {
      const intimacyEntry: IntimacyEntry = {
        id: `intimacy-${date}`,
        date,
        timeOfDay: Math.random() > 0.5 ? 'evening' : 'morning',
        type: Math.random() > 0.6 ? 'couple' : 'solo',
        orgasmed: Math.random() > 0.3,
        emotionalStateBefore: Math.floor(Math.random() * 5) + 1,
        emotionalStateAfter: Math.floor(Math.random() * 5) + 1
      };
      
      timelineEntries.push({
        id: `intimacy-timeline-${date}`,
        timestamp: `${date}T${intimacyEntry.timeOfDay === 'morning' ? '09:00:00' : '22:00:00'}Z`,
        type: 'intimacy',
        timeOfDay: intimacyEntry.timeOfDay,
        data: intimacyEntry
      });
    }
    
    const sampleDayData: CalendarDayData = {
      date,
      moods: timelineEntries
        .filter(entry => entry.type === 'mood')
        .map(entry => ({
          mood: entry.data.mood,
          timeOfDay: entry.timeOfDay,
          timestamp: entry.timestamp
        })),
      sleepQuality: Math.random() > 0.4 ? Math.floor(Math.random() * 5) + 1 : undefined,
      mentalClarity: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : undefined,
      intimacyActivities: timelineEntries
        .filter(entry => entry.type === 'intimacy')
        .map(entry => entry.data),
      activities: [],
      note: Math.random() > 0.7 ? 'Had a great day overall!' : undefined
    };
    
    setDayData(sampleDayData);
  };

  const renderTimelineEntry = (entry: TimelineEntry) => {
    const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return (
      <View key={entry.id} style={styles.timelineEntry}>
        <View style={styles.timelineTime}>
          <Text style={styles.timelineTimeText}>{time}</Text>
        </View>
        
        <View style={styles.timelineDot} />
        
        <View style={styles.timelineContent}>
          {entry.type === 'mood' && (
            <View style={styles.moodEntry}>
              <Text style={styles.moodEmoji}>{entry.data.mood.emoji}</Text>
              <View>
                <Text style={styles.entryTitle}>{entry.data.mood.name}</Text>
                {entry.data.note && (
                  <Text style={styles.entryNote}>{entry.data.note}</Text>
                )}
              </View>
            </View>
          )}
          
          {entry.type === 'activity' && (
            <View style={styles.activityEntry}>
              <Activity color={COLORS.primary} size={20} />
              <Text style={styles.entryTitle}>{entry.data.name}</Text>
            </View>
          )}
          
          {entry.type === 'intimacy' && (
            <View style={styles.intimacyEntry}>
              <Heart color="#FF69B4" size={20} />
              <View>
                <Text style={styles.entryTitle}>
                  {entry.data.type === 'couple' ? 'Couple' : 'Solo'} Intimacy
                </Text>
                <Text style={styles.entryNote}>
                  Before: {entry.data.emotionalStateBefore}/5 → After: {entry.data.emotionalStateAfter}/5
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderDayDetailModal = () => {
    if (!dayData) return null;
    
    const timelineEntries: TimelineEntry[] = [];
    
    // Add mood entries to timeline
    dayData.moods.forEach(moodEntry => {
      timelineEntries.push({
        id: `mood-${moodEntry.timestamp}`,
        timestamp: moodEntry.timestamp,
        type: 'mood',
        timeOfDay: moodEntry.timeOfDay,
        data: {
          mood: moodEntry.mood,
          note: 'Mood entry'
        }
      });
    });
    
    // Add intimacy entries to timeline
    dayData.intimacyActivities.forEach(intimacyEntry => {
      timelineEntries.push({
        id: `intimacy-${intimacyEntry.id}`,
        timestamp: `${dayData.date}T${intimacyEntry.timeOfDay === 'morning' ? '09:00:00' : '22:00:00'}Z`,
        type: 'intimacy',
        timeOfDay: intimacyEntry.timeOfDay,
        data: intimacyEntry
      });
    });
    
    // Sort by timestamp
    timelineEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return (
      <Modal
        visible={showDayDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDayDetail(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <TouchableOpacity
              onPress={() => setShowDayDetail(false)}
              style={styles.closeButton}
            >
              <X color={COLORS.text} size={24} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Day Summary */}
            <View style={styles.daySummary}>
              <View style={styles.summaryGrid}>
                {dayData.sleepQuality && (
                  <View style={styles.summaryItem}>
                    <Moon color={COLORS.primary} size={20} />
                    <Text style={styles.summaryLabel}>Sleep</Text>
                    <Text style={styles.summaryValue}>{dayData.sleepQuality}/5</Text>
                  </View>
                )}
                
                {dayData.mentalClarity && (
                  <View style={styles.summaryItem}>
                    <Brain color={COLORS.success} size={20} />
                    <Text style={styles.summaryLabel}>Clarity</Text>
                    <Text style={styles.summaryValue}>{dayData.mentalClarity}/5</Text>
                  </View>
                )}
                
                <View style={styles.summaryItem}>
                  <Heart color={COLORS.error} size={20} />
                  <Text style={styles.summaryLabel}>Moods</Text>
                  <Text style={styles.summaryValue}>{dayData.moods.length}</Text>
                </View>
              </View>
            </View>
            
            {/* Timeline */}
            <View style={styles.timelineSection}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              
              {timelineEntries.length > 0 ? (
                <View style={styles.timeline}>
                  {timelineEntries.map(renderTimelineEntry)}
                </View>
              ) : (
                <Text style={styles.emptyState}>No entries for this day</Text>
              )}
            </View>
            
            {/* Notes */}
            {dayData.note && (
              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.noteText}>{dayData.note}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDatePress}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          backgroundColor: COLORS.background,
          calendarBackground: COLORS.surface,
          textSectionTitleColor: COLORS.textSecondary,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: COLORS.surface,
          todayTextColor: COLORS.primary,
          dayTextColor: COLORS.text,
          textDisabledColor: COLORS.textSecondary,
          dotColor: COLORS.primary,
          selectedDotColor: COLORS.surface,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.text,
          indicatorColor: COLORS.primary,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14
        }}
        style={styles.calendar}
      />
      
      {renderDayDetailModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: BORDER_RADIUS.lg,
  },
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
  daySummary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  summaryValue: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  timelineSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  timeline: {
    paddingLeft: SPACING.md,
  },
  timelineEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  timelineTime: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: SPACING.sm,
  },
  timelineTimeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginHorizontal: SPACING.sm,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  moodEntry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  activityEntry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intimacyEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  entryTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  entryNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  notesSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  noteText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 20,
  },
  emptyState: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: SPACING.xl,
  },
});