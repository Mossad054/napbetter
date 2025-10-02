import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Modal } from 'react-native';
import { Animated } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { CheckCircle, XCircle, TrendingUp, TrendingDown, TestTube, ChevronDown, ChevronUp, X } from 'lucide-react-native';
import Svg, { Path, Line, G, Text as SvgText, Circle, Rect, Polyline } from 'react-native-svg';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    margin: 20,
    marginTop: 30,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeFilterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  selectedTimeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  timeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  selectedTimeFilterText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: BORDER_RADIUS.lg,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  singleDayContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  singleDayEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  singleDayHours: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 5,
  },
  singleDayText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  pieChartLabels: {
    flex: 1,
    marginLeft: 20,
  },
  pieChartLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieChartDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  pieChartLabelText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  moodDistribution: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  distributionSegment: {
    height: '100%',
  },
  distributionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distributionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  distributionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  distributionLabelText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  engagementText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },
  bar: {
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  countLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 24,
    textAlign: 'right',
  },
  impactSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  impactLists: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactColumn: {
    flex: 1,
    marginRight: 16,
  },
  impactColumnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    marginBottom: 8,
  },
  impactTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  impactActivity: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  impactValue: {
    fontSize: 12,
    color: COLORS.success,
  },
  negativeImpact: {
    color: COLORS.error,
  },
  averageContainer: {
    alignItems: 'center',
  },
  averageHours: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  averageLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emojiTrend: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emojiTrendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  emojiScrollView: {
    flexDirection: 'row',
  },
  emojiItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  emojiIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  emojiHours: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  consistencySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  consistencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  consistencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRing: {
    width: 60,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  consistencyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  ringContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  streakSection: {
    marginTop: 16,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedDay: {
    backgroundColor: COLORS.primary,
  },
  skippedDay: {
    backgroundColor: COLORS.border,
  },
  calendarDayText: {
    fontSize: 16,
  },
  emptyDay: {
    width: 36,
    height: 36,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    margin: 20,
    marginTop: 30,
  },
  experimentsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  experimentsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  experimentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  experimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  experimentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experimentEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  experimentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  activeIndicator: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  completedIndicator: {
    backgroundColor: COLORS.textSecondary,
  },
  completedText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  resultsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  resultsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultItem: {
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  resultValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '48%',
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  activityOverview: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  analysisSection: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  analysisLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  analysisLabelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  analysisDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  recommendationsList: {
    paddingLeft: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 10,
    marginTop: 6,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  // Experiment Modal Styles
  experimentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  experimentModalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  experimentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  experimentModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  experimentModalContent: {
    flex: 1,
  },
  experimentOverview: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  experimentName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  experimentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  experimentStatItem: {
    alignItems: 'center',
  },
  experimentStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  experimentStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  experimentDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  progressInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  progressInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  progressInfoText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  experimentResultsSection: {
    marginBottom: 20,
  },
  experimentResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  experimentResultsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  experimentResultItem: {
    alignItems: 'center',
  },
  experimentResultLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  experimentResultValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experimentResultValue: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  experimentRecommendationsSection: {
    marginBottom: 20,
  },
  experimentRecommendationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  experimentRecommendationsList: {
    paddingLeft: 10,
  },
  experimentRecommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  experimentRecommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 10,
    marginTop: 6,
  },
  experimentRecommendationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  }
});

// Types
type TimeRange = 'today' | 'week' | 'month' | 'year';
type MoodType = 'good' | 'neutral' | 'bad';

interface MoodData {
  date: string;
  score: number;
  emoji: string;
}

interface ActivityData {
  category: string;
  count: number;
  impact: number;
  color: string;
}

interface SleepData {
  date: string;
  hours: number;
  quality: string;
  emoji: string;
}

interface HabitData {
  date: string;
  completed: boolean;
}

interface ExperimentData {
  id: string;
  title: string;
  emoji: string;
  isActive: boolean;
  currentDay: number;
  totalDays: number;
  category: string;
  results: {
    moodChange?: number;
    sleepChange?: number;
    clarityChange?: number;
  };
}

interface InsightCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface MoodStreak {
  count: number;
  type: MoodType;
}

// Mock data functions
const getMoodData = (range: TimeRange): MoodData[] => {
  const baseDate = new Date();
  const data: MoodData[] = [];
  
  switch (range) {
    case 'today':
      return [{ date: new Date().toISOString().split('T')[0], score: 4, emoji: '😊' }];
    case 'week':
      for (let i = 6; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          score: 3 + Math.floor(Math.random() * 2),
          emoji: ['😢', '😐', '😊', '😄'][Math.floor(Math.random() * 4)]
        });
      }
      break;
    case 'month':
      for (let i = 29; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          score: 2 + Math.floor(Math.random() * 3),
          emoji: ['😢', '😐', '😊', '😄'][Math.floor(Math.random() * 4)]
        });
      }
      break;
    case 'year':
      for (let i = 11; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setMonth(baseDate.getMonth() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          score: 2 + Math.floor(Math.random() * 3),
          emoji: ['😢', '😐', '😊', '😄'][Math.floor(Math.random() * 4)]
        });
      }
      break;
  }
  
  return data;
};

const getActivityData = (range: TimeRange): ActivityData[] => {
  return [
    { category: 'Exercise', count: range === 'today' ? 1 : range === 'week' ? 5 : range === 'month' ? 18 : 120, impact: 1.8, color: COLORS.success },
    { category: 'Meditation', count: range === 'today' ? 0 : range === 'week' ? 3 : range === 'month' ? 12 : 90, impact: 1.2, color: COLORS.primary },
    { category: 'Social Time', count: range === 'today' ? 2 : range === 'week' ? 8 : range === 'month' ? 22 : 180, impact: 0.9, color: COLORS.accent },
    { category: 'Screen Time', count: range === 'today' ? 4 : range === 'week' ? 25 : range === 'month' ? 100 : 800, impact: -0.7, color: COLORS.error },
    { category: 'Reading', count: range === 'today' ? 0 : range === 'week' ? 2 : range === 'month' ? 8 : 60, impact: 0.5, color: COLORS.warning },
  ];
};

