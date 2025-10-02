import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Switch } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { HABIT_LIBRARY, Habit } from '@/constants/habits';
import { useMoodStore } from '@/hooks/mood-store';
import { HabitService } from '@/services/habit-service';
import { UserHabit } from '@/types/habits';
import { 
  CheckCircle, 
  Target, 
  Flame, 
  Sparkles, 
  Heart, 
  Activity, 
  Brain, 
  Moon, 
  Plus, 
  ThumbsUp, 
  ThumbsDown,
  Search,
  Filter
} from 'lucide-react-native';

// Types for our enhanced habit tracking
interface EnhancedMicroHabitTrackerProps {
  onHabitToggle?: (habitId: string, completed: boolean) => void;
}

// Generate dynamic motivational nudge based on streak and completion status
const generateMotivationalNudge = (habit: UserHabit): string => {
  if (habit.isCompletedToday) {
    if (habit.streak >= 30) {
      return "Incredible consistency! You're building a powerful habit!";
    } else if (habit.streak >= 14) {
      return "Great job! Two weeks of consistency is impressive!";
    } else if (habit.streak >= 7) {
      return "Weekly streak! You're building momentum!";
    } else if (habit.streak >= 3) {
      return "Three days in a row - you're on a roll!";
    } else {
      return "Great start! Keep up the good work!";
    }
  } else {
    if (habit.streak >= 30) {
      return "Don't break your month-long streak! You've got this!";
    } else if (habit.streak >= 14) {
      return "Protect your two-week streak! Just one more check!";
    } else if (habit.streak >= 7) {
      return "Keep your weekly streak going!";
    } else if (habit.streak > 0) {
      return "Continue your streak today!";
    } else {
      return "Start building a positive habit today!";
    }
  }
};

// Algorithm to generate data-driven habit recommendations
const generateDataDrivenRecommendations = (
  moodEntries: any[], 
  sleepEntries: any[], 
  mentalClarityEntries: any[]
): Habit[] => {
  const recommendations: Habit[] = [];
  
  // Analyze sleep data
  if (sleepEntries.length > 0) {
    const recentSleep = sleepEntries.slice(0, 7); // Last 7 days
    const avgQuality = recentSleep.reduce((sum, entry) => sum + entry.quality, 0) / recentSleep.length;
    
    if (avgQuality < 3) {
      // Poor sleep quality - recommend sleep habits
      recommendations.push(HABIT_LIBRARY.find(h => h.id === 'sleep_4')!); // Screen-free hour
      recommendations.push(HABIT_LIBRARY.find(h => h.id === 'sleep_2')!); // Bedtime routine
    }
  }
  
  // Analyze mood data
  if (moodEntries.length > 0) {
    const recentMoods = moodEntries.slice(0, 7); // Last 7 days
    const avgMood = recentMoods.reduce((sum, entry) => sum + entry.moodId, 0) / recentMoods.length;
    
    if (avgMood < 3) {
      // Low mood - recommend mood habits
      recommendations.push(HABIT_LIBRARY.find(h => h.id === 'mood_1')!); // Gratitude journaling
      recommendations.push(HABIT_LIBRARY.find(h => h.id === 'mood_2')!); // Nature time
    }
  }
  
  // Analyze mental clarity data (placeholder - would need actual implementation)
  if (mentalClarityEntries.length > 0) {
    const recentClarity = mentalClarityEntries.slice(0, 7); // Last 7 days
    const avgClarity = recentClarity.reduce((sum, entry) => sum + entry.score, 0) / recentClarity.length;
    
    if (avgClarity < 5) {
      // Low clarity - recommend clarity habits
      recommendations.push(HABIT_LIBRARY.find(h => h.id === 'clarity_2')!); // Morning breathing
      recommendations.push(HABIT_LIBRARY.find(h => h.id === 'clarity_1')!); // Morning journaling
    }
  }
  
  // Remove duplicates and limit to 3 recommendations
  const uniqueRecommendations = Array.from(new Set(recommendations.map(h => h.id)))
    .map(id => recommendations.find(h => h.id === id)!);
  
  return uniqueRecommendations.slice(0, 3);
};

