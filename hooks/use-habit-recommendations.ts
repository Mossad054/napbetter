import React, { useState, useEffect } from 'react';
import { useMoodStore } from '@/hooks/mood-store';

// Sample habit library data
const HABIT_LIBRARY = [
  // Sleep habits
  {
    id: 'sleep-1',
    title: 'Stretch 5 mins before bed',
    description: 'Improve sleep quality with gentle stretching',
    category: 'sleep',
    benefits: 'Reduces muscle tension and promotes relaxation',
  },
  {
    id: 'sleep-2',
    title: 'No screens 30 mins before sleep',
    description: 'Reduce blue light exposure before sleep',
    category: 'sleep',
    benefits: 'Improves melatonin production for better sleep',
  },
  {
    id: 'sleep-3',
    title: 'Set bedtime routine',
    description: 'Create a consistent wind-down routine',
    category: 'sleep',
    benefits: 'Trains your body to recognize sleep time',
  },
  
  // Mood habits
  {
    id: 'mood-1',
    title: '3-min gratitude journaling',
    description: 'Write down 3 things you\'re grateful for',
    category: 'mood',
    benefits: 'Shifts focus to positive aspects of life',
  },
  {
    id: 'mood-2',
    title: 'Midday walk',
    description: 'Take a 10-minute walk during lunch',
    category: 'mood',
    benefits: 'Boosts mood and energy levels',
  },
  {
    id: 'mood-3',
    title: 'Positive self-talk',
    description: 'Replace negative thoughts with positive affirmations',
    category: 'mood',
    benefits: 'Builds self-confidence and resilience',
  },
  
  // Anxiety habits
  {
    id: 'anxiety-1',
    title: 'Box breathing exercise',
    description: '4-4-4-4 breathing technique',
    category: 'anxiety',
    benefits: 'Activates parasympathetic nervous system',
  },
  {
    id: 'anxiety-2',
    title: '5-min meditation',
    description: 'Focus on breath and let thoughts pass',
    category: 'anxiety',
    benefits: 'Reduces stress and promotes calm',
  },
  {
    id: 'anxiety-3',
    title: 'Progressive muscle relaxation',
    description: 'Tense and release muscle groups',
    category: 'anxiety',
    benefits: 'Reduces physical tension and anxiety',
  },
  
  // Mental clarity habits
  {
    id: 'clarity-1',
    title: 'Morning brain dump',
    description: 'Write down all thoughts to clear your mind',
    category: 'mentalClarity',
    benefits: 'Improves focus and reduces mental clutter',
  },
  {
    id: 'clarity-2',
    title: 'Digital detox hour',
    description: 'One hour without screens or notifications',
    category: 'mentalClarity',
    benefits: 'Reduces cognitive overload',
  },
  {
    id: 'clarity-3',
    title: 'Mind mapping',
    description: 'Visualize thoughts and ideas',
    category: 'mentalClarity',
    benefits: 'Enhances creative thinking and problem-solving',
  },
  
  // Intimacy habits
  {
    id: 'intimacy-1',
    title: 'Schedule couple time',
    description: 'Dedicate uninterrupted time to connect',
    category: 'intimacy',
    benefits: 'Strengthens emotional bond and communication',
  },
  {
    id: 'intimacy-2',
    title: 'Solo self-care routine',
    description: 'Prioritize your own physical and emotional needs',
    category: 'intimacy',
    benefits: 'Builds self-love and confidence',
  },
  {
    id: 'intimacy-3',
    title: 'Express appreciation',
    description: 'Tell your partner something you appreciate daily',
    category: 'intimacy',
    benefits: 'Increases feelings of connection and satisfaction',
  },
];

