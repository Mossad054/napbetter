import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';

// Define TypeScript interfaces
interface HabitStatus {
  status: 'complete' | 'partial' | 'missed' | 'skipped' | 'pending';
  value: string;
  timestamp?: Date;
}

interface Habit {
  id: number;
  name: string;
  icon: string;
  target: string;
  streak: number;
  category: string;
}

interface DayData {
  day: number;
  label: string;
  date: string;
  habits: {
    [habitId: number]: HabitStatus;
  };
}

// Habit completion status colors
const getCompletionColor = (status: string) => {
  switch (status) {
    case 'complete': return '#4CAF50'; // Completed
    case 'partial': return '#FFC107'; // Partially completed
    case 'missed': return '#F44336'; // Missed
    case 'skipped': return '#9E9E9E'; // Intentionally skipped
    default: return '#E0E0E0'; // Not yet tracked
  }
};

// Habit streak visualization
const getStreakColor = (streak: number) => {
  if (streak >= 30) return '#4CAF50'; // Master level
  if (streak >= 14) return '#8BC34A'; // Strong streak
  if (streak >= 7) return '#FFC107'; // Building momentum
  if (streak >= 3) return '#FF9800'; // Getting started
  return '#E0E0E0'; // No streak
};

const HabitTrackerCalendar = () => {
  const [selectedDay, setSelectedDay] = useState(3);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showHabitModal, setShowHabitModal] = useState(false);

  // Sample habits data
  const habits: Habit[] = [
    {
      id: 1,
      name: 'Morning Workout',
      icon: '💪',
      target: '30 min',
      streak: 12,
      category: 'Fitness',
    },
    {
      id: 2,
      name: 'Meditation',
      icon: '🧘',
      target: '15 min',
      streak: 7,
      category: 'Wellness',
    },
    {
      id: 3,
      name: 'Read Book',
      icon: '📚',
      target: '20 pages',
      streak: 5,
      category: 'Learning',
    },
    {
      id: 4,
      name: 'Drink Water',
      icon: '💧',
      target: '8 glasses',
      streak: 18,
      category: 'Health',
    },
  ];

  // Week data with habit completions
  const weekData: DayData[] = [
    {
      day: 2,
      label: 'Sun',
      date: '02',
      habits: {
        1: { status: 'complete', value: '30 min' },
        2: { status: 'complete', value: '15 min' },
        3: { status: 'missed', value: '0 pages' },
        4: { status: 'partial', value: '5 glasses' },
      },
    },
    {
      day: 3,
      label: 'Mon',
      date: '03',
      habits: {
        1: { status: 'complete', value: '35 min' },
        2: { status: 'complete', value: '20 min' },
        3: { status: 'complete', value: '25 pages' },
        4: { status: 'complete', value: '8 glasses' },
      },
    },
    {
      day: 4,
      label: 'Tue',
      date: '04',
      habits: {
        1: { status: 'missed', value: '0 min' },
        2: { status: 'partial', value: '10 min' },
        3: { status: 'complete', value: '20 pages' },
        4: { status: 'complete', value: '9 glasses' },
      },
    },
    {
      day: 5,
      label: 'Wed',
      date: '05',
      habits: {
        1: { status: 'complete', value: '40 min' },
        2: { status: 'complete', value: '15 min' },
        3: { status: 'complete', value: '30 pages' },
        4: { status: 'complete', value: '8 glasses' },
      },
    },
    {
      day: 6,
      label: 'Thu',
      date: '06',
      habits: {
        1: { status: 'complete', value: '30 min' },
        2: { status: 'skipped', value: 'Rest day' },
        3: { status: 'complete', value: '22 pages' },
        4: { status: 'complete', value: '10 glasses' },
      },
    },
    {
      day: 7,
      label: 'Fri',
      date: '07',
      habits: {
        1: { status: 'partial', value: '15 min' },
        2: { status: 'complete', value: '15 min' },
        3: { status: 'complete', value: '18 pages' },
        4: { status: 'partial', value: '6 glasses' },
      },
    },
    {
      day: 8,
      label: 'Sat',
      date: '08',
      habits: {
        1: { status: 'pending', value: 'Not tracked' },
        2: { status: 'pending', value: 'Not tracked' },
        3: { status: 'pending', value: 'Not tracked' },
        4: { status: 'pending', value: 'Not tracked' },
      },
    },
  ];

  const selectedDayData = weekData.find((d) => d.day === selectedDay);

  // Calculate completion rate for the day
  const getDayCompletionRate = (dayHabits: { [habitId: number]: HabitStatus }) => {
    const completed = Object.values(dayHabits).filter(
      (h) => h.status === 'complete'
    ).length;
    return (completed / Object.keys(dayHabits).length) * 100;
  };

  const renderCalendarDay = (dayData: DayData) => {
    const isSelected = selectedDay === dayData.day;
    const completionRate = getDayCompletionRate(dayData.habits);
    const completedCount = Object.values(dayData.habits).filter(
      (h) => h.status === 'complete'
    ).length;
    const totalCount = Object.keys(dayData.habits).length;

    // Determine day color based on completion
    const dayColor =
      completionRate === 100
        ? '#4CAF50'
        : completionRate >= 75
        ? '#8BC34A'
        : completionRate >= 50
        ? '#FFC107'
        : completionRate > 0
        ? '#FF9800'
        : '#E0E0E0';

    return (
      <TouchableOpacity
        key={dayData.day}
        style={[styles.dayContainer, isSelected && styles.selectedDay]}
        onPress={() => setSelectedDay(dayData.day)}
      >
        <Text style={[styles.dateText, isSelected && styles.selectedText]}>
          {dayData.date}
        </Text>
        <Text style={[styles.labelText, isSelected && styles.selectedText]}>
          {dayData.label}
        </Text>
        <View style={styles.completionIndicator}>
          <View style={[styles.indicator, { backgroundColor: dayColor }]} />
          <Text style={styles.completionText}>
            {completedCount}/{totalCount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHabitRow = (habit: Habit) => {
    const habitStatus = selectedDayData?.habits[habit.id];
    const statusColor = getCompletionColor(habitStatus?.status || 'pending');

    return (
      <TouchableOpacity
        key={habit.id}
        style={styles.habitRow}
        onPress={() => {
          setSelectedHabit(habit);
          setShowHabitModal(true);
        }}
      >
        <View style={styles.habitLeft}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.habitIcon}>{habit.icon}</Text>
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.habitTarget}>Target: {habit.target}</Text>
          </View>
        </View>

        <View style={styles.habitRight}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{habit.streak}</Text>
          </View>
          <Text style={styles.habitValue}>{habitStatus?.value || 'N/A'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOverviewCard = () => {
    if (!selectedDayData) return null;

    const completionRate = getDayCompletionRate(selectedDayData.habits);
    const completedCount = Object.values(selectedDayData.habits).filter(
      (h) => h.status === 'complete'
    ).length;
    const totalCount = Object.keys(selectedDayData.habits).length;

    return (
      <View style={styles.overviewCard}>
        <Text style={styles.cardTitle}>Daily Overview</Text>

        <View style={styles.circularProgress}>
          <View style={styles.progressContent}>
            <Text style={styles.mainValue}>{completedCount}</Text>
            <Text style={styles.subValue}>of {totalCount} habits</Text>
          </View>
          <View
            style={[
              styles.progressCircle,
              {
                borderColor:
                  completionRate === 100
                    ? '#4CAF50'
                    : completionRate >= 50
                    ? '#FFC107'
                    : '#FF9800',
              },
            ]}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completionRate.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {habits.reduce((sum, h) => sum + h.streak, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.max(...habits.map((h) => h.streak))}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Habit Tracker</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Habit</Text>
        </TouchableOpacity>
      </View>

      {/* Mini Calendar */}
      <View style={styles.calendarContainer}>
        {weekData.map(renderCalendarDay)}
      </View>

      {/* Overview Card */}
      {renderOverviewCard()}

      {/* Habits List */}
      <View style={styles.habitsCard}>
        <Text style={styles.cardTitle}>Today's Habits</Text>
        {habits.map(renderHabitRow)}
      </View>

      {/* Weekly Heatmap */}
      <View style={styles.heatmapCard}>
        <Text style={styles.cardTitle}>Weekly Heatmap</Text>
        {habits.map((habit) => (
          <View key={habit.id} style={styles.heatmapRow}>
            <View style={styles.heatmapLabel}>
              <Text style={styles.habitIcon}>{habit.icon}</Text>
              <Text style={styles.heatmapHabitName}>{habit.name}</Text>
            </View>
            <View style={styles.heatmapDots}>
              {weekData.map((day) => {
                const status = day.habits[habit.id]?.status;
                return (
                  <View
                    key={day.day}
                    style={[
                      styles.heatmapDot,
                      { backgroundColor: getCompletionColor(status || 'pending') },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </View>

      {/* Status Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Status Guide</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Complete</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>Partial</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Missed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#9E9E9E' }]} />
            <Text style={styles.legendText}>Skipped</Text>
          </View>
        </View>
      </View>

      {/* Habit Detail Modal */}
      <Modal
        visible={showHabitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHabitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedHabit && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedHabit.icon} {selectedHabit.name}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Category: {selectedHabit.category}
                </Text>

                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>
                      {selectedHabit.streak}
                    </Text>
                    <Text style={styles.modalStatLabel}>Day Streak</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>
                      {selectedHabit.target}
                    </Text>
                    <Text style={styles.modalStatLabel}>Daily Target</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>✓ Complete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.partialButton]}
                  >
                    <Text style={styles.actionButtonText}>~ Partial</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.skipButton]}
                  >
                    <Text style={styles.actionButtonText}>⊘ Skip</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowHabitModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 48,
  },
  selectedDay: {
    backgroundColor: '#E8F5E9',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  labelText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  selectedText: {
    color: '#2E7D32',
  },
  completionIndicator: {
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  completionText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '600',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  circularProgress: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    position: 'absolute',
  },
  progressContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  mainValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333',
  },
  subValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  habitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  habitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  habitTarget: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  habitRight: {
    alignItems: 'flex-end',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  streakIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6F00',
  },
  habitValue: {
    fontSize: 12,
    color: '#666',
  },
  heatmapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heatmapLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heatmapHabitName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  heatmapDots: {
    flexDirection: 'row',
    gap: 6,
  },
  heatmapDot: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalActions: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  partialButton: {
    backgroundColor: '#FFC107',
  },
  skipButton: {
    backgroundColor: '#9E9E9E',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HabitTrackerCalendar;