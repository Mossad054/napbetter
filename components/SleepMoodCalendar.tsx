import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface DayData {
  day: number;
  label: string;
  date: string;
  sleep: number;
  mood: number;
}

// Color coding for sleep hours (adjust thresholds as needed)
const getSleepColor = (hours: number): string => {
  if (hours >= 7 && hours <= 9) return '#4CAF50'; // Optimal sleep
  if (hours >= 6 && hours < 7) return '#FFC107'; // Below optimal
  if (hours >= 5 && hours < 6) return '#FF9800'; // Deficit
  return '#F44336'; // Severe deficit
};

// Color coding for mood score (1-10 scale)
const getMoodColor = (score: number): string => {
  if (score >= 8) return '#4CAF50'; // Great mood
  if (score >= 6 && score < 8) return '#8BC34A'; // Good mood
  if (score >= 4 && score < 6) return '#FFC107'; // Neutral mood
  if (score >= 2 && score < 4) return '#FF9800'; // Low mood
  return '#F44336'; // Very low mood
};

const SleepMoodCalendar = () => {
  const [selectedDay, setSelectedDay] = useState(3); // Wednesday (05)
  const [activeTab, setActiveTab] = useState('sleep'); // 'sleep' or 'mood'

  // Sample data - replace with your actual data
  const weekData = [
    { day: 2, label: 'Sun', date: '02', sleep: 6.5, mood: 7 },
    { day: 3, label: 'Mon', date: '03', sleep: 7.5, mood: 8 },
    { day: 4, label: 'Tue', date: '04', sleep: 5, mood: 5 },
    { day: 5, label: 'Wed', date: '05', sleep: 8, mood: 9 },
    { day: 6, label: 'Thu', date: '06', sleep: 8.5, mood: 8 },
    { day: 7, label: 'Fri', date: '07', sleep: 6, mood: 6 },
    { day: 8, label: 'Sat', date: '08', sleep: 9, mood: 9 },
  ];

  const selectedDayData = weekData.find(d => d.day === selectedDay);
  const targetSleep = 8; // Target sleep hours
  const targetMood = 8; // Target mood score

  const renderCalendarDay = (dayData: DayData) => {
    const isSelected = selectedDay === dayData.day;
    const value = activeTab === 'sleep' ? dayData.sleep : dayData.mood;
    const getColor = activeTab === 'sleep' ? getSleepColor : getMoodColor;
    const color = getColor(value);

    return (
      <TouchableOpacity
        key={dayData.day}
        style={[
          styles.dayContainer,
          isSelected && styles.selectedDay,
        ]}
        onPress={() => setSelectedDay(dayData.day)}
      >
        <Text style={[styles.dateText, isSelected && styles.selectedText]}>
          {dayData.date}
        </Text>
        <Text style={[styles.labelText, isSelected && styles.selectedText]}>
          {dayData.label}
        </Text>
        <View style={[styles.indicator, { backgroundColor: color }]} />
      </TouchableOpacity>
    );
  };

  const renderDetailsCard = () => {
    if (!selectedDayData) return null;

    if (activeTab === 'sleep') {
      const sleepPercentage = (selectedDayData.sleep / targetSleep) * 100;
      const deficit = targetSleep - selectedDayData.sleep;

      return (
        <View style={styles.detailsCard}>
          <View style={styles.circularProgress}>
            <View style={styles.progressContent}>
              <Text style={styles.mainValue}>{selectedDayData.sleep}h</Text>
              <Text style={styles.subValue}>of {targetSleep}h</Text>
            </View>
            {/* Simplified circular progress visualization */}
            <View
              style={[
                styles.progressCircle,
                { borderColor: getSleepColor(selectedDayData.sleep) },
                { borderWidth: sleepPercentage >= 80 ? 8 : 6 },
              ]}
            />
          </View>

          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Sleep Quality</Text>
              <Text style={styles.metricValue}>
                {selectedDayData.sleep >= 7 ? 'Good' : 'Needs Improvement'}
              </Text>
              <View
                style={[
                  styles.metricBar,
                  {
                    width: `${sleepPercentage}%`,
                    backgroundColor: getSleepColor(selectedDayData.sleep),
                  },
                ]}
              />
            </View>

            {deficit > 0 && (
              <View style={styles.deficitAlert}>
                <Text style={styles.deficitText}>
                  ⚠️ Sleep deficit: {deficit.toFixed(1)}h
                </Text>
              </View>
            )}

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Weekly Average</Text>
              <Text style={styles.metricValue}>
                {(
                  weekData.reduce((sum, d) => sum + d.sleep, 0) / weekData.length
                ).toFixed(1)}
                h
              </Text>
            </View>
          </View>
        </View>
      );
    } else {
      // Mood tab
      const moodPercentage = (selectedDayData.mood / 10) * 100;
      const moodLabel =
        selectedDayData.mood >= 8
          ? 'Excellent'
          : selectedDayData.mood >= 6
          ? 'Good'
          : selectedDayData.mood >= 4
          ? 'Neutral'
          : 'Low';

      return (
        <View style={styles.detailsCard}>
          <View style={styles.circularProgress}>
            <View style={styles.progressContent}>
              <Text style={styles.mainValue}>{selectedDayData.mood}/10</Text>
              <Text style={styles.subValue}>{moodLabel}</Text>
            </View>
            <View
              style={[
                styles.progressCircle,
                { borderColor: getMoodColor(selectedDayData.mood) },
                { borderWidth: moodPercentage >= 80 ? 8 : 6 },
              ]}
            />
          </View>

          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Mood Score</Text>
              <Text style={styles.metricValue}>{moodLabel}</Text>
              <View
                style={[
                  styles.metricBar,
                  {
                    width: `${moodPercentage}%`,
                    backgroundColor: getMoodColor(selectedDayData.mood),
                  },
                ]}
              />
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Weekly Average</Text>
              <Text style={styles.metricValue}>
                {(
                  weekData.reduce((sum, d) => sum + d.mood, 0) / weekData.length
                ).toFixed(1)}
                /10
              </Text>
            </View>
          </View>
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sleep' && styles.activeTab]}
          onPress={() => setActiveTab('sleep')}
        >
          <Text
            style={[styles.tabText, activeTab === 'sleep' && styles.activeTabText]}
          >
            Sleep
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mood' && styles.activeTab]}
          onPress={() => setActiveTab('mood')}
        >
          <Text
            style={[styles.tabText, activeTab === 'mood' && styles.activeTabText]}
          >
            Mood
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mini Calendar */}
      <View style={styles.calendarContainer}>
        {weekData.map(renderCalendarDay)}
      </View>

      {/* Details Card */}
      {renderDetailsCard()}

      {/* Color Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>
          {activeTab === 'sleep' ? 'Sleep Quality' : 'Mood Scale'}
        </Text>
        <View style={styles.legendRow}>
          {activeTab === 'sleep' ? (
            <>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>7-9h Optimal</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
                <Text style={styles.legendText}>6-7h Below</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>5-6h Deficit</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>{'<5h Severe'}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>8-10 Great</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#8BC34A' }]} />
                <Text style={styles.legendText}>6-7 Good</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
                <Text style={styles.legendText}>4-5 Neutral</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>{'<4 Low'}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
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
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 48,
  },
  selectedDay: {
    backgroundColor: '#C8E6C9',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  labelText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  selectedText: {
    color: '#2E7D32',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  circularProgress: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    position: 'absolute',
  },
  progressContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  mainValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
  },
  subValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  metricsContainer: {
    gap: 16,
  },
  metricRow: {
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  metricBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  deficitAlert: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  deficitText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    gap: 12,
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
});

export default SleepMoodCalendar;