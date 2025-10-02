import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { getColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());

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
      });
    }
    
    return calendarDays;
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
                day?.isToday && { backgroundColor: COLORS.surfaceLight },
              ]}
              disabled={!day}
            >
              {day ? (
                <>
                  {/* Add mood indicator circles similar to MoodCalendar */}
                  <View style={styles.moodIndicators}>
                    {/* This is where you would add actual mood data */}
                    {index % 7 === 0 && (
                      <View style={[styles.moodCircle, { backgroundColor: '#A8E6CF' }]}>
                        <Text style={styles.moodEmoji}>😊</Text>
                      </View>
                    )}
                    {index % 5 === 0 && (
                      <View style={[styles.moodCircle, { backgroundColor: '#DCEDC1' }]}>
                        <Text style={styles.moodEmoji}>😃</Text>
                      </View>
                    )}
                    {index % 9 === 0 && (
                      <View style={[styles.moodCircle, { backgroundColor: '#B4E7CE' }]}>
                        <Text style={styles.moodEmoji}>😌</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.dayText,
                    { color: COLORS.text },
                    day.isToday && styles.todayText,
                    day.isToday && { color: COLORS.text },
                  ]}>
                    {day.day}
                  </Text>
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

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.background }]}>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Calendar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Calendar Header */}
        {renderCalendarHeader()}
        
        {/* Calendar Grid */}
        {renderCalendarGrid()}
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 100,
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
    // Added shadow effect similar to MoodCalendar
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dayNamesContainer: {
    flexDirection: 'row',
  },
  dayNameCell: {
    width: (width - 70) / 7,
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
    width: (width - 70) / 7,
    height: (width - 70) / 7,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
  },
  todayCell: {
    borderRadius: 999,
  },
  moodIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  moodCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  moodEmoji: {
    fontSize: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    position: 'absolute',
    bottom: 2,
  },
  todayText: {
    fontWeight: 'bold',
  },
  emptyDayText: {
    fontSize: 16,
    lineHeight: 24,
  },
});