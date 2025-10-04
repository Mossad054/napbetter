import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Plus, Moon, Brain, Heart } from 'lucide-react-native';
import { useMoodStore } from '@/hooks/mood-store';
import { DayEntry, Mood } from '@/types/mood';
import { getColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import QuickLog from '@/components/QuickLog';
import { JournalService } from '@/services/journal-service';
import DayDetailModal from '@/components/DayDetailModal';

// Mock data for demonstration
const MOCK_MOODS: Mood[] = [
  { id: 1, name: 'awful', color: '#FF4757', value: 1, emoji: '😢' },
  { id: 2, name: 'bad', color: '#FF7F50', value: 2, emoji: '😕' },
  { id: 3, name: 'meh', color: '#5DADE2', value: 3, emoji: '😐' },
  { id: 4, name: 'good', color: '#58D68D', value: 4, emoji: '😊' },
  { id: 5, name: 'rad', color: '#2ECC71', value: 5, emoji: '😄' },
];

export default function CalendarScreen() {
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const { getEntryForDate, getIntimacyEntryForDate, entries } = useMoodStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedEntry, setSelectedEntry] = useState<DayEntry | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [dayData, setDayData] = useState<any>(null);

  const handleQuickLogSave = async (entry: any) => {
    try {
      // For quick logs, we'll create a simple template
      const responses = [
        entry.text,
        `Emotions: ${entry.emotions.join(', ')}`,
        `Triggers: ${entry.triggers.join(', ')}`
      ];
      
      // Save the quick log entry
      const entryId = await JournalService.saveJournalEntry({
        template_id: 'quick_log',
        responses,
      });
      
      console.log('Quick log saved with ID:', entryId);
      // The QuickLog component will handle displaying AI insights
      setShowQuickLog(false);
      
      // Refresh the calendar data to show the new entry
      // This would typically involve updating the state or refetching data
      return entryId;
    } catch (error) {
      console.error('Error saving quick log:', error);
      Alert.alert('Error', 'Failed to save quick log. Please try again.');
      throw error;
    }
  };

  useEffect(() => {
    const loadEntry = async () => {
      setIsLoadingEntry(true);
      try {
        const entry = await getEntryForDate(selectedDate);
        setSelectedEntry(entry);
      } catch (error) {
        console.error('Error loading entry:', error);
        setSelectedEntry(null);
      } finally {
        setIsLoadingEntry(false);
      }
    };
    
    loadEntry();
  }, [selectedDate, getEntryForDate]);

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar data for the current month
  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // Day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Number of days in the month
    const daysInMonth = lastDay.getDate();
    
    // Create array with empty cells for days before the first day of the month
    const calendarDays = Array(firstDayOfWeek).fill(null);
    
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      calendarDays.push({
        date: dateStr,
        day,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isCurrentMonth: true,
        // Mock data - in a real app, you would fetch this from your data source
        mood: Math.random() > 0.7 ? MOCK_MOODS[Math.floor(Math.random() * MOCK_MOODS.length)] : null,
        hasSleepData: Math.random() > 0.8,
        hasMentalClarityData: Math.random() > 0.8,
        hasIntimacyData: Math.random() > 0.9,
      });
    }
    
    return calendarDays;
  };

  // Get detailed data for a specific day
  const getDailyDetailData = async (date: string) => {
    try {
      // Get mood entry
      const moodEntry = await getEntryForDate(date);
      
      // Get intimacy entry
      const intimacyEntry = await getIntimacyEntryForDate(date);
      
      // Create day data object for DayDetailModal
      const dayDetailData = {
        date,
        moods: moodEntry ? [{ 
          mood: moodEntry.mood, 
          timeOfDay: 'evening', // Default time of day
          timestamp: `${date}T20:00:00Z`
        }] : [],
        intimacyActivities: intimacyEntry ? [intimacyEntry] : [],
        activities: moodEntry?.activities || [],
        note: moodEntry?.note,
        sleepQuality: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : undefined,
        mentalClarity: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : undefined,
        // TODO: Add sleep quality and mental clarity when available from real data
      };
      
      return dayDetailData;
    } catch (error) {
      console.error('Error loading day data:', error);
      return null;
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = async (date: string) => {
    if (!date) return;
    
    setSelectedDate(date);
    
    // Create mock data for the selected date
    const mockData = {
      date: date,
      mood: { emoji: "😐", score: 3 },
      impactSummary: "You had a balanced day with a mix of activities. Morning Walk helped maintain your mood, and 7 hours of sleep provided decent rest.",
      activities: [
        { emoji: "🚶", name: "Morning Walk", category: "Exercise", duration: "36m", impact: "+1.1" },
        { emoji: "💻", name: "Deep Work Session", category: "Work", duration: "143m", impact: "-0.3" },
        { emoji: "☕", name: "Coffee with Friend", category: "Social", duration: "71m", impact: "+1.3" },
        { emoji: "🏋️", name: "Gym Workout", category: "Exercise", duration: "54m", impact: "+1.6" }
      ],
      sleep: { hours: 7, quality: "good", bedtime: "22:12", wake: "06:11" },
      clarity: { score: 3, factors: ["Good sleep", "Morning walk"] },
      habits: ["💧 Drink Water", "🏃 Exercise", "🧘 Meditate", "📝 Journal", "📖 Read"],
      notes: "Had an interesting conversation about mindfulness today."
    };
    
    // Set the mock data and show the modal
    setDayData(mockData);
    setShowDayDetail(true);
  };

  const handleCloseDayDetail = () => {
    setShowDayDetail(false);
    setDayData(null);
  };

  // Render calendar header
  const renderCalendarHeader = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return (
      <View style={[styles.calendarHeader, { backgroundColor: COLORS.surface }]}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <ChevronLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        
        <View style={styles.monthYearContainer}>
          <Text style={[styles.monthYearText, { color: COLORS.text }]}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={goToToday}>
            <Text style={[styles.todayButton, { color: COLORS.primary }]}>Today</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <ChevronRight color={COLORS.text} size={24} />
        </TouchableOpacity>
      </View>
    );
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const calendarDays = getCalendarData();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <View style={[styles.calendarContainer, { backgroundColor: COLORS.surface }]}>
        {/* Day names header */}
        <View style={styles.dayNamesContainer}>
          {dayNames.map((day) => (
            <View key={day} style={styles.dayNameCell}>
              <Text style={[styles.dayNameText, { color: COLORS.textSecondary }]}>{day}</Text>
            </View>
          ))}
        </View>
        
        {/* Calendar days grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                day?.isToday && styles.todayCell,
                day?.date === selectedDate && styles.selectedCell,
                day?.isToday && { backgroundColor: COLORS.surfaceLight },
                day?.date === selectedDate && { backgroundColor: COLORS.primary },
              ]}
              onPress={() => day?.date && handleDateSelect(day.date)}
              disabled={!day} // Only disable completely empty cells
            >
              {day ? (
                <>
                  {/* Mood indicators similar to MoodCalendar */}
                  {day.mood && (
                    <View style={styles.moodIndicators}>
                      <View style={[styles.moodCircle, { backgroundColor: day.mood.color }]}>
                        <Text style={styles.moodEmoji}>{day.mood.emoji}</Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Data indicators in a more compact layout */}
                  <View style={styles.dataIndicators}>
                    {day.hasSleepData && (
                      <View style={[styles.dataIndicator, styles.sleepIndicator, { backgroundColor: COLORS.primary }]} />
                    )}
                    {day.hasMentalClarityData && (
                      <View style={[styles.dataIndicator, styles.clarityIndicator, { backgroundColor: COLORS.success }]} />
                    )}
                    {day.hasIntimacyData && (
                      <View style={[styles.dataIndicator, styles.intimacyIndicator, { backgroundColor: COLORS.accent }]} />
                    )}
                  </View>
                  
                  <Text style={[
                    styles.dayText,
                    { color: COLORS.text },
                    day.isToday && styles.todayText,
                    day.date === selectedDate && styles.selectedText,
                    day.date === selectedDate && { color: COLORS.surface },
                    !day.isCurrentMonth && styles.inactiveDateText,
                    !day.isCurrentMonth && { color: COLORS.textSecondary },
                  ]}>
                    {day.day}
                  </Text>
                  
                  {/* Add a small plus icon for days without entries to indicate they can be logged */}
                  {!day.mood && day.isCurrentMonth && (
                    <Text style={[styles.addIcon, { color: COLORS.textSecondary }]}>+</Text>
                  )}
                </>
              ) : (
                <Text style={[styles.emptyDayText, { color: COLORS.textSecondary }]}></Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render month overview stats
  const renderMonthOverview = () => {
    // Filter entries for the current month
    const monthEntries = entries.filter(e => 
      e.date.startsWith(currentDate.toISOString().slice(0, 7))
    );
    
    // Calculate mood statistics
    const totalEntries = monthEntries.length;
    let goodDays = 0;
    let badDays = 0;
    let averageDays = 0;
    let moodSum = 0;
    
    monthEntries.forEach(entry => {
      moodSum += entry.moodId;
      if (entry.moodId >= 4) {
        goodDays++;
      } else if (entry.moodId <= 2) {
        badDays++;
      } else {
        averageDays++;
      }
    });
    
    const averageMood = totalEntries > 0 
      ? (moodSum / totalEntries).toFixed(1)
      : '0';
    
    const bestStreak = 3; // Mock data
    const entriesCount = totalEntries;
    
    return (
      <View style={[styles.monthOverviewContainer, { backgroundColor: COLORS.surface }]}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>This Month Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{entriesCount}</Text>
            <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>Entries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{averageMood}</Text>
            <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>Avg Mood</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{bestStreak}</Text>
            <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>Day Streak</Text>
          </View>
        </View>
        
        {/* Mood Distribution Section */}
        <View style={styles.moodDistributionContainer}>
          <View style={styles.moodDistributionRow}>
            <View style={styles.moodDistributionItem}>
              <Text style={[styles.moodDistributionValue, { color: COLORS.success }]}>
                {goodDays}
              </Text>
              <Text style={[styles.moodDistributionLabel, { color: COLORS.textSecondary }]}>Good Days</Text>
            </View>
            <View style={styles.moodDistributionItem}>
              <Text style={[styles.moodDistributionValue, { color: COLORS.textSecondary }]}>
                {averageDays}
              </Text>
              <Text style={[styles.moodDistributionLabel, { color: COLORS.textSecondary }]}>Average Days</Text>
            </View>
            <View style={styles.moodDistributionItem}>
              <Text style={[styles.moodDistributionValue, { color: COLORS.error }]}>
                {badDays}
              </Text>
              <Text style={[styles.moodDistributionLabel, { color: COLORS.textSecondary }]}>Bad Days</Text>
            </View>
          </View>
          <View style={styles.averageMoodContainer}>
            <Text style={[styles.averageMoodLabel, { color: COLORS.textSecondary }]}>Average Mood:</Text>
            <Text style={[styles.averageMoodValue, { color: COLORS.primary }]}>{averageMood}/5</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render legend
  const renderLegend = () => {
    return (
      <View style={[styles.legendContainer, { backgroundColor: COLORS.surface }]}>
        <Text style={[styles.legendTitle, { color: COLORS.text }]}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, styles.sleepIndicator, { backgroundColor: COLORS.primary }]} />
            <Text style={[styles.legendText, { color: COLORS.textSecondary }]}>Sleep</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, styles.clarityIndicator, { backgroundColor: COLORS.success }]} />
            <Text style={[styles.legendText, { color: COLORS.textSecondary }]}>Clarity</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, styles.intimacyIndicator, { backgroundColor: COLORS.accent }]} />
            <Text style={[styles.legendText, { color: COLORS.textSecondary }]}>Intimacy</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.background }]}>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Calendar</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: COLORS.surfaceLight }]}
          onPress={() => setShowQuickLog(true)}
        >
          <Text style={[styles.addButtonText, { color: COLORS.primary }]}>Add</Text>
          <Plus color={COLORS.primary} size={16} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Month Overview */}
        {renderMonthOverview()}
        
        {/* Calendar Header */}
        {renderCalendarHeader()}
        
        {/* Calendar Grid */}
        {renderCalendarGrid()}
        
        {/* Legend */}
        {renderLegend()}
        
        {/* Info note */}
        <View style={[styles.infoNote, { backgroundColor: COLORS.surface }]}>
          <Text style={[styles.infoNoteText, { color: COLORS.textSecondary }]}>
            Tap any date to view or add entries
          </Text>
        </View>
        
        {/* Entry Details */}
        <View style={styles.entryDetails}>
          <Text style={[styles.selectedDateText, { color: COLORS.text }]}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          {isLoadingEntry ? (
            <View style={[styles.noEntryCard, { backgroundColor: COLORS.surface }]}>
              <Text style={[styles.noEntryText, { color: COLORS.textSecondary }]}>Loading...</Text>
            </View>
          ) : selectedEntry ? (
            <View style={[styles.entryCard, { backgroundColor: COLORS.surface }]}>
              <View style={styles.moodSection}>
                <View
                  style={[
                    styles.moodIndicator,
                    { backgroundColor: selectedEntry.mood.color },
                  ]}
                >
                  <Text style={styles.moodEmoji}>
                    {selectedEntry.mood.emoji}
                  </Text>
                </View>
                <Text style={[styles.moodName, { color: COLORS.text }]}>{selectedEntry.mood.name}</Text>
              </View>

              {selectedEntry.activities.length > 0 && (
                <View style={styles.activitiesSection}>
                  <Text style={[styles.activitiesTitle, { color: COLORS.text }]}>Activities</Text>
                  <View style={styles.activitiesList}>
                    {selectedEntry.activities.map((activity) => (
                      <View key={activity.id} style={[styles.activityTag, { backgroundColor: COLORS.surfaceLight }]}>
                        <Text style={[styles.activityText, { color: COLORS.textSecondary }]}>{activity.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedEntry.note && (
                <View style={styles.noteSection}>
                  <Text style={[styles.noteTitle, { color: COLORS.text }]}>Note</Text>
                  <Text style={[styles.noteText, { color: COLORS.textSecondary }]}>{selectedEntry.note}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.noEntryCard, { backgroundColor: COLORS.surface }]}>
              <Text style={[styles.noEntryText, { color: COLORS.textSecondary }]}>No entry for this day</Text>
              <TouchableOpacity onPress={() => setShowQuickLog(true)}>
                <Text style={[styles.addJournalEntryText, { color: COLORS.primary }]}>Add Journal Entry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Quick Log Modal */}
      {showQuickLog && (
        <Modal
          visible={showQuickLog}
          animationType="slide"
          onRequestClose={() => setShowQuickLog(false)}
        >
          <QuickLog
            onBack={() => setShowQuickLog(false)}
            onSave={handleQuickLogSave}
            date={selectedDate} // Pass the selected date
          />
        </Modal>
      )}

      {/* Day Detail Modal */}
      <DayDetailModal
        visible={showDayDetail}
        onClose={handleCloseDayDetail}
        date={selectedDate}
        dayData={dayData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  monthOverviewContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  todayButton: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  calendarContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
  },
  dayNamesContainer: {
    flexDirection: 'row',
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
  },
  todayCell: {
    borderRadius: 999,
  },
  selectedCell: {
    borderRadius: 999,
  },
  
  // Mood indicators similar to MoodCalendar
  moodIndicators: {
    position: 'absolute',
    top: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  moodEmoji: {
    fontSize: 16,
  },
  
  // Data indicators in a more compact layout
  dataIndicators: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 2,
  },
  sleepIndicator: {
  },
  clarityIndicator: {
  },
  intimacyIndicator: {
  },
  
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    position: 'absolute',
    bottom: 2,
  },
  todayText: {
  },
  selectedText: {
  },
  emptyDayText: {
    fontSize: 16,
    lineHeight: 24,
  },
  inactiveDateText: {
    opacity: 0.5,
  },
  
  legendContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  legendTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  achievementCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    flex: 1,
  },
  achievementTitle: {
    fontWeight: 'bold',
  },
  entryDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  selectedDateText: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 16,
  },
  entryCard: {
    borderRadius: 16,
    padding: 16,
  },
  moodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moodName: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  activitiesSection: {
    marginBottom: 16,
  },
  activitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 12,
  },
  activitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityTag: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  noteSection: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  noEntryCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  noEntryText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 4,
  },
  noEntrySubtext: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    textAlign: 'center',
  },
  addJournalEntryText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    marginTop: 4,
  },

  moodDistributionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  moodDistributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  moodDistributionItem: {
    alignItems: 'center',
  },
  moodDistributionValue: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  moodDistributionLabel: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 4,
  },
  averageMoodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  averageMoodLabel: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  averageMoodValue: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },

  addIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 12,
    opacity: 0.5,
  },
  infoNote: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  infoNoteText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});