import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { COLORS, SPACING } from '@/constants/theme';

interface MoodEntry {
  date: string;
  moodValue: number;
  moodName: string;
}

interface SleepEntry {
  date: string;
  quality: number;
}

interface MentalClarityEntry {
  date: string;
  score: number;
}

interface StatisticsVisualizationProps {
  moodData: MoodEntry[];
  sleepData: SleepEntry[];
  mentalClarityData?: MentalClarityEntry[];
}

const screenWidth = Dimensions.get('window').width;

const StatisticsVisualization: React.FC<StatisticsVisualizationProps> = ({ 
  moodData, 
  sleepData,
  mentalClarityData
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Filter data based on time range
  const filterDataByTimeRange = (data: any[], range: 'week' | 'month' | 'year') => {
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return data.filter(item => new Date(item.date) >= startDate);
  };

  // Get filtered data
  const filteredMoodData = filterDataByTimeRange(moodData, timeRange);
  const filteredSleepData = filterDataByTimeRange(sleepData, timeRange);
  const filteredMentalClarityData = mentalClarityData ? filterDataByTimeRange(mentalClarityData, timeRange) : [];

  // Function to get day of week from date string
  const getDayOfWeek = (dateString: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // Function to find peak and bottom days
  const analyzePeakAndBottomDays = () => {
    // Group data by day of week
    const moodByDay: { [key: string]: number[] } = {};
    const sleepByDay: { [key: string]: number[] } = {};
    const clarityByDay: { [key: string]: number[] } = {};

    // Initialize arrays for each day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days.forEach(day => {
      moodByDay[day] = [];
      sleepByDay[day] = [];
      clarityByDay[day] = [];
    });

    // Populate mood data by day
    filteredMoodData.forEach(entry => {
      const day = getDayOfWeek(entry.date);
      moodByDay[day].push(entry.moodValue);
    });

    // Populate sleep data by day
    filteredSleepData.forEach(entry => {
      const day = getDayOfWeek(entry.date);
      sleepByDay[day].push(entry.quality);
    });

    // Populate mental clarity data by day
    if (filteredMentalClarityData.length > 0) {
      filteredMentalClarityData.forEach(entry => {
        const day = getDayOfWeek(entry.date);
        clarityByDay[day].push(entry.score);
      });
    }

    // Calculate averages for each day
    const moodAverages: { [key: string]: number } = {};
    const sleepAverages: { [key: string]: number } = {};
    const clarityAverages: { [key: string]: number } = {};

    days.forEach(day => {
      moodAverages[day] = moodByDay[day].length > 0 
        ? moodByDay[day].reduce((sum, val) => sum + val, 0) / moodByDay[day].length 
        : 0;
      
      sleepAverages[day] = sleepByDay[day].length > 0 
        ? sleepByDay[day].reduce((sum, val) => sum + val, 0) / sleepByDay[day].length 
        : 0;
      
      clarityAverages[day] = clarityByDay[day].length > 0 
        ? clarityByDay[day].reduce((sum, val) => sum + val, 0) / clarityByDay[day].length 
        : 0;
    });

    // Find peak and bottom days
    const getPeakAndBottomDays = (data: { [key: string]: number }) => {
      let peakDay = '';
      let peakValue = -Infinity;
      let bottomDay = '';
      let bottomValue = Infinity;

      Object.entries(data).forEach(([day, value]) => {
        if (value > 0) { // Only consider days with data
          if (value > peakValue) {
            peakValue = value;
            peakDay = day;
          }
          if (value < bottomValue) {
            bottomValue = value;
            bottomDay = day;
          }
        }
      });

      return { peakDay, bottomDay };
    };

    const moodDays = getPeakAndBottomDays(moodAverages);
    const sleepDays = getPeakAndBottomDays(sleepAverages);
    const clarityDays = getPeakAndBottomDays(clarityAverages);

    return { moodDays, sleepDays, clarityDays };
  };

  // Prepare data for pie chart - mood distribution
  const prepareMoodDistributionData = () => {
    // Group data by mood value for distribution
    const moodDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredMoodData.forEach(item => {
      moodDistribution[item.moodValue] = (moodDistribution[item.moodValue] || 0) + 1;
    });
    
    return [
      {
        name: 'Awful',
        population: moodDistribution[1],
        color: COLORS.moodAwful,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'Bad',
        population: moodDistribution[2],
        color: COLORS.moodBad,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'Meh',
        population: moodDistribution[3],
        color: COLORS.moodMeh,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'Good',
        population: moodDistribution[4],
        color: COLORS.moodGood,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'Rad',
        population: moodDistribution[5],
        color: COLORS.moodRad,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      }
    ];
  };

  // Prepare data for pie chart - sleep quality distribution
  const prepareSleepQualityData = () => {
    // Group data by sleep quality (1-5 scale)
    const sleepDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredSleepData.forEach(item => {
      const quality = Math.round(item.quality);
      sleepDistribution[quality] = (sleepDistribution[quality] || 0) + 1;
    });
    
    return [
      {
        name: 'Poor',
        population: sleepDistribution[1],
        color: COLORS.moodAwful,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'Fair',
        population: sleepDistribution[2],
        color: COLORS.moodBad,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'Average',
        population: sleepDistribution[3],
        color: COLORS.moodMeh,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'Good',
        population: sleepDistribution[4],
        color: COLORS.moodGood,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'Excellent',
        population: sleepDistribution[5],
        color: COLORS.moodRad,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      }
    ];
  };

  // Prepare data for pie chart - combined metrics
  const prepareCombinedMetricsData = () => {
    const moodAvg = filteredMoodData.length > 0 
      ? filteredMoodData.reduce((sum, item) => sum + item.moodValue, 0) / filteredMoodData.length
      : 0;
      
    const sleepAvg = filteredSleepData.length > 0 
      ? filteredSleepData.reduce((sum, item) => sum + item.quality, 0) / filteredSleepData.length
      : 0;
      
    const clarityAvg = filteredMentalClarityData.length > 0 
      ? filteredMentalClarityData.reduce((sum, item) => sum + item.score, 0) / filteredMentalClarityData.length
      : 0;
    
    const data = [
      {
        name: 'Mood Avg',
        population: parseFloat(moodAvg.toFixed(1)),
        color: COLORS.moodGood,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      },
      {
        name: 'Sleep Avg',
        population: parseFloat(sleepAvg.toFixed(1)),
        color: COLORS.primary,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      }
    ];
    
    // Only add mental clarity if we have data
    if (filteredMentalClarityData.length > 0) {
      data.push({
        name: 'Clarity Avg',
        population: parseFloat(clarityAvg.toFixed(1)),
        color: COLORS.accent,
        legendFontColor: COLORS.textSecondary,
        legendFontSize: 12
      });
    }
    
    return data;
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
          style={[styles.selectorButton, timeRange === 'year' && styles.selectedButton]}
          onPress={() => setTimeRange('year')}
        >
          <Text style={[styles.selectorButtonText, timeRange === 'year' && styles.selectedButtonText]}>
            Year
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Platform-specific pie chart rendering
  const renderPieChart = (data: any[], title: string) => {
    // For web platform, we might want to use a different approach or skip the chart
    if (Platform.OS === 'web') {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{title}</Text>
          <View style={[styles.chartPlaceholder, { width: screenWidth - 32, height: 220 }]}>
            <Text style={styles.placeholderText}>Chart not available on web</Text>
          </View>
          {/* Custom legend */}
          <View style={styles.chartLegend}>
            {data.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.name}</Text>
                <Text style={styles.legendValue}>{item.population}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <PieChart
          data={data}
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
    );
  };

  // Render all pie charts
  const renderCharts = () => (
    <>
      {renderPieChart(prepareMoodDistributionData(), "Mood Distribution")}
      {renderPieChart(prepareSleepQualityData(), "Sleep Quality Distribution")}
      {renderPieChart(prepareCombinedMetricsData(), "Combined Metrics")}
    </>
  );

  // Render peak/bottom days section
  const renderPeakBottomDays = () => {
    const { moodDays, sleepDays, clarityDays } = analyzePeakAndBottomDays();
    
    return (
      <View style={styles.peakBottomContainer}>
        <Text style={styles.sectionTitle}>Weekly Patterns</Text>
        
        <View style={styles.patternCard}>
          <View style={styles.patternRow}>
            <View style={[styles.patternIcon, { backgroundColor: COLORS.moodGood }]}>
              <Text style={styles.patternIconText}>M</Text>
            </View>
            <View style={styles.patternTextContainer}>
              <Text style={styles.patternTitle}>Mood</Text>
              {moodDays.peakDay ? (
                <Text style={styles.patternDescription}>
                  Peak on <Text style={styles.patternHighlight}>{moodDays.peakDay}</Text>. 
                  Lowest on <Text style={styles.patternHighlight}>{moodDays.bottomDay}</Text>.
                </Text>
              ) : (
                <Text style={styles.patternDescription}>Not enough data</Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.patternCard}>
          <View style={styles.patternRow}>
            <View style={[styles.patternIcon, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.patternIconText}>S</Text>
            </View>
            <View style={styles.patternTextContainer}>
              <Text style={styles.patternTitle}>Sleep</Text>
              {sleepDays.peakDay ? (
                <Text style={styles.patternDescription}>
                  Best on <Text style={styles.patternHighlight}>{sleepDays.peakDay}</Text>. 
                  Worst on <Text style={styles.patternHighlight}>{sleepDays.bottomDay}</Text>.
                </Text>
              ) : (
                <Text style={styles.patternDescription}>Not enough data</Text>
              )}
            </View>
          </View>
        </View>
        
        {filteredMentalClarityData.length > 0 && (
          <View style={styles.patternCard}>
            <View style={styles.patternRow}>
              <View style={[styles.patternIcon, { backgroundColor: COLORS.accent }]}>
                <Text style={styles.patternIconText}>C</Text>
              </View>
              <View style={styles.patternTextContainer}>
                <Text style={styles.patternTitle}>Mental Clarity</Text>
                {clarityDays.peakDay ? (
                  <Text style={styles.patternDescription}>
                    Peak on <Text style={styles.patternHighlight}>{clarityDays.peakDay}</Text>. 
                    Lowest on <Text style={styles.patternHighlight}>{clarityDays.bottomDay}</Text>.
                  </Text>
                ) : (
                  <Text style={styles.patternDescription}>Not enough data</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics & Analytics</Text>
      
      {renderTimeRangeSelector()}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {renderCharts()}
      </ScrollView>
      
      {/* Add the new peak/bottom days section */}
      {renderPeakBottomDays()}
      
      <View style={styles.statsSummary}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{filteredMoodData.length}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {filteredMoodData.length > 0 
              ? (filteredMoodData.reduce((sum, item) => sum + item.moodValue, 0) / filteredMoodData.length).toFixed(1) 
              : '0.0'}
          </Text>
          <Text style={styles.statLabel}>Avg Mood</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {filteredSleepData.length > 0 
              ? (filteredSleepData.reduce((sum, item) => sum + item.quality, 0) / filteredSleepData.length).toFixed(1) 
              : '0.0'}
          </Text>
          <Text style={styles.statLabel}>Avg Sleep</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    margin: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  selectorContainer: {
    marginBottom: SPACING.md,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  selectorButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  selectorButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectorButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: COLORS.text,
  },
  chartContainer: {
    marginRight: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    width: screenWidth - 32,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  chartPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    marginVertical: SPACING.sm,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  chartLegend: {
    marginTop: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  legendText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  legendValue: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 12,
  },
  
  peakBottomContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  patternCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patternIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  patternIconText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  patternTextContainer: {
    flex: 1,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  patternDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  patternHighlight: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default StatisticsVisualization;