// Smart habit suggestions based on user data
export const useHabitRecommendations = () => {
  const { entries, getSleepEntries, getIntimacyEntries } = useMoodStore();
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);
  const [userHabits, setUserHabits] = useState<any[]>([]);

  useEffect(() => {
    generateSmartSuggestions();
  }, [entries]);

  const generateSmartSuggestions = async () => {
    try {
      // Get sleep data
      const sleepEntries = await getSleepEntries();
      
      // Get intimacy data
      const intimacyEntries = await getIntimacyEntries();
      
      // Generate smart suggestions based on user data
      const suggestions: any[] = [];
      
      // Analyze sleep quality
      if (sleepEntries.length > 0) {
        const recentSleepEntries = sleepEntries.slice(-7); // Last 7 days
        const avgSleepQuality = recentSleepEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentSleepEntries.length;
        
        if (avgSleepQuality < 3) {
          // Poor sleep quality - suggest sleep habits
          suggestions.push({
            id: 'smart-sleep-1',
            title: 'Deep breathing before bed',
            description: '5 minutes of diaphragmatic breathing',
            category: 'sleep',
            reason: 'Your sleep quality has been below average this week',
          });
          
          suggestions.push({
            id: 'smart-sleep-2',
            title: 'Cooler bedroom temperature',
            description: 'Set room temperature to 65-68°F',
            category: 'sleep',
            reason: 'Optimal temperature improves sleep quality',
          });
          
          suggestions.push({
            id: 'smart-sleep-3',
            title: 'No screens 30 mins before sleep',
            description: 'Reduce blue light exposure before sleep',
            category: 'sleep',
            reason: 'Screen time before bed disrupts melatonin production',
          });
        }
      }
      
      // Analyze mood patterns
      if (entries.length > 0) {
        const recentEntries = entries.slice(-7); // Last 7 days
        const moodCounts: Record<number, number> = {};
        
        // Count mood frequencies
        recentEntries.forEach(entry => {
          moodCounts[entry.moodId] = (moodCounts[entry.moodId] || 0) + 1;
        });
        
        // Find most common low moods
        const lowMoodIds = Object.entries(moodCounts)
          .filter(([_, count]) => count >= 3) // Appeared 3+ times
          .map(([moodId]) => parseInt(moodId))
          .filter(moodId => moodId <= 2); // Assuming 1-2 are low moods
        
        if (lowMoodIds.length > 0) {
          suggestions.push({
            id: 'smart-mood-1',
            title: 'Gratitude reflection',
            description: 'List 3 positive moments from your day',
            category: 'mood',
            reason: 'Mood tracking shows patterns of lower energy',
          });
          
          suggestions.push({
            id: 'smart-mood-2',
            title: '3-min mindfulness meditation',
            description: 'Focus on breath and let thoughts pass',
            category: 'mood',
            reason: 'Mindfulness helps regulate emotional responses',
          });
        }
        
        // Check for high anxiety patterns (assuming mood IDs 1-2 might indicate anxiety)
        const anxiousMoodCount = recentEntries.filter(entry => entry.moodId <= 2).length;
        if (anxiousMoodCount >= 3) {
          suggestions.push({
            id: 'smart-anxiety-1',
            title: 'Box breathing exercise',
            description: '4-4-4-4 breathing technique',
            category: 'anxiety',
            reason: 'Breathing exercises reduce anxiety and stress',
          });
        }
      }
      
      // Analyze intimacy patterns
      if (intimacyEntries.length > 0) {
        const recentIntimacyEntries = intimacyEntries.slice(-14); // Last 14 days
        const intimacyCount = recentIntimacyEntries.length;
        
        if (intimacyCount < 3) {
          // Low intimacy frequency - suggest intimacy habits
          suggestions.push({
            id: 'smart-intimacy-1',
            title: 'Schedule intimate time',
            description: 'Dedicate 30 minutes this week for connection',
            category: 'intimacy',
            reason: 'Regular intimacy supports emotional wellbeing',
          });
        }
      }
      
      // Add some general suggestions if we don't have enough smart ones
      while (suggestions.length < 5) {
        const generalHabits = HABIT_LIBRARY.filter(habit => 
          habit.category === 'mentalClarity' || habit.category === 'health'
        );
        
        const randomHabit = generalHabits[Math.floor(Math.random() * generalHabits.length)];
        if (!suggestions.find(s => s.id === randomHabit.id)) {
          suggestions.push({
            ...randomHabit,
            id: `general-${suggestions.length}-${randomHabit.id}`,
            reason: 'General wellness habit for balanced lifestyle',
          });
        }
      }
      
      setSmartSuggestions(suggestions.slice(0, 5)); // Top 5 suggestions
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
      // Fallback to some general suggestions
      setSmartSuggestions([
        {
          id: 'fallback-1',
          title: 'Mindful breathing',
          description: 'Take 5 deep breaths when feeling stressed',
          category: 'mindfulness',
          reason: 'General stress management technique',
        },
        {
          id: 'fallback-2',
          title: 'Hydration check',
          description: 'Drink a glass of water every 2 hours',
          category: 'health',
          reason: 'Staying hydrated supports overall wellbeing',
        },
        {
          id: 'fallback-3',
          title: 'Evening reflection',
          description: 'Spend 5 minutes reviewing your day',
          category: 'mindfulness',
          reason: 'Reflection helps process daily experiences',
        },
        {
          id: 'fallback-4',
          title: 'Morning stretch',
          description: '5 minutes of gentle stretching',
          category: 'health',
          reason: 'Improves flexibility and circulation',
        },
        {
          id: 'fallback-5',
          title: 'Digital detox hour',
          description: 'One hour without screens or notifications',
          category: 'mentalClarity',
          reason: 'Reduces cognitive overload and eye strain',
        },
      ]);
    }
  };

  const addHabit = (habit: any) => {
    setUserHabits(prev => [...prev, habit]);
  };

  const getHabitLibrary = () => {
    return HABIT_LIBRARY;
  };

  const getHabitsByCategory = (category: string) => {
    return HABIT_LIBRARY.filter(habit => habit.category === category);
  };

  // Enhanced function to get personalized habits based on user data
  const getPersonalizedHabits = () => {
    const personalizedHabits = [...HABIT_LIBRARY];
    
    // Sort habits based on user data
    // This is a simplified version - in a real app, you would have more sophisticated logic
    personalizedHabits.sort((a, b) => {
      // Prioritize habits based on user's recent entries
      if (entries.length > 0) {
        const recentEntries = entries.slice(-7);
        const moodCategories = recentEntries.map(entry => {
          if (entry.moodId <= 2) return 'mood'; // Low mood
          if (entry.moodId >= 4) return 'sleep'; // High energy might correlate with good sleep habits
          return null;
        }).filter(Boolean);
        
        // Boost habits in categories that match recent mood patterns
        const aBoost = moodCategories.filter(cat => cat === a.category).length;
        const bBoost = moodCategories.filter(cat => cat === b.category).length;
        
        return bBoost - aBoost;
      }
      return 0;
    });
    
    return personalizedHabits;
  };

  return {
    smartSuggestions,
    userHabits,
    addHabit,
    getHabitLibrary,
    getHabitsByCategory,
    getPersonalizedHabits,
  };
};