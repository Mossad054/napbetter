import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  BarChart3, 
  Heart,
  Moon,
  Brain,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useMoodStore } from '@/hooks/mood-store';
import { IntimacyEntry, MoodEntry, SleepEntry } from '@/types/mood';

interface CorrelationData {
  intimacyFrequency: number;
  avgMoodChange: number;
  avgSleepQuality: number;
  intimacySleepCorrelation: number;
  intimacyMoodCorrelation: number;
  toysCorrelation: number;
  orgasmCorrelation: number;
}

export default function IntimacyCorrelationAnalysis() {
  const insets = useSafeAreaInsets();
  const { getIntimacyEntries, entries: moodEntries, getSleepEntries } = useMoodStore();
  const [intimacyEntries, setIntimacyEntries] = useState<IntimacyEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (intimacyEntries.length > 0 && moodEntries.length > 0 && sleepEntries.length > 0) {
      calculateCorrelations();
    }
  }, [intimacyEntries, moodEntries, sleepEntries, timeRange]);

  const loadAllData = async () => {
    try {
      // Load intimacy entries
      const intimacyData = await getIntimacyEntries();
      setIntimacyEntries(intimacyData);
      
      // Load sleep entries
      const sleepData = await getSleepEntries();
      setSleepEntries(sleepData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Filter data based on time range
  const filterDataByTimeRange = (data: any[], dateField: string, range: 'week' | 'month' | 'all') => {
    if (range === 'all') return data;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    return data.filter(entry => new Date(entry[dateField]) >= startDate);
  };

  const calculateCorrelations = () => {
    // Filter data by time range
    const filteredIntimacyEntries = filterDataByTimeRange(intimacyEntries, 'date', timeRange);
    const filteredMoodEntries = filterDataByTimeRange(moodEntries, 'date', timeRange);
    const filteredSleepEntries = filterDataByTimeRange(sleepEntries, 'date', timeRange);
    
    if (filteredIntimacyEntries.length === 0) {
      setCorrelationData(null);
      return;
    }
    
    // Calculate intimacy frequency (per week)
    const weeksCount = timeRange === 'week' ? 1 : timeRange === 'month' ? 4 : 52;
    const intimacyFrequency = filteredIntimacyEntries.length / weeksCount;
    
    // Calculate average mood change
    const avgMoodChange = filteredIntimacyEntries.length > 0
      ? filteredIntimacyEntries.reduce((sum, entry) => sum + (entry.moodAfter - entry.moodBefore), 0) / filteredIntimacyEntries.length
      : 0;
    
    // Calculate average sleep quality on intimacy days
    let intimacySleepQualitySum = 0;
    let intimacySleepQualityCount = 0;
    
    filteredIntimacyEntries.forEach(intimacyEntry => {
      const sleepEntry = filteredSleepEntries.find((se: any) => se.date === intimacyEntry.date);
      if (sleepEntry && sleepEntry.quality) {
        intimacySleepQualitySum += sleepEntry.quality;
        intimacySleepQualityCount++;
      }
    });
    
    const avgSleepQuality = intimacySleepQualityCount > 0 
      ? intimacySleepQualitySum / intimacySleepQualityCount 
      : 0;
    
    // Calculate correlations
    // This is a simplified correlation calculation for demonstration
    const intimacySleepCorrelation = calculateSimpleCorrelation(
      filteredIntimacyEntries, 
      filteredSleepEntries, 
      'date', 
      'quality'
    );
    
    const intimacyMoodCorrelation = calculateSimpleCorrelation(
      filteredIntimacyEntries, 
      filteredMoodEntries, 
      'date', 
      'moodId'
    );
    
    // Correlation with toys usage
    const toysEntries = filteredIntimacyEntries.filter(e => e.toys);
    const toysCorrelation = toysEntries.length > 0
      ? toysEntries.reduce((sum, entry) => sum + (entry.moodAfter - entry.moodBefore), 0) / toysEntries.length
      : 0;
    
    // Correlation with orgasm
    const orgasmEntries = filteredIntimacyEntries.filter(e => e.orgasmed);
    const orgasmCorrelation = orgasmEntries.length > 0
      ? orgasmEntries.reduce((sum, entry) => sum + (entry.moodAfter - entry.moodBefore), 0) / orgasmEntries.length
      : 0;
    
    setCorrelationData({
      intimacyFrequency,
      avgMoodChange,
      avgSleepQuality,
      intimacySleepCorrelation,
      intimacyMoodCorrelation,
      toysCorrelation,
      orgasmCorrelation
    });
  };

  // Simplified correlation calculation
  const calculateSimpleCorrelation = (
    array1: any[], 
    array2: any[], 
    dateField1: string, 
    valueField2: string
  ): number => {
    // Find matching dates
    const matchedEntries: { value1: number; value2: number }[] = [];
    
    array1.forEach(entry1 => {
      const matchingEntry = array2.find((entry2: any) => entry2[dateField1] === entry1.date);
      if (matchingEntry && matchingEntry[valueField2] !== undefined) {
        matchedEntries.push({
          value1: 1, // Presence of intimacy
          value2: matchingEntry[valueField2]
        });
      }
    });
    
    if (matchedEntries.length < 2) return 0;
    
    // Calculate means
    const mean1 = matchedEntries.reduce((sum, entry) => sum + entry.value1, 0) / matchedEntries.length;
    const mean2 = matchedEntries.reduce((sum, entry) => sum + entry.value2, 0) / matchedEntries.length;
    
    // Calculate correlation coefficient
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;
    
    matchedEntries.forEach(entry => {
      const diff1 = entry.value1 - mean1;
      const diff2 = entry.value2 - mean2;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    });
    
    if (denominator1 === 0 || denominator2 === 0) return 0;
    
    return numerator / Math.sqrt(denominator1 * denominator2);
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Time Range</Text>
      <View style={styles.selectorButtons}>
        <TouchableOpacity
          style={[styles.selectorButton, timeRange === 'week' && styles.selectedButton]}
          onPress={() => setTimeRange('week')}
        >
          <Text style={[styles.selectorButtonText, timeRange === 'week' && styles.selectedButtonText]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectorButton, timeRange === 'month' && styles.selectedButton]}
          onPress={() => setTimeRange('month')}
        >
          <Text style={[styles.selectorButtonText, timeRange === 'month' && styles.selectedButtonText]}>
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectorButton, timeRange === 'all' && styles.selectedButton]}
          onPress={() => setTimeRange('all')}
        >
          <Text style={[styles.selectorButtonText, timeRange === 'all' && styles.selectedButtonText]}>
            All
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getImpactColor = (value: number) => {
    if (value > 0.5) return COLORS.success;
    if (value > 0) return COLORS.warning;
    if (value < -0.5) return COLORS.error;
    return COLORS.textSecondary;
  };

  const getImpactIcon = (value: number) => {
    if (value > 0.2) return <TrendingUp color={getImpactColor(value)} size={16} />;
    if (value < -0.2) return <TrendingDown color={getImpactColor(value)} size={16} />;
    return null;
  };

  if (!correlationData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Heart color={COLORS.primary} size={28} />
          <Text style={styles.headerTitle}>Intimacy Correlations</Text>
        </View>
        <Text style={styles.subtitle}>
          Not enough data to show correlations. Log more intimacy entries to see insights.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView>
        <View style={styles.header}>
          <Heart color={COLORS.primary} size={28} />
          <Text style={styles.headerTitle}>Intimacy Correlations</Text>
        </View>

        <Text style={styles.subtitle}>
          See how intimacy patterns correlate with your mood and sleep
        </Text>

        {renderTimeRangeSelector()}

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{correlationData.intimacyFrequency.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>Times/Week</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: getImpactColor(correlationData.avgMoodChange) }]}>
                {correlationData.avgMoodChange > 0 ? '+' : ''}{correlationData.avgMoodChange.toFixed(1)}
              </Text>
              <Text style={styles.metricLabel}>Mood Change</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{correlationData.avgSleepQuality.toFixed(1)}/5</Text>
              <Text style={styles.metricLabel}>Sleep Quality</Text>
            </View>
          </View>
        </View>

        {/* Correlation Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Correlation Analysis</Text>
          
          <View style={styles.correlationCard}>
            <View style={styles.correlationItem}>
              <View style={styles.correlationHeader}>
                <Heart color={COLORS.error} size={20} />
                <Moon color={COLORS.primary} size={20} />
                <Text style={styles.correlationLabel}>Intimacy & Sleep</Text>
              </View>
              <View style={styles.correlationValue}>
                {getImpactIcon(correlationData.intimacySleepCorrelation)}
                <Text style={[styles.correlationText, { color: getImpactColor(correlationData.intimacySleepCorrelation) }]}>
                  {correlationData.intimacySleepCorrelation.toFixed(2)}
                </Text>
              </View>
            </View>
            
            <View style={styles.correlationItem}>
              <View style={styles.correlationHeader}>
                <Heart color={COLORS.error} size={20} />
                <Brain color={COLORS.success} size={20} />
                <Text style={styles.correlationLabel}>Intimacy & Mood</Text>
              </View>
              <View style={styles.correlationValue}>
                {getImpactIcon(correlationData.intimacyMoodCorrelation)}
                <Text style={[styles.correlationText, { color: getImpactColor(correlationData.intimacyMoodCorrelation) }]}>
                  {correlationData.intimacyMoodCorrelation.toFixed(2)}
                </Text>
              </View>
            </View>
            
            <View style={styles.correlationItem}>
              <View style={styles.correlationHeader}>
                <Heart color={COLORS.error} size={20} />
                <Text style={styles.correlationLabel}>With Toys</Text>
              </View>
              <View style={styles.correlationValue}>
                {getImpactIcon(correlationData.toysCorrelation)}
                <Text style={[styles.correlationText, { color: getImpactColor(correlationData.toysCorrelation) }]}>
                  {correlationData.toysCorrelation > 0 ? '+' : ''}{correlationData.toysCorrelation.toFixed(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.correlationItem}>
              <View style={styles.correlationHeader}>
                <Heart color={COLORS.error} size={20} />
                <Text style={styles.correlationLabel}>With Orgasm</Text>
              </View>
              <View style={styles.correlationValue}>
                {getImpactIcon(correlationData.orgasmCorrelation)}
                <Text style={[styles.correlationText, { color: getImpactColor(correlationData.orgasmCorrelation) }]}>
                  {correlationData.orgasmCorrelation > 0 ? '+' : ''}{correlationData.orgasmCorrelation.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightsContainer}>
            {correlationData.intimacySleepCorrelation > 0.3 && (
              <View style={styles.insightCard}>
                <TrendingUp color={COLORS.success} size={20} />
                <Text style={styles.insightText}>
                  Intimacy is positively correlated with better sleep quality.
                </Text>
              </View>
            )}
            
            {correlationData.intimacyMoodCorrelation > 0.3 && (
              <View style={styles.insightCard}>
                <TrendingUp color={COLORS.success} size={20} />
                <Text style={styles.insightText}>
                  Intimacy tends to improve your mood the next day.
                </Text>
              </View>
            )}
            
            {correlationData.orgasmCorrelation > 1.0 && (
              <View style={styles.insightCard}>
                <Heart color={COLORS.error} size={20} />
                <Text style={styles.insightText}>
                  Orgasm is associated with significant mood improvements.
                </Text>
              </View>
            )}
            
            {correlationData.toysCorrelation > 0.5 && (
              <View style={styles.insightCard}>
                <Heart color={COLORS.error} size={20} />
                <Text style={styles.insightText}>
                  Using toys is linked to better mood outcomes.
                </Text>
              </View>
            )}
            
            {correlationData.intimacyFrequency < 1 && (
              <View style={styles.insightCard}>
                <Calendar color={COLORS.warning} size={20} />
                <Text style={styles.insightText}>
                  Consider increasing intimacy frequency for better overall wellbeing.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontWeight: '700',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  selectorContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  selectorTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  selectorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectorButton: {
    flex: 1,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
  },
  selectorButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: COLORS.surface,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  metricValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  correlationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  correlationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  correlationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  correlationLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  correlationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  correlationText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
  },
  insightsContainer: {
    gap: SPACING.md,
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  insightText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
});