const getSleepData = (range: TimeRange): SleepData[] => {
  const baseDate = new Date();
  const data: SleepData[] = [];
  
  switch (range) {
    case 'today':
      return [{ date: new Date().toISOString().split('T')[0], hours: 7.5, quality: 'good', emoji: '😴' }];
    case 'week':
      for (let i = 6; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() - i);
        const hours = 6 + Math.random() * 3;
        const quality = hours > 7.5 ? 'excellent' : hours > 6.5 ? 'good' : hours > 5.5 ? 'fair' : 'poor';
        const emoji = hours > 7.5 ? '😴' : hours > 6.5 ? '😌' : hours > 5.5 ? '😐' : '😴';
        data.push({ date: date.toISOString().split('T')[0], hours, quality, emoji });
      }
      break;
    case 'month':
      for (let i = 29; i >= 0; i -= 5) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() - i);
        const hours = 6 + Math.random() * 3;
        const quality = hours > 7.5 ? 'excellent' : hours > 6.5 ? 'good' : hours > 5.5 ? 'fair' : 'poor';
        const emoji = hours > 7.5 ? '😴' : hours > 6.5 ? '😌' : hours > 5.5 ? '😐' : '😴';
        data.push({ date: date.toISOString().split('T')[0], hours, quality, emoji });
      }
      break;
    case 'year':
      for (let i = 11; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setMonth(baseDate.getMonth() - i);
        const hours = 6 + Math.random() * 3;
        const quality = hours > 7.5 ? 'excellent' : hours > 6.5 ? 'good' : hours > 5.5 ? 'fair' : 'poor';
        const emoji = hours > 7.5 ? '😴' : hours > 6.5 ? '😌' : hours > 5.5 ? '😐' : '😴';
        data.push({ date: date.toISOString().split('T')[0], hours, quality, emoji });
      }
      break;
  }
  
  return data;
};

const getHabitData = (range: TimeRange): HabitData[] => {
  const baseDate = new Date();
  const data: HabitData[] = [];
  
  switch (range) {
    case 'today':
      return [{ date: new Date().toISOString().split('T')[0], completed: Math.random() > 0.3 }];
    case 'week':
      for (let i = 6; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() - i);
        data.push({ date: date.toISOString().split('T')[0], completed: Math.random() > 0.2 });
      }
      break;
    case 'month':
      for (let i = 29; i >= 0; i--) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() - i);
        data.push({ date: date.toISOString().split('T')[0], completed: Math.random() > 0.2 });
      }
      break;
    case 'year':
      for (let i = 364; i >= 0; i -= 12) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() - i);
        data.push({ date: date.toISOString().split('T')[0], completed: Math.random() > 0.2 });
      }
      break;
  }
  
  return data;
};

const getExperimentData = (): ExperimentData[] => {
  return [
    {
      id: '1',
      title: 'Morning Meditation',
      emoji: '🧘',
      isActive: true,
      currentDay: 7,
      totalDays: 21,
      category: 'mood',
      results: {
        moodChange: 0.8,
        sleepChange: 0.3,
        clarityChange: 1.2
      }
    },
    {
      id: '2',
      title: 'No Screens Before Bed',
      emoji: '📵',
      isActive: false,
      currentDay: 0,
      totalDays: 14,
      category: 'sleep',
      results: {
        moodChange: 0.2,
        sleepChange: 1.5,
        clarityChange: 0.7
      }
    }
  ];
};

const getMoodStreak = (data: MoodData[]): MoodStreak => {
  if (data.length === 0) return { count: 0, type: 'good' };
  
  let streak = 0;
  const today = new Date();
  
  // Simplified streak calculation
  for (let i = data.length - 1; i >= 0; i--) {
    const entryDate = new Date(data[i].date);
    const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= streak) {
      streak++;
    } else {
      break;
    }
  }
  
  // Determine streak type based on most recent mood
  const lastMood = data[data.length - 1]?.score || 3;
  const type: MoodType = lastMood >= 4 ? 'good' : lastMood === 3 ? 'neutral' : 'bad';
  
  return { count: streak, type };
};

const getHabitCompletionRate = (data: HabitData[]) => {
  if (data.length === 0) return 0;
  const completed = data.filter(d => d.completed).length;
  return Math.round((completed / data.length) * 100);
};

const getMoreInsightsData = (): InsightCategory[] => {
  return [
    {
      id: 'productivity',
      title: 'Productivity Patterns',
      description: 'Your most productive hours are between 9 AM - 11 AM',
      icon: '📈',
      color: COLORS.primary
    },
    {
      id: 'energy',
      title: 'Energy Levels',
      description: 'You report highest energy levels after exercise',
      icon: '⚡',
      color: COLORS.success
    },
    {
      id: 'focus',
      title: 'Focus Insights',
      description: 'Short meditation sessions improve focus by 25%',
      icon: '🎯',
      color: COLORS.accent
    },
    {
      id: 'social',
      title: 'Social Impact',
      description: 'Social interactions boost mood for 24-48 hours',
      icon: '👥',
      color: COLORS.warning
    }
  ];
};

