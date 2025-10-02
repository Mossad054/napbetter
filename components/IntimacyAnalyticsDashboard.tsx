import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useMoodStore } from '@/hooks/mood-store';
import { IntimacyEntry } from '@/types/mood';
import { BarChart as BarIcon, Moon, Heart, TrendingUp, Calendar } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

export default function IntimacyAnalyticsDashboard() {
  const insets = useSafeAreaInsets();
  const { getIntimacyEntries } = useMoodStore();
  const [intimacyEntries, setIntimacyEntries] = useState<IntimacyEntry[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [chartType, setChartType] = useState<'frequency' | 'mood' | 'sleep'>('frequency');

  useEffect(() => {
    loadIntimacyData();
  }, []);

  const loadIntimacyData = async () => {
    try {
      const entries = await getIntimacyEntries();
      setIntimacyEntries(entries);
    } catch (error) {
      console.error('Error loading intimacy data:', error);
    }
  };

  // Filter data based on time range
  const filterDataByTimeRange = (data: IntimacyEntry[], range: 'week' | 'month' | 'all') => {
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
    
    return data.filter(entry => new Date(entry.date) >= startDate);
  };

  // Get filtered data
  const filteredData = filterDataByTimeRange(intimacyEntries, timeRange);

  // Prepare data for charts
  const prepareFrequencyData = (): ChartData => {
    // Group by date for line chart
    const dateCounts: { [key: string]: number } = {};
    filteredData.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const labels = Object.keys(dateCounts);
    const data = Object.values(dateCounts);

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  const prepareTypeDistributionData = () => {
    const typeCounts = { solo: 0, couple: 0 };
    filteredData.forEach(entry => {
      if (entry.type === 'solo') typeCounts.solo++;
      else typeCounts.couple++;
    });

    return [
      {
        name: 'Solo',
        population: typeCounts.solo,
        color: '#3498db',
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'Couple',
        population: typeCounts.couple,
        color: '#e74c3c',
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      }
    ];
  };

  const prepareMoodChangeData = (): ChartData => {
    // Calculate mood change for each entry
    const moodChanges = filteredData.map(entry => entry.moodAfter - entry.moodBefore);
    const dates = filteredData.map(entry => 
      new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    return {
      labels: dates,
      datasets: [
        {
          data: moodChanges,
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  const prepareOrgasmData = () => {
    const orgasmCounts = { yes: 0, no: 0 };
    filteredData.forEach(entry => {
      if (entry.orgasmed) orgasmCounts.yes++;
      else orgasmCounts.no++;
    });

    return [
      {
        name: 'Orgasmed',
        population: orgasmCounts.yes,
        color: '#9b59b6',
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'No Orgasm',
        population: orgasmCounts.no,
        color: '#bdc3c7',
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      }
    ];
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

  const renderChartTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Chart Type</Text>
      <View style={styles.selectorButtons}>
        <TouchableOpacity
          style={[styles.selectorButton, chartType === 'frequency' && styles.selectedButton]}
          onPress={() => setChartType('frequency')}
        >
          <Text style={[styles.selectorButtonText, chartType === 'frequency' && styles.selectedButtonText]}>
            Frequency
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectorButton, chartType === 'mood' && styles.selectedButton]}
          onPress={() => setChartType('mood')}
        >
          <Text style={[styles.selectorButtonText, chartType === 'mood' && styles.selectedButtonText]}>
            Mood Change
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectorButton, chartType === 'sleep' && styles.selectedButton]}
          onPress={() => setChartType('sleep')}
        >
          <Text style={[styles.selectorButtonText, chartType === 'sleep' && styles.selectedButtonText]}>
            Distribution
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFrequencyChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <BarIcon color={COLORS.primary} size={20} />
        <Text style={styles.chartTitle}>Intimacy Frequency Over Time</Text>
      </View>
      <LineChart
        data={prepareFrequencyData()}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.surface,
          backgroundGradientFrom: COLORS.surface,
          backgroundGradientTo: COLORS.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: BORDER_RADIUS.md
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: COLORS.primary
          }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );

  const renderMoodChangeChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <TrendingUp color={COLORS.success} size={20} />
        <Text style={styles.chartTitle}>Mood Change After Intimacy</Text>
      </View>
      <BarChart
        data={{
          labels: filteredData.map(entry => 
            new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          ),
          datasets: [
            {
              data: filteredData.map(entry => entry.moodAfter - entry.moodBefore)
            }
          ]
        }}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: COLORS.surface,
          backgroundGradientFrom: COLORS.surface,
          backgroundGradientTo: COLORS.surface,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
          labelColor: (opacity = 1) => COLORS.textSecondary,
          style: {
            borderRadius: BORDER_RADIUS.md
          },
          propsForBackgroundLines: {
            strokeDasharray: ''
          }
        }}
        style={styles.chart}
      />
    </View>
  );

  const renderDistributionCharts = () => (
    <View style={styles.distributionChartsContainer}>
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Heart color={COLORS.error} size={20} />
          <Text style={styles.chartTitle}>Intimacy Type Distribution</Text>
        </View>
        <PieChart
          data={prepareTypeDistributionData()}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: COLORS.surface,
            backgroundGradientFrom: COLORS.surface,
            backgroundGradientTo: COLORS.surface,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Moon color={COLORS.primary} size={20} />
          <Text style={styles.chartTitle}>Orgasm Frequency</Text>
        </View>
        <PieChart
          data={prepareOrgasmData()}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: COLORS.surface,
            backgroundGradientFrom: COLORS.surface,
            backgroundGradientTo: COLORS.surface,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    </View>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'frequency':
        return renderFrequencyChart();
      case 'mood':
        return renderMoodChangeChart();
      case 'sleep':
        return renderDistributionCharts();
      default:
        return renderFrequencyChart();
    }
  };

  // Calculate summary statistics
  const totalEntries = filteredData.length;
  const avgMoodBefore = totalEntries > 0 
    ? (filteredData.reduce((sum, entry) => sum + entry.moodBefore, 0) / totalEntries).toFixed(1) 
    : '0.0';
  const avgMoodAfter = totalEntries > 0 
    ? (filteredData.reduce((sum, entry) => sum + entry.moodAfter, 0) / totalEntries).toFixed(1) 
    : '0.0';
  const avgTimeToSleep = totalEntries > 0 
    ? (filteredData.reduce((sum, entry) => sum + entry.timeToSleep, 0) / totalEntries).toFixed(0) 
    : '0';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView>
        <View style={styles.header}>
          <Heart color={COLORS.primary} size={28} />
          <Text style={styles.headerTitle}>Intimacy Analytics</Text>
        </View>

        <Text style={styles.subtitle}>
          Track patterns and insights in your intimacy experiences
        </Text>

        {renderTimeRangeSelector()}
        {renderChartTypeSelector()}

        {renderChart()}

        {/* Summary Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Summary Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalEntries}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{avgMoodBefore}</Text>
              <Text style={styles.statLabel}>Avg Mood Before</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{avgMoodAfter}</Text>
              <Text style={styles.statLabel}>Avg Mood After</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{avgTimeToSleep}m</Text>
              <Text style={styles.statLabel}>Avg Time to Sleep</Text>
            </View>
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
    marginBottom: SPACING.md,
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
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  chartTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  chart: {
    marginVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  distributionChartsContainer: {
    gap: SPACING.lg,
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    margin: SPACING.lg,
  },
  statsTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.md,
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});