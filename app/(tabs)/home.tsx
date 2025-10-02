import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { 
  Home, 
  BarChart3, 
  Calendar, 
  Plus, 
  TestTube, 
  Moon, 
  Heart, 
  Shield,
  Award,
  Target,
  Brain,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Flame,
  CheckCircle,
  X
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useMoodStore } from '@/hooks/mood-store';
import { MOODS } from '@/constants/moods';
import StatisticsVisualization from '@/components/StatisticsVisualization';
import MicroHabitTracker from '@/components/MicroHabitTracker';
import SleepCoachCard from '@/components/SleepCoachCard';
import SleepSupport from '@/components/SleepSupport';
import SwipeableRecommendationCard from '@/components/SwipeableRecommendationCard';
import ExperimentSection from '@/components/ExperimentSection';
import ExperimentSetup from '@/components/Experiment-setup';
import HabitLibrarySection from '@/components/HabitLibrarySection';

// Types for our data
interface QuickHighlight {
  mood: string;
  sleep: string;
  mentalClarity: string;
  streak: number;
}

interface ActivityCorrelation {
  activityId: number;
  activityName: string;
  moodImpact: number;
  sleepImpact: number;
  clarityImpact: number;
  frequency: number;
}

interface DailyRecommendation {
  id: string;
  date: string;
  type: 'activity' | 'intimacy' | 'sleep' | 'mood';
  suggestion: string;
  reason: string;
  wasFollowed?: boolean;
  effectiveness?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);
  const { entries, getSleepEntries, getIntimacyEntries, getMoodStats, user } = useMoodStore();
  const [quickHighlights, setQuickHighlights] = useState<QuickHighlight>({
    mood: '😊',
    sleep: '7h 30m',
    mentalClarity: 'High',
    streak: 3
  });
  const [correlations, setCorrelations] = useState<ActivityCorrelation[]>([]);
  const [recommendations, setRecommendations] = useState<DailyRecommendation[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [moodData, setMoodData] = useState<Array<{date: string, moodValue: number, moodName: string}>>([]);
  const [sleepData, setSleepData] = useState<Array<{date: string, quality: number}>>([]);
  const [mentalClarityData, setMentalClarityData] = useState<any[]>([]);
  const [localHabits, setLocalHabits] = useState<any[]>([]);
  const [showHabitLibrary, setShowHabitLibrary] = useState(false); // Added state for habit library modal
  const [showSleepSupport, setShowSleepSupport] = useState(false); // Added state for sleep support modal
  const [showExperimentSetup, setShowExperimentSetup] = useState(false); // Added state for experiment setup modal
  const [selectedActivity, setSelectedActivity] = useState<ActivityCorrelation | null>(null); // Added state for selected activity
  const [showActivityDetail, setShowActivityDetail] = useState(false); // Added state for activity detail modal

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [entries]);

  const loadData = async () => {
    try {
      // Get sleep data
      const sleepEntries = await getSleepEntries();
      setSleepData(sleepEntries.map(entry => ({
        date: entry.date,
        quality: entry.quality
      })));

      // Get intimacy data
      const intimacyEntries = await getIntimacyEntries();
      
      // Get mental clarity data (placeholder - would need actual implementation)
      const clarityData: any[] = [];
      setMentalClarityData(clarityData);

      // Prepare mood data for visualization
      const moodEntries = entries.map(entry => {
        const mood = MOODS.find(m => m.id === entry.moodId);
        return {
          date: entry.date,
          moodValue: entry.moodId,
          moodName: mood?.name || 'Unknown'
        };
      });
      setMoodData(moodEntries);

      // Generate sample correlation data
      const sampleCorrelations: ActivityCorrelation[] = [
        {
          activityId: 1,
          activityName: 'Exercise',
          moodImpact: 1.5,
          sleepImpact: 1.2,
          clarityImpact: 1.8,
          frequency: 12
        },
        {
          activityId: 2,
          activityName: 'Solo Intimacy',
          moodImpact: 0.8,
          sleepImpact: 0.5,
          clarityImpact: -0.2,
          frequency: 8
        },
        {
          activityId: 3,
          activityName: 'Work Stress',
          moodImpact: -1.2,
          sleepImpact: -0.8,
          clarityImpact: -1.5,
          frequency: 15
        },
        {
          activityId: 4,
          activityName: 'Social Time',
          moodImpact: 1.1,
          sleepImpact: 0.3,
          clarityImpact: 0.7,
          frequency: 6
        }
      ];
      setCorrelations(sampleCorrelations);

      // Generate sample recommendations
      const sampleRecommendations: DailyRecommendation[] = [
        {
          id: '1',
          date: new Date().toISOString().split('T')[0],
          type: 'activity',
          suggestion: 'Try taking a 20-minute walk after work',
          reason: 'Your mood improves by 40% on days when you exercise',
          wasFollowed: true,
          effectiveness: 4
        },
        {
          id: '2',
          date: new Date().toISOString().split('T')[0],
          type: 'sleep',
          suggestion: 'Consider a breathing exercise before bed',
          reason: 'Your sleep quality is 30% better after relaxation activities'
        }
      ];
      setRecommendations(sampleRecommendations);

      // Generate sample achievements
      const sampleAchievements: Achievement[] = [
        {
          id: '1',
          title: '7-Day Streak',
          description: 'Log your mood for 7 consecutive days',
          progress: 100,
          completed: true
        },
        {
          id: '2',
          title: 'Sleep Master',
          description: 'Get 7+ hours of sleep for 5 nights',
          progress: 80,
          completed: false
        },
        {
          id: '3',
          title: 'Mental Clarity',
          description: 'Complete 3 mental clarity tests',
          progress: 60,
          completed: false
        }
      ];
      setAchievements(sampleAchievements);

      // Update quick highlights with real data
      const moodStats = getMoodStats();
      if (entries.length > 0) {
        const latestEntry = entries[entries.length - 1];
        const latestMood = MOODS.find(m => m.id === latestEntry.moodId);
        setQuickHighlights(prev => ({
          ...prev,
          mood: latestMood?.emoji || '😊'
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleHabitAdd = (habit: any) => {
    setLocalHabits(prev => [...prev, habit]);
  };

  const handleHabitAdded = () => {
    // Close the habit library modal after adding a habit
    setShowHabitLibrary(false);
  };

  const handleSleepTutorialComplete = (completion: any) => {
    // In a real app, you would save this completion data
    console.log('Sleep tutorial completed:', completion);
    // Close the sleep support modal
    setShowSleepSupport(false);
  };

  const handleAddCustomHabit = () => {
    console.log('Showing habit library modal...');
    setShowHabitLibrary(true);
  };

  // Render greeting section
  const renderGreeting = () => (
    <View style={styles.greetingSection}>
      <Text style={[styles.greetingText, { color: COLORS.text }]}>
        Hi {user?.firstName || 'there'} 👋 Here's how you're doing today
      </Text>
      
      <View style={styles.quickHighlights}>
        <View style={[styles.highlightCard, { backgroundColor: COLORS.surface }]}>
          <Text style={styles.highlightEmoji}>{quickHighlights.mood}</Text>
          <Text style={[styles.highlightLabel, { color: COLORS.textSecondary }]}>Mood Today</Text>
        </View>
        
        <View style={[styles.highlightCard, { backgroundColor: COLORS.surface }]}>
          <Moon color={COLORS.primary} size={20} />
          <Text style={[styles.highlightValue, { color: COLORS.text }]}>{quickHighlights.sleep}</Text>
          <Text style={[styles.highlightLabel, { color: COLORS.textSecondary }]}>Sleep Last Night</Text>
        </View>
        
        <View style={[styles.highlightCard, { backgroundColor: COLORS.surface }]}>
          <Brain color={COLORS.success} size={20} />
          <Text style={[styles.highlightValue, { color: COLORS.text }]}>{quickHighlights.mentalClarity}</Text>
          <Text style={[styles.highlightLabel, { color: COLORS.textSecondary }]}>Mental Clarity</Text>
        </View>
      </View>
      
      <View style={styles.streakContainer}>
        <Flame color={COLORS.warning} size={16} />
        <Text style={[styles.streakText, { color: COLORS.text }]}>🔥 Day {quickHighlights.streak} Streak</Text>
      </View>
    </View>
  );

  // Render statistics section
  const renderStatistics = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <BarChart3 color={COLORS.primary} size={20} />
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Statistics & Analysis</Text>
      </View>
      <Text style={[styles.sectionSubtitle, { color: COLORS.textSecondary }]}>
        Weekly overview of your mood, sleep, and mental clarity
      </Text>
      <StatisticsVisualization 
        moodData={moodData}
        sleepData={sleepData}
        mentalClarityData={mentalClarityData}
      />
    </View>
  );

  // Render micro-habit recommendations
  const renderMicroHabits = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Target color={COLORS.primary} size={20} />
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Build Simple Habits</Text>
      </View>
      <Text style={[styles.sectionSubtitle, { color: COLORS.textSecondary }]}>
        Small actions, big impact
      </Text>
      <MicroHabitTracker onHabitAdd={handleHabitAdd} />
      
      <View style={styles.habitActions}>
        <TouchableOpacity 
          style={[styles.browseHabitsCard, { backgroundColor: COLORS.surface }]}
          onPress={() => {
            console.log('Browse Habit Library button pressed');
            setShowHabitLibrary(true); // Show habit library modal instead of navigating
          }}
        >
          <Text style={[styles.browseHabitsText, { color: COLORS.text }]}>Browse Habit Library</Text>
          <View style={styles.habitActionDescriptionContainer}>
            <Text style={[styles.browseHabitsDescription, { color: COLORS.textSecondary }]}>
              See proven habits that improve sleep, mood, and mental clarity.
            </Text>
            <TouchableOpacity 
              style={styles.infoIcon}
              onPress={(e) => {
                e.stopPropagation();
                Alert.alert(
                  'Browse Habits',
                  'Curated habits backed by science and user feedback.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.infoIconText}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.createHabitCard, { backgroundColor: COLORS.surface }]}
          onPress={() => {
            console.log('Create Your Own Habit button pressed');
            setShowHabitLibrary(true); // Show habit library modal instead of navigating
          }}
        >
          <Text style={[styles.createHabitText, { color: COLORS.text }]}>Create Your Own Habit</Text>
          <View style={styles.habitActionDescriptionContainer}>
            <Text style={[styles.createHabitDescription, { color: COLORS.textSecondary }]}>
              Design a personal habit tailored to your lifestyle.
            </Text>
            <TouchableOpacity 
              style={styles.infoIcon}
              onPress={(e) => {
                e.stopPropagation();
                Alert.alert(
                  'Create Your Habit',
                  'Customize your own habits and track progress with reminders.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.infoIconText}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render sleep help quick access
  const renderSleepHelp = () => (
    <SleepCoachCard onImproveSleepPress={() => setShowSleepSupport(true)} />
  );

  // Render activity impact analysis
  const renderActivityImpact = () => {
    // Generate summary text
    const generateSummary = () => {
      if (correlations.length === 0) return "No activity data available yet.";
      
      // Find top mood booster and biggest drain
      let topMoodBooster = correlations[0];
      let biggestDrain = correlations[0];
      
      correlations.forEach(correlation => {
        if (correlation.moodImpact > topMoodBooster.moodImpact) {
          topMoodBooster = correlation;
        }
        if (correlation.moodImpact < biggestDrain.moodImpact) {
          biggestDrain = correlation;
        }
      });
      
      // Add emojis to activity names
      const getActivityEmoji = (activityName: string) => {
        switch (activityName.toLowerCase()) {
          case 'exercise': return '🏋️';
          case 'solo intimacy': return '❤️‍🔥';
          case 'work stress': return '💼';
          case 'social time': return '👫';
          default: return '📝';
        }
      };
      
      return `Your biggest mood booster is ${getActivityEmoji(topMoodBooster.activityName)} ${topMoodBooster.activityName}, which improves your mood by ${Math.abs(topMoodBooster.moodImpact * 100).toFixed(0)}%. Try to do this more often!`;
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp color={COLORS.primary} size={20} />
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Activity Impact Analysis</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: COLORS.textSecondary }]}>
          How your activities affect your wellbeing
        </Text>
        
        <View style={[styles.analysisCard, { backgroundColor: COLORS.surface }]}>
          <Text style={[styles.analysisSummary, { color: COLORS.text }]}>
            {generateSummary()}
          </Text>
        </View>
        
        <View style={styles.correlationList}>
          {correlations.map((correlation) => (
            <TouchableOpacity 
              key={correlation.activityId}
              style={[styles.correlationItem, { backgroundColor: COLORS.surface }]}
              onPress={() => {
                setSelectedActivity(correlation);
                setShowActivityDetail(true);
              }}
            >
              <View style={styles.correlationHeader}>
                <Text style={[styles.correlationName, { color: COLORS.text }]}>{correlation.activityName}</Text>
                <Text style={[styles.correlationFrequency, { color: COLORS.textSecondary }]}>{correlation.frequency}x this week</Text>
              </View>
              
              <View style={styles.correlationMetrics}>
                <View style={styles.metric}>
                  <Text style={[styles.metricLabel, { color: COLORS.textSecondary }]}>Mood</Text>
                  <View style={styles.metricValueContainer}>
                    {correlation.moodImpact > 0 ? (
                      <TrendingUp size={16} color={COLORS.success} />
                    ) : correlation.moodImpact < 0 ? (
                      <TrendingDown size={16} color={COLORS.error} />
                    ) : null}
                    <Text style={[styles.metricValue, { color: correlation.moodImpact > 0 ? COLORS.success : correlation.moodImpact < 0 ? COLORS.error : COLORS.textSecondary }]}>
                      {correlation.moodImpact > 0 ? '+' : ''}{(correlation.moodImpact * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.metric}>
                  <Text style={[styles.metricLabel, { color: COLORS.textSecondary }]}>Sleep</Text>
                  <View style={styles.metricValueContainer}>
                    {correlation.sleepImpact > 0 ? (
                      <TrendingUp size={16} color={COLORS.success} />
                    ) : correlation.sleepImpact < 0 ? (
                      <TrendingDown size={16} color={COLORS.error} />
                    ) : null}
                    <Text style={[styles.metricValue, { color: correlation.sleepImpact > 0 ? COLORS.success : correlation.sleepImpact < 0 ? COLORS.error : COLORS.textSecondary }]}>
                      {correlation.sleepImpact > 0 ? '+' : ''}{(correlation.sleepImpact * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.metric}>
                  <Text style={[styles.metricLabel, { color: COLORS.textSecondary }]}>Clarity</Text>
                  <View style={styles.metricValueContainer}>
                    {correlation.clarityImpact > 0 ? (
                      <TrendingUp size={16} color={COLORS.success} />
                    ) : correlation.clarityImpact < 0 ? (
                      <TrendingDown size={16} color={COLORS.error} />
                    ) : null}
                    <Text style={[styles.metricValue, { color: correlation.clarityImpact > 0 ? COLORS.success : correlation.clarityImpact < 0 ? COLORS.error : COLORS.textSecondary }]}>
                      {correlation.clarityImpact > 0 ? '+' : ''}{(correlation.clarityImpact * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render personalized recommendations
  const renderRecommendations = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Lightbulb color={COLORS.primary} size={20} />
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Personalized Recommendations</Text>
      </View>
      <Text style={[styles.sectionSubtitle, { color: COLORS.textSecondary }]}>
        Suggestions based on your patterns
      </Text>
      
      <View style={styles.recommendationsContainer}>
        {recommendations.map((recommendation) => (
          <SwipeableRecommendationCard 
            key={recommendation.id}
            recommendation={recommendation}
            onAddHabit={(rec) => console.log('Add habit:', rec)}
            onDismiss={(id) => console.log('Dismiss recommendation:', id)}
          />
        ))}
      </View>
    </View>
  );

  // Render achievements
  const renderAchievements = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Award color={COLORS.primary} size={20} />
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Achievements</Text>
      </View>
      <Text style={[styles.sectionSubtitle, { color: COLORS.textSecondary }]}>
        Celebrate your progress
      </Text>
      
      <View style={styles.achievementsContainer}>
        {achievements.map((achievement) => (
          <View key={achievement.id} style={[styles.achievementCard, { backgroundColor: COLORS.surface }]}>
            <View style={styles.achievementHeader}>
              <Text style={[styles.achievementTitle, { color: COLORS.text }]}>{achievement.title}</Text>
              {achievement.completed && <CheckCircle color={COLORS.success} size={20} />}
            </View>
            <Text style={[styles.achievementDescription, { color: COLORS.textSecondary }]}>{achievement.description}</Text>
            
            {!achievement.completed && (
              <>
                <View style={styles.progressContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        backgroundColor: COLORS.backgroundSecondary,
                        width: '100%'
                      }
                    ]}
                  >
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          backgroundColor: COLORS.primary,
                          width: `${achievement.progress}%`
                        }
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.progressText, { color: COLORS.textSecondary }]}>{achievement.progress}% complete</Text>
              </>
            )}
            
            {achievement.completed && (
              <Text style={[styles.completedText, { color: COLORS.warning }]}>🎉 Completed!</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  // Render experiments section
  const renderExperiments = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <TestTube color={COLORS.primary} size={20} />
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Experiments</Text>
      </View>
      <Text style={[styles.sectionSubtitle, { color: COLORS.textSecondary }]}>
        Test new habits and track their impact
      </Text>
      
      <ExperimentSection 
        onPress={() => setShowExperimentSetup(true)}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {renderGreeting()}
        {renderStatistics()}
        {renderMicroHabits()}
        {renderSleepHelp()}
        {renderActivityImpact()}
        {renderRecommendations()}
        {renderAchievements()}
        {renderExperiments()}
        
        <View style={styles.scrollEnd}>
          <Text style={[styles.motivationalText, { color: COLORS.textSecondary }]}>
            "The journey of a thousand miles begins with one step." - Lao Tzu
          </Text>
        </View>
      </ScrollView>

      {/* Habit Library Modal */}
      <Modal
        visible={showHabitLibrary}
        animationType="slide"
        onRequestClose={() => setShowHabitLibrary(false)}
      >
        <View style={[styles.habitLibraryContainer, { backgroundColor: COLORS.background }]}>
          <View style={[styles.habitLibraryHeader, { borderBottomColor: COLORS.border }]}>
            <Text style={[styles.habitLibraryTitle, { color: COLORS.text }]}>Habit Library</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowHabitLibrary(false)}
            >
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <HabitLibrarySection 
            onHabitAdded={handleHabitAdded}
          />
        </View>
      </Modal>

      {/* Sleep Support Modal */}
      <SleepSupport 
        visible={showSleepSupport}
        onClose={() => setShowSleepSupport(false)}
        onTutorialComplete={handleSleepTutorialComplete}
      />

      {/* Experiment Setup Modal */}
      <Modal
        visible={showExperimentSetup}
        animationType="slide"
        onRequestClose={() => setShowExperimentSetup(false)}
      >
        <ExperimentSetup />
      </Modal>

      {/* Activity Detail Modal */}
      <Modal
        visible={showActivityDetail}
        animationType="slide"
        onRequestClose={() => setShowActivityDetail(false)}
      >
        {selectedActivity && (
          <View style={[styles.activityDetailContainer, { backgroundColor: COLORS.background }]}>
            <View style={[styles.activityDetailHeader, { borderBottomColor: COLORS.border }]}>
              <TouchableOpacity onPress={() => setShowActivityDetail(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={[styles.activityDetailTitle, { color: COLORS.text }]}>Activity Details</Text>
              <View style={styles.placeholder} />
            </View>
            
            <ScrollView style={styles.activityDetailContent}>
              <View style={[styles.activityOverview, { backgroundColor: COLORS.surface }]}>
                <Text style={[styles.activityName, { color: COLORS.text }]}>{selectedActivity.activityName}</Text>
                
                <View style={styles.activityStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>Frequency</Text>
                    <Text style={[styles.statValue, { color: COLORS.text }]}>{selectedActivity.frequency} times/week</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: COLORS.textSecondary }]}>Mood Impact</Text>
                    <Text style={[styles.statValue, { color: selectedActivity.moodImpact > 0 ? COLORS.success : selectedActivity.moodImpact < 0 ? COLORS.error : COLORS.textSecondary }]}>
                      {selectedActivity.moodImpact > 0 ? '+' : ''}{(selectedActivity.moodImpact * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={[styles.analysisSection, { backgroundColor: COLORS.surface }]}>
                <View style={[styles.analysisLabel, { backgroundColor: COLORS.primary + '20' }]}>
                  <Text style={[styles.analysisLabelText, { color: COLORS.primary }]}>Analysis</Text>
                </View>
                <Text style={[styles.analysisDescription, { color: COLORS.text }]}>
                  {selectedActivity.moodImpact > 0 
                    ? `This activity has a positive impact on your mood. Consider doing it more often to boost your wellbeing.`
                    : selectedActivity.moodImpact < 0
                    ? `This activity tends to negatively impact your mood. You might want to reduce how often you do it or find alternatives.`
                    : `This activity doesn't seem to have a significant impact on your mood. Try varying the timing or context to see if that changes the effect.`}
                </Text>
              </View>
              
              <View style={[styles.recommendationsSection, { backgroundColor: COLORS.surface }]}>
                <Text style={[styles.sectionTitle, { color: COLORS.text, marginBottom: SPACING.md }]}>Recommendations</Text>
                <View style={styles.recommendationsList}>
                  <View style={styles.recommendationItem}>
                    <View style={[styles.recommendationBullet, { backgroundColor: COLORS.primary }]} />
                    <Text style={[styles.analysisDescription, { color: COLORS.text, flex: 1 }]}>
                      {selectedActivity.moodImpact > 0 
                        ? `Try scheduling ${selectedActivity.activityName} during your most energetic hours of the day.`
                        : selectedActivity.moodImpact < 0
                        ? `If you do engage in ${selectedActivity.activityName}, follow up with a mood-boosting activity.`
                        : `Experiment with different times of day for ${selectedActivity.activityName} to see if timing affects your mood.`}
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <View style={[styles.recommendationBullet, { backgroundColor: COLORS.primary }]} />
                    <Text style={[styles.analysisDescription, { color: COLORS.text, flex: 1 }]}>
                      Track how you feel before and after engaging in this activity to get more insights.
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  greetingSection: {
    marginBottom: SPACING.xl,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  quickHighlights: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  highlightCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
  },
  highlightEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  highlightLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  analysisCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisSummary: {
    fontSize: 16,
    lineHeight: 24,
  },
  correlationList: {
    gap: SPACING.md,
  },
  correlationItem: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  correlationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  correlationName: {
    fontSize: 20,
    fontWeight: '600',
  },
  correlationFrequency: {
    fontSize: 14,
  },
  correlationMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationsContainer: {
    gap: SPACING.md,
  },
  achievementsContainer: {
    gap: SPACING.md,
  },
  achievementCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  achievementDescription: {
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2ECC71',
  },
  progressText: {
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  experimentCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  experimentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  experimentButton: {
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  experimentButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollEnd: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  motivationalText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Added styles for habit library modal
  habitLibraryContainer: {
    flex: 1,
  },
  habitLibraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  habitLibraryTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  placeholder: {
    width: 24, // To balance the header
  },
  // Added styles for activity detail modal
  activityDetailContainer: {
    flex: 1,
  },
  activityDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  activityDetailTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  activityDetailContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  activityOverview: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  analysisSection: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  analysisLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  analysisLabelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  analysisDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  recommendationsSection: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  recommendationsList: {
    marginTop: SPACING.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: SPACING.sm,
    marginRight: SPACING.md,
  },
  habitActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  browseHabitsCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createHabitCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  browseHabitsText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  createHabitText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  habitActionDescriptionContainer: {
    alignItems: 'center',
  },
  browseHabitsDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  createHabitDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  infoIcon: {
    padding: SPACING.xs,
  },
  infoIconText: {
    fontSize: 16,
  },
});