// TimeFilter Component
// TimeFilter Section
interface TimeFilterProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ selectedRange, onRangeChange }) => {
  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];

  return (
    <View style={styles.timeFilterContainer}>
      {timeRanges.map((range) => (
        <TouchableOpacity
          key={range.id}
          style={[
            styles.timeFilterButton,
            selectedRange === range.id && styles.selectedTimeFilterButton,
          ]}
          onPress={() => onRangeChange(range.id)}
        >
          <Text
            style={[
              styles.timeFilterText,
              selectedRange === range.id && styles.selectedTimeFilterText,
            ]}
          >
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// MoodTracking Component
// Mood Tracking Section
interface MoodTrackingProps {
  data: MoodData[];
  timeRange: TimeRange;
}

const MoodTracking: React.FC<MoodTrackingProps> = ({ data, timeRange }) => {
  const { width } = useWindowDimensions();
  const streak = getMoodStreak(data);
  
  const getStreakColor = (type: MoodType) => {
    switch (type) {
      case 'good': return COLORS.success;
      case 'neutral': return COLORS.warning;
      case 'bad': return COLORS.error;
    }
  };

  const getStreakText = (type: MoodType) => {
    switch (type) {
      case 'good': return 'good mood';
      case 'neutral': return 'neutral mood';
      case 'bad': return 'challenging';
    }
  };

  const getMoodDistribution = () => {
    const goodCount = data.filter(d => d.score >= 4).length;
    const neutralCount = data.filter(d => d.score === 3).length;
    const badCount = data.filter(d => d.score <= 2).length;
    const total = data.length || 1;
    
    return {
      good: { count: goodCount, percentage: Math.round((goodCount / total) * 100) },
      neutral: { count: neutralCount, percentage: Math.round((neutralCount / total) * 100) },
      bad: { count: badCount, percentage: Math.round((badCount / total) * 100) }
    };
  };

  const renderPieChart = () => {
    const distribution = getMoodDistribution();
    const chartSize = 120;
    const radius = 50;
    const centerX = chartSize / 2;
    const centerY = chartSize / 2;
    
    let currentAngle = -90; // Start from top
    const segments = [
      { ...distribution.good, color: COLORS.success, label: 'Good' },
      { ...distribution.neutral, color: COLORS.warning, label: 'Neutral' },
      { ...distribution.bad, color: COLORS.error, label: 'Challenging' }
    ].filter(segment => segment.percentage > 0);
    
    return (
      <View style={styles.pieChartContainer}>
        <Svg width={chartSize} height={chartSize}>
          {segments.map((segment, index) => {
            const angle = (segment.percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <Path
                key={`segment-${segment.label}-${index}`}
                d={pathData}
                fill={segment.color}
                stroke={COLORS.text}
                strokeWidth={2}
              />
            );
          })}
        </Svg>
        <View style={styles.pieChartLabels}>
          {segments.map((segment, index) => (
            <View key={`label-${segment.label}-${index}`} style={styles.pieChartLabel}>
              <View style={[styles.pieChartDot, { backgroundColor: segment.color }]} />
              <Text style={styles.pieChartLabelText}>
                {segment.label} ({segment.percentage}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    const chartWidth = width - 80;
    const chartHeight = 200;
    const padding = { left: 50, top: 20, right: 40, bottom: 50 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const points = data.map((item, index) => {
      const x = padding.left + (index / (data.length - 1)) * plotWidth;
      const y = padding.top + ((5 - item.score) / 4) * plotHeight;
      return { x, y, score: item.score, emoji: item.emoji, date: item.date };
    });

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    const formatXAxisLabel = (date: string, index: number) => {
      if (timeRange === 'month') {
        const d = new Date(date);
        return index % 5 === 0 ? `${d.getMonth() + 1}/${d.getDate()}` : '';
      } else if (timeRange === 'year') {
        const d = new Date(date);
        return index % 2 === 0 ? d.toLocaleDateString('en', { month: 'short' }) : '';
      }
      return '';
    };

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {[1, 2, 3, 4, 5].map((score) => {
          const y = padding.top + ((5 - score) / 4) * plotHeight;
          return (
            <G key={score}>
              <Line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke={COLORS.border}
                strokeWidth={1}
              />
              <SvgText
                x={padding.left - 10}
                y={y + 4}
                fontSize={12}
                fill={COLORS.textSecondary}
                textAnchor="end"
              >
                {score.toString()}
              </SvgText>
            </G>
          );
        })}
        
        {/* X-axis labels */}
        {points.map((point, index) => {
          const label = formatXAxisLabel(point.date, index);
          if (!label) return null;
          return (
            <SvgText
              key={`x-${index}`}
              x={point.x}
              y={chartHeight - padding.bottom + 20}
              fontSize={10}
              fill={COLORS.textSecondary}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
        
        {/* Y-axis label */}
        <SvgText
          x={15}
          y={chartHeight / 2}
          fontSize={12}
          fill={COLORS.textSecondary}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${chartHeight / 2})`}
        >
          {'Mood Score'}
        </SvgText>
        
        {/* X-axis label */}
        <SvgText
          x={chartWidth / 2}
          y={chartHeight - 10}
          fontSize={12}
          fill={COLORS.textSecondary}
          textAnchor="middle"
        >
          {timeRange === 'month' ? 'Days' : timeRange === 'year' ? 'Months' : 'Time'}
        </SvgText>
        
        {/* Line chart */}
        <Polyline
          points={pathData.replace(/[ML]/g, '').trim()}
          fill="none"
          stroke={COLORS.success}
          strokeWidth={3}
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={COLORS.success}
          />
        ))}
      </Svg>
    );
  };

  const renderChart = () => {
    if (data.length <= 1) {
      return (
        <View style={styles.singleDayContainer}>
          <Text style={styles.singleDayEmoji}>{data[0]?.emoji || '😐'}</Text>
          <Text style={styles.singleDayText}>
            You felt {data[0]?.emoji || '😐'} {getStreakText(streak.type as MoodType)} today
          </Text>
        </View>
      );
    }

    if (timeRange === 'week') {
      return renderPieChart();
    } else if (timeRange === 'month' || timeRange === 'year') {
      return renderLineChart();
    }

    // Default line chart for other cases
    return renderLineChart();
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Mood Tracking</Text>
        <View style={[styles.streakBadge, { backgroundColor: getStreakColor(streak.type as MoodType) }]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>
            {streak.count}-day {getStreakText(streak.type as MoodType)} streak
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {timeRange !== 'week' && (
        <View style={styles.moodDistribution}>
          <Text style={styles.distributionTitle}>Mood Distribution</Text>
          <View style={styles.distributionBar}>
            {(() => {
              const distribution = getMoodDistribution();
              return (
                <>
                  <View style={[styles.distributionSegment, { flex: distribution.good.percentage / 100, backgroundColor: COLORS.success }]} />
                  <View style={[styles.distributionSegment, { flex: distribution.neutral.percentage / 100, backgroundColor: COLORS.warning }]} />
                  <View style={[styles.distributionSegment, { flex: distribution.bad.percentage / 100, backgroundColor: COLORS.error }]} />
                </>
              );
            })()} 
          </View>
          <View style={styles.distributionLabels}>
            {(() => {
              const distribution = getMoodDistribution();
              return (
                <>
                  <View style={styles.distributionLabel}>
                    <View style={[styles.distributionDot, { backgroundColor: COLORS.success }]} />
                    <Text style={styles.distributionLabelText}>Good ({distribution.good.percentage}%)</Text>
                  </View>
                  <View style={styles.distributionLabel}>
                    <View style={[styles.distributionDot, { backgroundColor: COLORS.warning }]} />
                    <Text style={styles.distributionLabelText}>Neutral ({distribution.neutral.percentage}%)</Text>
                  </View>
                  <View style={styles.distributionLabel}>
                    <View style={[styles.distributionDot, { backgroundColor: COLORS.error }]} />
                    <Text style={styles.distributionLabelText}>Challenging ({distribution.bad.percentage}%)</Text>
                  </View>
                </>
              );
            })()} 
          </View>
        </View>
      )}
    </View>
  );
};

// ActivityTracking Component
// Activity Tracking Section
interface ActivityTrackingProps {
  data: ActivityData[];
  timeRange: TimeRange;
}

const ActivityTracking: React.FC<ActivityTrackingProps> = ({ data, timeRange }) => {
  const { width } = useWindowDimensions();
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  
  const maxCount = Math.max(...data.map(item => item.count));
  const chartWidth = width - 140;
  
  const positiveActivities = data
    .filter(item => item.impact > 0)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);
    
  const negativeActivities = data
    .filter(item => item.impact < 0)
    .sort((a, b) => a.impact - b.impact)
    .slice(0, 3);

  const getEngagementText = (count: number, category: string) => {
    if (timeRange === 'week') {
      return `Engaged ${count} times this week`;
    } else if (timeRange === 'month') {
      return `${count} activities this month`;
    } else if (timeRange === 'year') {
      return `${count} activities this year`;
    }
    return `${count} activities today`;
  };

  const handleActivityPress = (activity: ActivityData) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const getDetailedInsight = (activity: ActivityData) => {
    const impactType = activity.impact > 0 ? 'positive' : 'negative';
    const impactMagnitude = Math.abs(activity.impact);
    
    if (impactType === 'positive') {
      return {
        title: `${activity.category} Boosts Your Mood`,
        description: `Your ${activity.category.toLowerCase()} activities have a strong positive correlation with your mood. Each session tends to improve your mood by ${impactMagnitude.toFixed(1)} points on average.`,
        recommendations: [
          `Try to maintain your current ${activity.category.toLowerCase()} routine`,
          `Consider increasing frequency during challenging periods`,
          `Track specific ${activity.category.toLowerCase()} activities that work best for you`
        ],
        trend: 'up' as const
      };
    } else {
      return {
        title: `${activity.category} May Need Attention`,
        description: `Your ${activity.category.toLowerCase()} activities show a negative correlation with your mood, potentially reducing it by ${impactMagnitude.toFixed(1)} points on average.`,
        recommendations: [
          `Consider reducing time spent on ${activity.category.toLowerCase()}`,
          `Try to identify specific triggers within this category`,
          `Replace with mood-boosting alternatives when possible`
        ],
        trend: 'down' as const
      };
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.title}>Activity Tracking</Text>
      
      <View style={styles.chartContainer}>
        {data.map((item) => {
          const barWidth = (item.count / maxCount) * chartWidth;
          return (
            <View key={item.category} style={styles.barRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryLabel}>{item.category}</Text>
                {timeRange === 'week' && (
                  <Text style={styles.engagementText}>
                    {getEngagementText(item.count, item.category)}
                  </Text>
                )}
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      width: barWidth, 
                      backgroundColor: item.color 
                    }
                  ]} 
                />
                <Text style={styles.countLabel}>{item.count}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.impactSection}>
        <Text style={styles.impactTitle}>Activity Impact</Text>
        
        <View style={styles.impactLists}>
          <View style={styles.impactColumn}>
            <Text style={styles.impactColumnTitle}>Positive Impact</Text>
            {positiveActivities.map((activity) => (
              <TouchableOpacity 
                key={activity.category} 
                style={styles.impactItem}
                onPress={() => handleActivityPress(activity)}
                activeOpacity={0.7}
              >
                <CheckCircle size={16} color={COLORS.success} />
                <View style={styles.impactTextContainer}>
                  <Text style={styles.impactActivity}>{activity.category}</Text>
                  <Text style={styles.impactValue}>Mood +{activity.impact.toFixed(1)}</Text>
                </View>
                <TrendingUp size={12} color={COLORS.success} />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.impactColumn}>
            <Text style={styles.impactColumnTitle}>Needs Attention</Text>
            {negativeActivities.map((activity) => (
              <TouchableOpacity 
                key={activity.category} 
                style={styles.impactItem}
                onPress={() => handleActivityPress(activity)}
                activeOpacity={0.7}
              >
                <XCircle size={16} color={COLORS.error} />
                <View style={styles.impactTextContainer}>
                  <Text style={styles.impactActivity}>{activity.category}</Text>
                  <Text style={[styles.impactValue, styles.negativeImpact]}>
                    Mood {activity.impact.toFixed(1)}
                  </Text>
                </View>
                <TrendingDown size={12} color={COLORS.error} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Activity Details</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <XCircle size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                {/* Activity Overview */}
                <View style={styles.activityOverview}>
                  <Text style={styles.activityName}>{selectedActivity.category}</Text>
                  <View style={styles.activityStats}>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Frequency</Text>
                      <Text style={styles.modalStatValue}>{selectedActivity.count}x</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Mood Impact</Text>
                      <Text style={[
                        styles.modalStatValue,
                        { color: selectedActivity.impact > 0 ? COLORS.success : COLORS.error }
                      ]}>
                        {selectedActivity.impact > 0 ? '+' : ''}{selectedActivity.impact.toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Period</Text>
                      <Text style={styles.modalStatValue}>
                        {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Impact Analysis */}
                <View style={styles.analysisSection}>
                  <View style={[
                    styles.analysisLabel,
                    { backgroundColor: selectedActivity.impact > 0 ? COLORS.success + '20' : COLORS.error + '20' }
                  ]}>
                    <Text style={[
                      styles.analysisLabelText,
                      { color: selectedActivity.impact > 0 ? COLORS.success : COLORS.error }
                    ]}>
                      {selectedActivity.impact > 0 ? 'Positive Impact' : 'Needs Attention'}
                    </Text>
                  </View>
                  
                  <Text style={styles.analysisDescription}>
                    {selectedActivity.impact > 0
                      ? `This activity is positively correlated with your mood, boosting it by ${selectedActivity.impact.toFixed(1)} points on average.`
                      : `This activity shows a negative correlation with your mood, potentially reducing it by ${Math.abs(selectedActivity.impact).toFixed(1)} points on average.`}
                  </Text>
                </View>
                
                {/* Recommendations */}
                <View style={styles.recommendationsSection}>
                  <Text style={styles.modalSectionTitle}>Recommendations</Text>
                  <View style={styles.recommendationsList}>
                    {getDetailedInsight(selectedActivity).recommendations.slice(0, 3).map((rec, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <View style={styles.recommendationBullet} />
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// SleepTracking Component
// Sleep Tracking Section
interface SleepTrackingProps {
  data: SleepData[];
  timeRange: TimeRange;
}

const SleepTracking: React.FC<SleepTrackingProps> = ({ data, timeRange }) => {
  const { width } = useWindowDimensions();
  
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return COLORS.primary;
      case 'good': return COLORS.success;
      case 'fair': return COLORS.warning;
      case 'poor': return COLORS.error;
      default: return '#6B7280';
    }
  };

  const averageHours = data.reduce((sum, item) => sum + item.hours, 0) / data.length;
  const consistentNights = data.filter(item => item.hours >= 7 && item.hours <= 9).length;
  const consistencyPercentage = Math.round((consistentNights / data.length) * 100);

  const renderBarChart = () => {
    if (data.length <= 1) {
      const sleepData = data[0];
      return (
        <View style={styles.singleDayContainer}>
          <Text style={styles.singleDayEmoji}>{sleepData?.emoji || '😴'}</Text>
          <Text style={styles.singleDayHours}>{sleepData?.hours?.toFixed(1) || 0}h</Text>
          <Text style={styles.singleDayText}>
            {sleepData?.quality || 'fair'} sleep quality
          </Text>
        </View>
      );
    }

    const chartWidth = width - 80;
    const chartHeight = 120;
    const barWidth = (chartWidth - 40) / data.length;
    const maxHours = 10;

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {data.map((item, index) => {
          const barHeight = (item.hours / maxHours) * 80;
          const x = 20 + index * barWidth;
          const y = chartHeight - barHeight - 20;
          
          return (
            <Rect
              key={`${item.date}-${index}`}
              x={x}
              y={y}
              width={barWidth - 4}
              height={barHeight}
              fill={getQualityColor(item.quality)}
              rx={2}
            />
          );
        })}
      </Svg>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Sleep Tracking</Text>
        <View style={styles.averageContainer}>
          <Text style={styles.averageHours}>{averageHours.toFixed(1)}h</Text>
          <Text style={styles.averageLabel}>avg</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {renderBarChart()}
      </View>

      <View style={styles.emojiTrend}>
        <Text style={styles.emojiTrendTitle}>Quality Trend</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.emojiScrollView}
        >
          {data.map((item, index) => (
            <View key={`${item.date}-emoji-${index}`} style={styles.emojiItem}>
              <Text style={styles.emojiIcon}>{item.emoji}</Text>
              <Text style={styles.emojiHours}>{item.hours.toFixed(1)}h</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.consistencySection}>
        <Text style={styles.consistencyTitle}>Sleep Consistency</Text>
        <View style={styles.consistencyBadge}>
          <View style={styles.progressRing}>
            <View style={[styles.progressFill, { width: `${consistencyPercentage}%` }]} />
          </View>
          <Text style={styles.consistencyText}>
            {consistentNights}/{data.length} nights optimal (7-9h)
          </Text>
        </View>
      </View>
    </View>
  );
};

// HabitTracking Component
// Habit Tracking Section
interface HabitTrackingProps {
  data: HabitData[];
  timeRange: TimeRange;
}

const HabitTracking: React.FC<HabitTrackingProps> = ({ data, timeRange }) => {
  const completionRate = getHabitCompletionRate(data);
  
  const renderStreakCalendar = () => {
    if (timeRange === 'today') {
      const todayData = data[0];
      return (
        <View style={styles.singleDayContainer}>
          <Text style={styles.singleDayEmoji}>
            {todayData?.completed ? '🔥' : '⭕'}
          </Text>
          <Text style={styles.singleDayText}>
            {todayData?.completed ? 'Habit completed today!' : 'Complete your habit today'}
          </Text>
        </View>
      );
    }

    const daysPerRow = 7;
    const rows = Math.ceil(data.length / daysPerRow);
    
    return (
      <View style={styles.calendarContainer}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.calendarRow}>
            {Array.from({ length: daysPerRow }).map((_, colIndex) => {
              const dayIndex = rowIndex * daysPerRow + colIndex;
              const dayData = data[dayIndex];
              
              if (!dayData) return <View key={`empty-${rowIndex}-${colIndex}`} style={styles.emptyDay} />;
              
              return (
                <View
                  key={`${dayData.date}-${dayIndex}`}
                  style={[
                    styles.calendarDay,
                    dayData.completed ? styles.completedDay : styles.skippedDay,
                  ]}
                >
                  <Text style={styles.calendarDayText}>
                    {dayData.completed ? '🔥' : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderCompletionRing = () => {
    const radius = 40;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (completionRate / 100) * circumference;

    return (
      <View style={styles.ringContainer}>
        <Svg width={radius * 2} height={radius * 2}>
          <Circle
            stroke={COLORS.border}
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <Circle
            stroke={COLORS.primary}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringPercentage}>{completionRate}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Habit Tracking</Text>
        {renderCompletionRing()}
      </View>

      <View style={styles.streakSection}>
        <Text style={styles.streakTitle}>
          {timeRange === 'today' ? 'Today\'s Progress' : 'Habit Streak Calendar'}
        </Text>
        {renderStreakCalendar()}
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.filter(d => d.completed).length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.length - data.filter(d => d.completed).length}</Text>
          <Text style={styles.statLabel}>Missed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.max(...data.map((_, index) => {
              let streak = 0;
              for (let i = index; i < data.length && data[i].completed; i++) {
                streak++;
              }
              return streak;
            }))}
          </Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>
    </View>
  );
};

// ExperimentResults Component
// Experiment Results Section
interface ExperimentResultsProps {
  data: ExperimentData[];
}

const ExperimentResults: React.FC<ExperimentResultsProps> = ({ data }) => {
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentData | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const activeExperiments = data.filter(exp => exp.isActive);
  const completedExperiments = data.filter(exp => !exp.isActive);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mood': return COLORS.success;
      case 'sleep': return COLORS.primary;
      case 'clarity': return COLORS.accent;
      default: return '#6B7280';
    }
  };

  const handleExperimentPress = (experiment: ExperimentData) => {
    setSelectedExperiment(experiment);
    setModalVisible(true);
  };

  const renderActiveExperiment = (experiment: ExperimentData) => {
    const progress = (experiment.currentDay / experiment.totalDays) * 100;
    
    return (
      <TouchableOpacity 
        key={experiment.id} 
        style={styles.experimentCard}
        onPress={() => handleExperimentPress(experiment)}
        activeOpacity={0.7}
      >
        <View style={styles.experimentHeader}>
          <View style={styles.experimentTitleRow}>
            <Text style={styles.experimentEmoji}>{experiment.emoji}</Text>
            <Text style={styles.experimentTitle}>{experiment.title}</Text>
          </View>
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            Day {experiment.currentDay}/{experiment.totalDays} complete
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Observed Results</Text>
          <View style={styles.resultsGrid}>
            {experiment.results.moodChange !== undefined && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Mood</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={[styles.resultValue, { color: experiment.results.moodChange >= 0 ? '#10B981' : '#EF4444' }]}>
                    {experiment.results.moodChange >= 0 ? '+' : ''}{experiment.results.moodChange.toFixed(1)}
                  </Text>
                  {experiment.results.moodChange >= 0 ? 
                    <TrendingUp size={12} color={COLORS.success} /> : 
                    <TrendingDown size={12} color={COLORS.error} />
                  }
                </View>
              </View>
            )}
            
            {experiment.results.sleepChange !== undefined && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Sleep</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={[styles.resultValue, { color: experiment.results.sleepChange >= 0 ? '#10B981' : '#EF4444' }]}>
                    {experiment.results.sleepChange >= 0 ? '+' : ''}{experiment.results.sleepChange.toFixed(1)}
                  </Text>
                  {experiment.results.sleepChange >= 0 ? 
                    <TrendingUp size={12} color={COLORS.success} /> : 
                    <TrendingDown size={12} color={COLORS.error} />
                  }
                </View>
              </View>
            )}
            
            {experiment.results.clarityChange !== undefined && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Clarity</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={[styles.resultValue, { color: experiment.results.clarityChange >= 0 ? '#10B981' : '#EF4444' }]}>
                    {experiment.results.clarityChange >= 0 ? '+' : ''}{experiment.results.clarityChange.toFixed(1)}
                  </Text>
                  {experiment.results.clarityChange >= 0 ? 
                    <TrendingUp size={12} color={COLORS.success} /> : 
                    <TrendingDown size={12} color={COLORS.error} />
                  }
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCompletedExperiment = (experiment: ExperimentData) => {
    return (
      <TouchableOpacity 
        key={experiment.id} 
        style={styles.experimentCard}
        onPress={() => handleExperimentPress(experiment)}
        activeOpacity={0.7}
      >
        <View style={styles.experimentHeader}>
          <View style={styles.experimentTitleRow}>
            <Text style={styles.experimentEmoji}>{experiment.emoji}</Text>
            <Text style={styles.experimentTitle}>{experiment.title}</Text>
          </View>
          <View style={[styles.activeIndicator, styles.completedIndicator]}>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        </View>
        
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Final Results</Text>
          <View style={styles.resultsGrid}>
            {experiment.results.moodChange !== undefined && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Mood</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={[styles.resultValue, { color: experiment.results.moodChange >= 0 ? '#10B981' : '#EF4444' }]}>
                    {experiment.results.moodChange >= 0 ? '+' : ''}{experiment.results.moodChange.toFixed(1)}
                  </Text>
                  {experiment.results.moodChange >= 0 ? 
                    <TrendingUp size={12} color={COLORS.success} /> : 
                    <TrendingDown size={12} color={COLORS.error} />
                  }
                </View>
              </View>
            )}
            
            {experiment.results.sleepChange !== undefined && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Sleep</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={[styles.resultValue, { color: experiment.results.sleepChange >= 0 ? '#10B981' : '#EF4444' }]}>
                    {experiment.results.sleepChange >= 0 ? '+' : ''}{experiment.results.sleepChange.toFixed(1)}
                  </Text>
                  {experiment.results.sleepChange >= 0 ? 
                    <TrendingUp size={12} color={COLORS.success} /> : 
                    <TrendingDown size={12} color={COLORS.error} />
                  }
                </View>
              </View>
            )}
            
            {experiment.results.clarityChange !== undefined && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Clarity</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={[styles.resultValue, { color: experiment.results.clarityChange >= 0 ? '#10B981' : '#EF4444' }]}>
                    {experiment.results.clarityChange >= 0 ? '+' : ''}{experiment.results.clarityChange.toFixed(1)}
                  </Text>
                  {experiment.results.clarityChange >= 0 ? 
                    <TrendingUp size={12} color={COLORS.success} /> : 
                    <TrendingDown size={12} color={COLORS.error} />
                  }
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Experiment Results</Text>
      
      {activeExperiments.length > 0 && (
        <View style={styles.experimentsSection}>
          <Text style={styles.experimentsSubtitle}>Active Experiments</Text>
          {activeExperiments.map(renderActiveExperiment)}
        </View>
      )}
      
      {completedExperiments.length > 0 && (
        <View style={styles.experimentsSection}>
          <Text style={styles.experimentsSubtitle}>Completed Experiments</Text>
          {completedExperiments.map(renderCompletedExperiment)}
        </View>
      )}
      
      {data.length === 0 && (
        <View style={styles.emptyState}>
          <TestTube size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>No experiments yet</Text>
          <Text style={styles.emptyStateSubtext}>Start an experiment to track your progress</Text>
        </View>
      )}
      
      {/* Experiment Detail Modal */}
      {selectedExperiment && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
          transparent={true}
        >
          <View style={styles.experimentModalOverlay}>
            <View style={styles.experimentModalContainer}>
              <View style={styles.experimentModalHeader}>
                <Text style={styles.experimentModalTitle}>Experiment Details</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <XCircle size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.experimentModalContent}>
                {/* Experiment Overview */}
                <View style={styles.experimentOverview}>
                  <Text style={styles.experimentName}>{selectedExperiment.title}</Text>
                  <Text style={styles.experimentDescription}>
                    {selectedExperiment.category === 'mood' ? 'Mood-focused experiment to track emotional well-being' :
                     selectedExperiment.category === 'sleep' ? 'Sleep-focused experiment to improve sleep quality' :
                     'Mental clarity experiment to enhance focus and cognitive function'}
                  </Text>
                  <View style={styles.experimentStats}>
                    <View style={styles.experimentStatItem}>
                      <Text style={styles.experimentStatLabel}>Category</Text>
                      <Text style={styles.experimentStatValue}>
                        {selectedExperiment.category.charAt(0).toUpperCase() + selectedExperiment.category.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.experimentStatItem}>
                      <Text style={styles.experimentStatLabel}>Status</Text>
                      <Text style={[styles.experimentStatValue, { color: selectedExperiment.isActive ? COLORS.success : COLORS.textSecondary }]}> 
                        {selectedExperiment.isActive ? 'Active' : 'Completed'}
                      </Text>
                    </View>
                    <View style={styles.experimentStatItem}>
                      <Text style={styles.experimentStatLabel}>Progress</Text>
                      <Text style={styles.experimentStatValue}>
                        {selectedExperiment.currentDay}/{selectedExperiment.totalDays} days
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Progress Information */}
                <View style={styles.progressInfo}>
                  <Text style={styles.progressInfoTitle}>Progress Overview</Text>
                  <Text style={styles.progressInfoText}>
                    {selectedExperiment.isActive 
                      ? `You're currently on day ${selectedExperiment.currentDay} of ${selectedExperiment.totalDays} days.`
                      : `This experiment was completed after ${selectedExperiment.totalDays} days.`}
                  </Text>
                  
                  {selectedExperiment.isActive && (
                    <>
                      <Text style={styles.progressInfoText}>
                        {selectedExperiment.totalDays - selectedExperiment.currentDay} days remaining.
                      </Text>
                      <View style={styles.progressBar}>
                        <View 
                          style={[styles.progressFill, { 
                            width: `${(selectedExperiment.currentDay / selectedExperiment.totalDays) * 100}%` 
                          }]} 
                        />
                      </View>
                    </>
                  )}
                </View>
                
                {/* Results Section */}
                <View style={styles.experimentResultsSection}>
                  <Text style={styles.experimentResultsTitle}>
                    {selectedExperiment.isActive ? 'Current Results' : 'Final Results'}
                  </Text>
                  <View style={styles.experimentResultsGrid}>
                    {selectedExperiment.results.moodChange !== undefined && (
                      <View style={styles.experimentResultItem}>
                        <Text style={styles.experimentResultLabel}>Mood</Text>
                        <View style={styles.experimentResultValueContainer}>
                          <Text style={[styles.experimentResultValue, { color: selectedExperiment.results.moodChange >= 0 ? COLORS.success : COLORS.error }]}> 
                            {selectedExperiment.results.moodChange >= 0 ? '+' : ''}{selectedExperiment.results.moodChange.toFixed(1)}
                          </Text>
                          {selectedExperiment.results.moodChange >= 0 ? 
                            <TrendingUp size={12} color={COLORS.success} /> : 
                            <TrendingDown size={12} color={COLORS.error} />
                          }
                        </View>
                      </View>
                    )}
                    
                    {selectedExperiment.results.sleepChange !== undefined && (
                      <View style={styles.experimentResultItem}>
                        <Text style={styles.experimentResultLabel}>Sleep</Text>
                        <View style={styles.experimentResultValueContainer}>
                          <Text style={[styles.experimentResultValue, { color: selectedExperiment.results.sleepChange >= 0 ? COLORS.success : COLORS.error }]}> 
                            {selectedExperiment.results.sleepChange >= 0 ? '+' : ''}{selectedExperiment.results.sleepChange.toFixed(1)}
                          </Text>
                          {selectedExperiment.results.sleepChange >= 0 ? 
                            <TrendingUp size={12} color={COLORS.success} /> : 
                            <TrendingDown size={12} color={COLORS.error} />
                          }
                        </View>
                      </View>
                    )}
                    
                    {selectedExperiment.results.clarityChange !== undefined && (
                      <View style={styles.experimentResultItem}>
                        <Text style={styles.experimentResultLabel}>Clarity</Text>
                        <View style={styles.experimentResultValueContainer}>
                          <Text style={[styles.experimentResultValue, { color: selectedExperiment.results.clarityChange >= 0 ? COLORS.success : COLORS.error }]}> 
                            {selectedExperiment.results.clarityChange >= 0 ? '+' : ''}{selectedExperiment.results.clarityChange.toFixed(1)}
                          </Text>
                          {selectedExperiment.results.clarityChange >= 0 ? 
                            <TrendingUp size={12} color={COLORS.success} /> : 
                            <TrendingDown size={12} color={COLORS.error} />
                          }
                        </View>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Recommendations Section */}
                <View style={styles.experimentRecommendationsSection}>
                  <Text style={styles.experimentRecommendationsTitle}>Recommendations</Text>
                  <View style={styles.experimentRecommendationsList}>
                    {selectedExperiment.category === 'sleep' && (
                      <>
                        <View style={styles.experimentRecommendationItem}>
                          <View style={styles.experimentRecommendationBullet} />
                          <Text style={styles.experimentRecommendationText}>
                            Maintain consistent sleep schedule for optimal results
                          </Text>
                        </View>
                        <View style={styles.experimentRecommendationItem}>
                          <View style={styles.experimentRecommendationBullet} />
                          <Text style={styles.experimentRecommendationText}>
                            Track your sleep environment factors (temperature, noise, light)
                          </Text>
                        </View>
                        <View style={styles.experimentRecommendationItem}>
                          <View style={styles.experimentRecommendationBullet} />
                          <Text style={styles.experimentRecommendationText}>
                            Avoid screens 1 hour before bedtime
                          </Text>
                        </View>
                      </>
                    )}
                    {selectedExperiment.category === 'mood' && (
                      <>
                        <View style={styles.experimentRecommendationItem}>
                          <View style={styles.experimentRecommendationBullet} />
                          <Text style={styles.experimentRecommendationText}>
                            Continue tracking your daily mood patterns
                          </Text>
                        </View>
                        <View style={styles.experimentRecommendationItem}>
                          <View style={styles.experimentRecommendationBullet} />
                          <Text style={styles.experimentRecommendationText}>
                            Identify triggers that affect your emotional well-being
                          </Text>
                        </View>
                        <View style={styles.experimentRecommendationItem}>
                          <View style={styles.experimentRecommendationBullet} />
                          <Text style={styles.experimentRecommendationText}>
                            Practice gratitude journaling for positive reinforcement
                          </Text>
                        </View>
                      </>
                    )}
                    {selectedExperiment.category === 'clarity' && (
                      <>
                        <View style={styles.experimentRecommendationItem}>
                          <View style={styles.experimentRecommendationBullet} />
                          <Text style={styles.experimentRecommendationText}>
                            Maintain regular meditation practice for mental clarity
                          </Text>
                        </View>
                        <View style={styles.experimentRecommendationItem}>
                          <View style={styles.experimentRecommendationBullet} />
                          <Text style={styles.experimentRecommendationText}>
                            Take breaks during intensive cognitive tasks
                          </Text>
                        </View>
                        <View style={styles.experimentRecommendationItem}>
                          <View style={styles.experimentRecommendationBullet} />
                          <Text style={styles.experimentRecommendationText}>
                            Stay hydrated and maintain proper nutrition for brain function
                          </Text>
                        </View>
                      </>
                    )}
                    <View style={styles.experimentRecommendationItem}>
                      <View style={styles.experimentRecommendationBullet} />
                      <Text style={styles.experimentRecommendationText}>
                        {selectedExperiment.isActive 
                          ? 'Continue with the experiment for full results' 
                          : 'Consider starting a new experiment to further improve your habits'}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// MoreInsights Component
// More Insights Section
const MoreInsights: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const insights = getMoreInsightsData();

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>More Insights</Text>
        {expanded ? 
          <ChevronUp size={20} color="#6B7280" /> : 
          <ChevronDown size={20} color="#6B7280" />
        }
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.insightsGrid}>
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={[styles.insightIconContainer, { backgroundColor: insight.color }]}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Main Statistics Component
export default function StatisticsScreen() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [animation] = useState(new Animated.Value(0));

  // Get data based on selected time range
  const moodData = getMoodData(selectedRange);
  const activityData = getActivityData(selectedRange);
  const sleepData = getSleepData(selectedRange);
  const habitData = getHabitData(selectedRange);
  const experimentData = getExperimentData();

  const handleRangeChange = (range: TimeRange) => {
    // Animate transition
    Animated.timing(animation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setSelectedRange(range);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Statistics & Analytics</Text>
      
      <TimeFilter 
        selectedRange={selectedRange} 
        onRangeChange={handleRangeChange} 
      />
      
      <Animated.View style={{ opacity: animation }}>
        <MoodTracking data={moodData} timeRange={selectedRange} />
        <ActivityTracking data={activityData} timeRange={selectedRange} />
        <SleepTracking data={sleepData} timeRange={selectedRange} />
        <HabitTracking data={habitData} timeRange={selectedRange} />
        <ExperimentResults data={experimentData} />
        <MoreInsights />
      </Animated.View>
    </ScrollView>
  );
}
