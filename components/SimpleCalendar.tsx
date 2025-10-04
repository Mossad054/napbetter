import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface SimpleCalendarProps {
  onDayPress: (date: string) => void;
  selectedDate?: string;
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({ onDayPress, selectedDate }) => {
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
        isCurrentMonth: true,
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
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <ChevronLeft color={COLORS.text} size={20} />
        </TouchableOpacity>
        
        <View style={styles.monthYearContainer}>
          <Text style={styles.monthYearText}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={goToToday}>
            <Text style={styles.todayButton}>Today</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <ChevronRight color={COLORS.text} size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const calendarDays = getCalendarData();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <View style={styles.calendarContainer}>
        {/* Day names header */}
        <View style={styles.dayNamesContainer}>
          {dayNames.map((day) => (
            <View key={day} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{day}</Text>
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
              ]}
              onPress={() => day?.date && onDayPress(day.date)}
              disabled={!day}
            >
              {day ? (
                <>
                  <Text style={[
                    styles.dayText,
                    day.isToday && styles.todayText,
                    day.date === selectedDate && styles.selectedText,
                  ]}>
                    {day.day}
                  </Text>
                </>
              ) : (
                <Text style={styles.emptyDayText}></Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderCalendarHeader()}
      {renderCalendarGrid()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  navButton: {
    padding: SPACING.sm,
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: TYPOGRAPHY.h4.fontSize,
    fontWeight: TYPOGRAPHY.h4.fontWeight as '600',
    lineHeight: TYPOGRAPHY.h4.lineHeight,
    color: COLORS.text,
  },
  todayButton: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: TYPOGRAPHY.caption.fontWeight as '500',
    lineHeight: TYPOGRAPHY.caption.lineHeight,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  calendarContainer: {
    overflow: 'hidden',
  },
  dayNamesContainer: {
    flexDirection: 'row',
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dayNameText: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: TYPOGRAPHY.caption.fontWeight as '600',
    lineHeight: TYPOGRAPHY.caption.lineHeight,
    color: COLORS.textSecondary,
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
  },
  todayCell: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.round,
  },
  selectedCell: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
  },
  dayText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: TYPOGRAPHY.body.fontWeight as '500',
    lineHeight: TYPOGRAPHY.body.lineHeight,
    color: COLORS.text,
  },
  todayText: {
    color: COLORS.text,
  },
  selectedText: {
    color: COLORS.surface,
  },
  emptyDayText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    lineHeight: TYPOGRAPHY.body.lineHeight,
    color: COLORS.textSecondary,
  },
});

export default SimpleCalendar;