export default function EnhancedMicroHabitTracker({ 
  onHabitToggle 
}: EnhancedMicroHabitTrackerProps) {
  const { entries, getSleepEntries } = useMoodStore();
  const [userHabits, setUserHabits] = useState<UserHabit[]>([]);
  const [recommendations, setRecommendations] = useState<Habit[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'library' | 'create'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customHabit, setCustomHabit] = useState({
    title: '',
    description: '',
    category: 'mood' as UserHabit['category'],
    frequency: 'daily' as UserHabit['frequency'],
    notificationsEnabled: true
  });

  // Initialize with habits from storage or sample habits
  useEffect(() => {
    const initializeHabits = async () => {
      try {
        // Try to load habits from storage
        const storedHabits = await HabitService.loadUserHabits();
        
        if (storedHabits.length > 0) {
          setUserHabits(storedHabits);
        } else {
          // Initialize with some sample habits
          const sampleHabits: UserHabit[] = [
            {
              ...HABIT_LIBRARY[0],
              isCompletedToday: false,
              streak: 3,
              notificationsEnabled: true,
              createdAt: '2025-01-01'
            },
            {
              ...HABIT_LIBRARY[5],
              isCompletedToday: true,
              streak: 7,
              notificationsEnabled: true,
              createdAt: '2025-01-01'
            },
            {
              ...HABIT_LIBRARY[10],
              isCompletedToday: false,
              streak: 12,
              notificationsEnabled: false,
              createdAt: '2025-01-01'
            }
          ];
          
          setUserHabits(sampleHabits);
        }
        
        // Generate data-driven recommendations
        const sleepData = await getSleepEntries();
        const dataDrivenRecs = generateDataDrivenRecommendations(entries, sleepData, []);
        setRecommendations(dataDrivenRecs);
      } catch (error) {
        console.error('Error initializing habits:', error);
        // Fallback to sample habits
        const sampleHabits: UserHabit[] = [
          {
            ...HABIT_LIBRARY[0],
            isCompletedToday: false,
            streak: 3,
            notificationsEnabled: true,
            createdAt: '2025-01-01'
          },
          {
            ...HABIT_LIBRARY[5],
            isCompletedToday: true,
            streak: 7,
            notificationsEnabled: true,
            createdAt: '2025-01-01'
          },
          {
            ...HABIT_LIBRARY[10],
            isCompletedToday: false,
            streak: 12,
            notificationsEnabled: false,
            createdAt: '2025-01-01'
          }
        ];
        
        setUserHabits(sampleHabits);
        
        // Generate data-driven recommendations
        getSleepEntries().then(sleepData => {
          const dataDrivenRecs = generateDataDrivenRecommendations(entries, sleepData, []);
          setRecommendations(dataDrivenRecs);
        });
      }
    };
    
    initializeHabits();
  }, [entries]);

  // Save habits to storage whenever they change
  useEffect(() => {
    const saveHabits = async () => {
      if (userHabits.length > 0) {
        try {
          await HabitService.saveUserHabits(userHabits);
        } catch (error) {
          console.error('Error saving habits:', error);
        }
      }
    };
    
    saveHabits();
  }, [userHabits]);

  const handleHabitToggle = (habitId: string) => {
    setUserHabits(prev => 
      prev.map(habit => {
        if (habit.id === habitId) {
          const isCurrentlyCompleted = habit.isCompletedToday;
          const today = new Date().toISOString().split('T')[0];
          
          let newStreak = habit.streak;
          let newLastCompleted = habit.lastCompleted;
          
          if (!isCurrentlyCompleted) {
            // Completing the habit
            if (!habit.lastCompleted || habit.lastCompleted < today) {
              newStreak = habit.streak + 1;
              newLastCompleted = today;
            }
          } else {
            // Uncompleting the habit
            if (habit.lastCompleted === today) {
              newStreak = Math.max(0, habit.streak - 1);
              newLastCompleted = undefined;
            }
          }
          
          const updatedHabit = {
            ...habit,
            isCompletedToday: !isCurrentlyCompleted,
            streak: newStreak,
            lastCompleted: newLastCompleted
          };
          
          onHabitToggle?.(habitId, !isCurrentlyCompleted);
          return updatedHabit;
        }
        return habit;
      })
    );
  };

  const handleFeedback = async (habitId: string, feedback: 'positive' | 'negative', notes?: string) => {
    try {
      // Save feedback to storage
      await HabitService.saveHabitFeedback(habitId, feedback, notes);
      
      // Update habit in state
      setUserHabits(prev => 
        prev.map(habit => {
          if (habit.id === habitId) {
            // Update feedback and timestamp
            return {
              ...habit,
              feedback,
              lastFeedbackAt: new Date().toISOString(),
              notes: notes || habit.notes
            };
          }
          return habit;
        })
      );
      
      // In a real app, this would update the recommendation algorithm
      if (feedback === 'negative') {
        Alert.alert(
          "Got it!",
          "We'll show you fewer habits like this.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      Alert.alert("Error", "Failed to save feedback. Please try again.");
    }
  };

  const handleAddHabitFromLibrary = (habit: Habit) => {
    const newUserHabit: UserHabit = {
      ...habit,
      isCompletedToday: false,
      streak: 0,
      notificationsEnabled: true,
      createdAt: new Date().toISOString()
    };
    
    setUserHabits(prev => [...prev, newUserHabit]);
    Alert.alert("Habit Added!", `${habit.title} has been added to your daily plan.`);
  };

  const handleCreateCustomHabit = () => {
    if (!customHabit.title.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }
    
    const newHabit: UserHabit = {
      id: `custom_${Date.now()}`,
      title: customHabit.title,
      description: customHabit.description,
      category: customHabit.category,
      frequency: customHabit.frequency,
      difficulty: 'medium',
      evidenceBased: false,
      isCompletedToday: false,
      streak: 0,
      notificationsEnabled: customHabit.notificationsEnabled,
      createdAt: new Date().toISOString()
    };
    
    setUserHabits(prev => [...prev, newHabit]);
    setCustomHabit({
      title: '',
      description: '',
      category: 'mood',
      frequency: 'daily',
      notificationsEnabled: true
    });
    
    Alert.alert("Habit Created!", `${newHabit.title} has been added to your daily plan.`);
    setActiveTab('today');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return <Moon color={COLORS.primary} size={16} />;
      case 'mindfulness':
      case 'mentalClarity':
        return <Brain color={COLORS.success} size={16} />;
      case 'intimacy':
        return <Heart color="#FF69B4" size={16} />;
      case 'mood':
        return <Heart color={COLORS.error} size={16} />;
      case 'health':
      case 'productivity':
        return <Activity color={COLORS.warning} size={16} />;
      case 'anxiety':
        return <Sparkles color={COLORS.accent} size={16} />;
      default:
        return <Target color={COLORS.textSecondary} size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep':
        return COLORS.primary;
      case 'mindfulness':
      case 'mentalClarity':
        return COLORS.success;
      case 'intimacy':
        return '#FF69B4';
      case 'mood':
        return COLORS.error;
      case 'health':
      case 'productivity':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const filteredHabits = userHabits.filter(habit => {
    const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         habit.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredLibrary = HABIT_LIBRARY.filter(habit => {
    const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         habit.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderTodayHabits = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.habitsContainer}
    >
      {filteredHabits.map((habit) => (
        <View key={habit.id} style={styles.habitCard}>
          <View style={styles.habitHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(habit.category) + '20' }]}>
              {getCategoryIcon(habit.category)}
              <Text style={[styles.categoryText, { color: getCategoryColor(habit.category) }]}>
                {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.checkButton,
                habit.isCompletedToday && styles.checkButtonCompleted
              ]}
              onPress={() => handleHabitToggle(habit.id)}
            >
              <CheckCircle 
                color={habit.isCompletedToday ? COLORS.success : COLORS.textTertiary} 
                size={24} 
                fill={habit.isCompletedToday ? COLORS.success : 'none'} 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.habitTitle}>{habit.title}</Text>
          <Text style={styles.habitDescription}>{habit.description}</Text>
          
          <View style={styles.streakContainer}>
            <Flame color={COLORS.warning} size={16} />
            <Text style={styles.streakText}>{habit.streak} day streak</Text>
          </View>
          
          <Text style={styles.motivationText}>✨ {generateMotivationalNudge(habit)}</Text>
          
          {habit.isCompletedToday && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackPrompt}>How did it work?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity 
                  style={[styles.feedbackButton, habit.feedback === 'positive' && styles.positiveFeedback]}
                  onPress={() => handleFeedback(habit.id, 'positive')}
                >
                  <ThumbsUp size={16} color={habit.feedback === 'positive' ? COLORS.success : COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.feedbackButton, habit.feedback === 'negative' && styles.negativeFeedback]}
                  onPress={() => handleFeedback(habit.id, 'negative')}
                >
                  <ThumbsDown size={16} color={habit.feedback === 'negative' ? COLORS.error : COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.feedbackNotes}
                placeholder="Add notes (optional)..."
                value={habit.notes || ''}
                onChangeText={(text) => setUserHabits(prev => 
                  prev.map(h => h.id === habit.id ? {...h, notes: text} : h)
                )}
              />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderHabitLibrary = () => (
    <View style={styles.libraryContainer}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color={COLORS.textTertiary} size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search habits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color={COLORS.text} size={16} />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.libraryList}>
        {filteredLibrary.map((habit) => (
          <View key={habit.id} style={styles.libraryItem}>
            <View style={styles.libraryItemHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(habit.category) + '20' }]}>
                {getCategoryIcon(habit.category)}
                <Text style={[styles.categoryText, { color: getCategoryColor(habit.category) }]}>
                  {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddHabitFromLibrary(habit)}
              >
                <Plus color={COLORS.primary} size={16} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.libraryItemTitle}>{habit.title}</Text>
            <Text style={styles.libraryItemDescription}>{habit.description}</Text>
            {habit.evidenceBased && (
              <View style={styles.evidenceBadge}>
                <Text style={styles.evidenceText}>Evidence-Based</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderCreateHabit = () => (
    <View style={styles.createContainer}>
      <Text style={styles.createTitle}>Create Custom Habit</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Habit Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Drink 8 glasses of water"
          value={customHabit.title}
          onChangeText={(text) => setCustomHabit({...customHabit, title: text})}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe your habit..."
          multiline
          numberOfLines={3}
          value={customHabit.description}
          onChangeText={(text) => setCustomHabit({...customHabit, description: text})}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Category</Text>
        <View style={styles.categorySelector}>
          {['sleep', 'mood', 'anxiety', 'productivity', 'mentalClarity', 'intimacy', 'health'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryOption,
                customHabit.category === category && styles.selectedCategory
              ]}
              onPress={() => setCustomHabit({...customHabit, category: category as UserHabit['category']})}
            >
              <Text style={[
                styles.categoryOptionText,
                customHabit.category === category && styles.selectedCategoryText
              ]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Frequency</Text>
        <View style={styles.frequencySelector}>
          {['daily', 'weekly', 'custom'].map((frequency) => (
            <TouchableOpacity
              key={frequency}
              style={[
                styles.frequencyOption,
                customHabit.frequency === frequency && styles.selectedFrequency
              ]}
              onPress={() => setCustomHabit({...customHabit, frequency: frequency as UserHabit['frequency']})}
            >
              <Text style={[
                styles.frequencyOptionText,
                customHabit.frequency === frequency && styles.selectedFrequencyText
              ]}>
                {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={[styles.inputGroup, styles.switchContainer]}>
        <Text style={styles.inputLabel}>Enable Notifications</Text>
        <Switch
          value={customHabit.notificationsEnabled}
          onValueChange={(value) => setCustomHabit({...customHabit, notificationsEnabled: value})}
          trackColor={{ false: COLORS.textTertiary, true: COLORS.primary }}
          thumbColor={customHabit.notificationsEnabled ? COLORS.text : COLORS.textSecondary}
        />
      </View>
      
      <TouchableOpacity style={styles.createButton} onPress={handleCreateCustomHabit}>
        <Text style={styles.createButtonText}>Create Habit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Micro-Habit Recommendations</Text>
        <Text style={styles.subtitle}>Small actions, big impact</Text>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'today' && styles.activeTab]}
          onPress={() => setActiveTab('today')}
        >
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'library' && styles.activeTab]}
          onPress={() => setActiveTab('library')}
        >
          <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>Create</Text>
        </TouchableOpacity>
      </View>
      
      {/* Recommendations section */}
      {activeTab === 'today' && recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Recommended for You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recommendations.map((habit, index) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(habit.category) + '20' }]}>
                    {getCategoryIcon(habit.category)}
                    <Text style={[styles.categoryText, { color: getCategoryColor(habit.category) }]}>
                      {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recommendationTitle}>{habit.title}</Text>
                <Text style={styles.recommendationDescription}>{habit.description}</Text>
                <TouchableOpacity 
                  style={styles.addRecommendationButton}
                  onPress={() => handleAddHabitFromLibrary(habit)}
                >
                  <Plus color={COLORS.text} size={14} />
                  <Text style={styles.addRecommendationText}>Add to Plan</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Tab Content */}
      {activeTab === 'today' && renderTodayHabits()}
      {activeTab === 'library' && renderHabitLibrary()}
      {activeTab === 'create' && renderCreateHabit()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    fontWeight: '600',
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginBottom: SPACING.md,
  },
  recommendationsTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  recommendationCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: 250,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recommendationTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  recommendationDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  addRecommendationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  addRecommendationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  habitsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  habitCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: 280,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  checkButton: {
    padding: SPACING.xs,
  },
  checkButtonCompleted: {
    // No additional styling needed, color handled by icon
  },
  habitTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  habitDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  streakText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    fontWeight: '600',
  },
  motivationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  feedbackContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  feedbackPrompt: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  feedbackButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  positiveFeedback: {
    backgroundColor: COLORS.success + '20',
  },
  negativeFeedback: {
    backgroundColor: COLORS.error + '20',
  },
  feedbackNotes: {
    ...TYPOGRAPHY.caption,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    color: COLORS.text,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  libraryContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  filterButton: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryList: {
    paddingBottom: SPACING.md,
  },
  libraryItem: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  libraryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  addButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  libraryItemTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  libraryItemDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  evidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success + '20',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  evidenceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  createContainer: {
    padding: SPACING.sm,
  },
  createTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  categoryOption: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    margin: SPACING.xs,
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  selectedCategoryText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  frequencySelector: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  frequencyOption: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    margin: SPACING.xs,
  },
  selectedFrequency: {
    backgroundColor: COLORS.primary,
  },
  frequencyOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  selectedFrequencyText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  createButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
});