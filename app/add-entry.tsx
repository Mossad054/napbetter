import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  X,
  Calendar,
  Heart,
  Moon,
  Brain,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import MentalClarityTestModal from '@/components/MentalClarityTestModal';
import { useMoodStore } from '@/hooks/mood-store';
import { IntimacyEntry } from '@/types/mood';

// ---------------- Types ----------------
interface MoodOption {
  id: number;
  label: string;
  emoji: string;
  score: number;
}

interface ActivityTag {
  id: string;
  name: string;
  emoji: string;
  category: string;
  selected: boolean;
}

// New type for activity details
interface ActivityDetail {
  id: string;
  type: 'duration' | 'location' | 'workLocation' | 'reading' | 'cooking' | 'music' | 'nature' | 'gaming' | 'text' | 'multipleChoice';
  value: string | number;
}

// New types for emotions and triggers
interface Emotion {
  id: string;
  name: string;
  emoji: string;
}

interface EmotionTrigger {
  emotionId: string;
  trigger: string;
}

// New type for time-based mood entries
interface TimeBasedMood {
  id: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  moodScore: number | null;
  emotions: Emotion[];
  emotionTriggers: Record<string, string>;
  timestamp: string;
}

interface SleepData {
  bedtime: string;
  wakeTime: string;
  quality: number;
  wakingFeeling: string;
}

// New type for productivity data
interface ProductivityData {
  score: number | null;
  hours: number | null;
  triggers: string[];
}

// New type for intimacy tracker data
interface IntimacyTrackerData {
  trackIntimacy: boolean;
  hadIntimacy: boolean;
  type: 'solo' | 'couple';
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  location: 'home' | 'away';
  toyUsed: boolean;
  orgasm: boolean;
  moodBefore: number;
  moodAfter: number;
  timeToSleep: number | null; // 30 min = 30, 1 hr = 60, 2 hrs = 120
}

// New types for the accordion activities
interface ActivityItem {
  id: string;
  name: string;
  emoji: string;
  hasDetails: boolean;
  detailType?: 'text' | 'duration' | 'multipleChoice';
  detailOptions?: string[];
  detailLabel?: string;
}

interface ActivityCategory {
  id: string;
  name: string;
  icon: string;
  activities: ActivityItem[];
}

// ---------------- Constants ----------------
const moodOptions: MoodOption[] = [
  { id: 1, label: 'Awful', emoji: '😢', score: 1 },
  { id: 2, label: 'Bad', emoji: '😕', score: 2 },
  { id: 3, label: 'Meh', emoji: '😐', score: 3 },
  { id: 4, label: 'Good', emoji: '😊', score: 4 },
  { id: 5, label: 'Rad', emoji: '😄', score: 5 },
];

// Emotions library
const emotionsLibrary: Emotion[] = [
  { id: 'happy', name: 'Happy', emoji: '😀' },
  { id: 'excited', name: 'Excited', emoji: '🤩' },
  { id: 'grateful', name: 'Grateful', emoji: '🙏' },
  { id: 'relaxed', name: 'Relaxed', emoji: '😌' },
  { id: 'content', name: 'Content', emoji: '🙂' },
  { id: 'tired', name: 'Tired', emoji: '😴' },
  { id: 'unsure', name: 'Unsure', emoji: '🤔' },
  { id: 'bored', name: 'Bored', emoji: '😐' },
  { id: 'anxious', name: 'Anxious', emoji: '😟' },
  { id: 'angry', name: 'Angry', emoji: '😠' },
  { id: 'stressed', name: 'Stressed', emoji: '😥' },
  { id: 'sad', name: 'Sad', emoji: '😢' },
  { id: 'desperate', name: 'Desperate', emoji: '😖' },
];

// New activity categories with their items
const activityCategories: ActivityCategory[] = [
  {
    id: 'beauty',
    name: 'Beauty',
    icon: '💅',
    activities: [
      { id: 'haircut', name: 'Haircut', emoji: '✂️', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Home', 'Salon'], detailLabel: 'Where did you get it?' },
      { id: 'wellness', name: 'Wellness', emoji: '🧘', hasDetails: true, detailType: 'duration', detailLabel: 'Duration (minutes)' },
      { id: 'massage', name: 'Massage', emoji: '💆', hasDetails: true, detailType: 'duration', detailLabel: 'Duration (minutes)' },
      { id: 'manicure', name: 'Manicure', emoji: '💅', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Home', 'Salon'], detailLabel: 'Location' },
      { id: 'pedicure', name: 'Pedicure', emoji: '🦶', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Home', 'Salon'], detailLabel: 'Location' },
      { id: 'skincare', name: 'Skincare', emoji: '🧴', hasDetails: true, detailType: 'text', detailLabel: 'Products used?' },
      { id: 'spa', name: 'Spa', emoji: ' tắm', hasDetails: true, detailType: 'duration', detailLabel: 'How long? (hours)' },
    ]
  },
  {
    id: 'betterme',
    name: 'BetterMe',
    icon: '🌸',
    activities: [
      { id: 'listened', name: 'Listened', emoji: '🎧', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Podcast', 'Audiobook', 'Music'], detailLabel: 'What did you listen to?' },
      { id: 'donated', name: 'Donated', emoji: '💖', hasDetails: true, detailType: 'text', detailLabel: 'What cause?' },
      { id: 'kindness', name: 'Show Kindness', emoji: '🌸', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Family', 'Friend', 'Stranger'], detailLabel: 'Who to?' },
      { id: 'meditated', name: 'Meditated', emoji: '🧘‍♂️', hasDetails: true, detailType: 'duration', detailLabel: 'Duration (minutes)' },
    ]
  },
  {
    id: 'hobbies',
    name: 'Hobbies',
    icon: '🎮',
    activities: [
      { id: 'movies', name: 'Movies', emoji: '🎬', hasDetails: true, detailType: 'text', detailLabel: 'Movie name?' },
      { id: 'reading', name: 'Reading', emoji: '📚', hasDetails: true, detailType: 'text', detailLabel: 'Book name or minutes read' },
      { id: 'gaming', name: 'Gaming', emoji: '🎮', hasDetails: true, detailType: 'text', detailLabel: 'Game name or time played' },
      { id: 'relax', name: 'Relax', emoji: '🛋️', hasDetails: true, detailType: 'duration', detailLabel: 'How long?' },
      { id: 'swimming', name: 'Swimming', emoji: '🏊', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Pool', 'Open water'], detailLabel: 'Where?' },
    ]
  },
  {
    id: 'health',
    name: 'Health',
    icon: '🏋️',
    activities: [
      { id: 'exercise', name: 'Exercise', emoji: '🏋️', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Gym', 'Home', 'Outdoor'], detailLabel: 'Where?' },
      { id: 'eat-healthy', name: 'Eat Healthy', emoji: '🥗', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Breakfast', 'Lunch', 'Dinner'], detailLabel: 'Meal type?' },
      { id: 'drink-water', name: 'Drink Water', emoji: '💧', hasDetails: true, detailType: 'duration', detailLabel: 'How many glasses?' },
      { id: 'walk', name: 'Walk', emoji: '🚶', hasDetails: true, detailType: 'duration', detailLabel: 'How long (minutes)?' },
      { id: 'sport', name: 'Sport', emoji: '⚽', hasDetails: true, detailType: 'text', detailLabel: 'Which sport?' },
    ]
  },
  {
    id: 'places',
    name: 'Places',
    icon: '🌍',
    activities: [
      { id: 'home', name: 'Home', emoji: '🏠', hasDetails: false },
      { id: 'work', name: 'Work', emoji: '💻', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Work from Home', 'Office'], detailLabel: 'Location' },
      { id: 'school', name: 'School', emoji: '🎓', hasDetails: true, detailType: 'text', detailLabel: 'Class / Study session' },
      { id: 'visit', name: 'Visit', emoji: '👫', hasDetails: true, detailType: 'text', detailLabel: 'Who did you visit?' },
      { id: 'travel', name: 'Travel', emoji: '✈️', hasDetails: true, detailType: 'text', detailLabel: 'Destination?' },
      { id: 'gym', name: 'Gym', emoji: '🏋️', hasDetails: false },
      { id: 'cinema', name: 'Cinema', emoji: '🍿', hasDetails: false },
      { id: 'nature', name: 'Nature', emoji: '🌳', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Park', 'Hike', 'Other'], detailLabel: 'Where?' },
      { id: 'vacation', name: 'Vacation', emoji: '🏝️', hasDetails: true, detailType: 'text', detailLabel: 'Destination?' },
    ]
  },
  {
    id: 'chores',
    name: 'Chores',
    icon: '🧹',
    activities: [
      { id: 'shopping', name: 'Shopping', emoji: '🛍️', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Groceries', 'Other'], detailLabel: 'What type?' },
      { id: 'cleaning', name: 'Cleaning', emoji: '🧹', hasDetails: true, detailType: 'text', detailLabel: 'What area?' },
      { id: 'cooking', name: 'Cooking', emoji: '🍳', hasDetails: true, detailType: 'text', detailLabel: 'Meal cooked' },
      { id: 'laundry', name: 'Laundry', emoji: '🧺', hasDetails: true, detailType: 'multipleChoice', detailOptions: ['Machine', 'Hand wash'], detailLabel: 'How?' },
    ]
  }
];

const wakingFeelings = ['Refreshed', 'Tired', 'Foggy', 'Energized', 'Groggy', 'Alert'];

// Productivity triggers
const productivityTriggers = [
  // Positive triggers
  { id: 'good-sleep', label: 'Good Sleep', emoji: '😴', type: 'positive' },
  { id: 'coffee', label: 'Coffee', emoji: '☕', type: 'positive' },
  { id: 'exercise', label: 'Exercise', emoji: '🏋️', type: 'positive' },
  { id: 'deep-work', label: 'Deep Work', emoji: '💻', type: 'positive' },
  
  // Negative triggers
  { id: 'meetings', label: 'Meetings', emoji: '📅', type: 'negative' },
  { id: 'social-media', label: 'Social Media', emoji: '📱', type: 'negative' },
  { id: 'poor-sleep', label: 'Poor Sleep', emoji: '🌙', type: 'negative' },
  { id: 'distractions', label: 'Distractions', emoji: '🔔', type: 'negative' },
];

// ---------------- Main Component ----------------
export default function AddEntryScreen() {
  const insets = useSafeAreaInsets();
  const { addMoodEntry, addIntimacyEntry } = useMoodStore();

  // --- State ---
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [activityTags, setActivityTags] = useState<ActivityTag[]>([]);
  const [activityDetails, setActivityDetails] = useState<Record<string, ActivityDetail>>({});
  const [customActivity, setCustomActivity] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [includeIntimacy, setIncludeIntimacy] = useState(true);
  const [intimacyExpanded, setIntimacyExpanded] = useState(false);
  const [intimacyData, setIntimacyData] = useState<IntimacyEntry>({
    date: new Date().toISOString().split('T')[0],
    type: 'couple',
    orgasmed: false,
    place: 'home',
    toys: false,
    timeToSleep: 0,
    moodBefore: 3,
    moodAfter: 3,
  });
  const [sleepData, setSleepData] = useState<SleepData>({
    bedtime: '22:00',
    wakeTime: '07:00',
    quality: 3,
    wakingFeeling: 'Refreshed',
  });
  const [showMentalClarityTest, setShowMentalClarityTest] = useState(false);
  const [mentalClarityScore, setMentalClarityScore] = useState<number | null>(null);
  
  // New state for productivity
  const [productivityData, setProductivityData] = useState<ProductivityData>({
    score: null,
    hours: null,
    triggers: [],
  });
  
  // New state for intimacy tracker
  const [intimacyTrackerData, setIntimacyTrackerData] = useState<IntimacyTrackerData>({
    trackIntimacy: true,
    hadIntimacy: false,
    type: 'couple',
    timeOfDay: 'evening',
    location: 'home',
    toyUsed: false,
    orgasm: false,
    moodBefore: 3,
    moodAfter: 3,
    timeToSleep: null,
  });
  
  // New state for accordion activities
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [customActivities, setCustomActivities] = useState<Record<string, string>>({});
  
  // New state for emotions and triggers
  const [selectedEmotions, setSelectedEmotions] = useState<Emotion[]>([]);
  const [emotionTriggers, setEmotionTriggers] = useState<Record<string, string>>({});
  const [customEmotion, setCustomEmotion] = useState('');
  
  // New state for time-based mood entries
  const [timeBasedMoods, setTimeBasedMoods] = useState<TimeBasedMood[]>([
    {
      id: 'morning',
      timeOfDay: 'morning',
      moodScore: null,
      emotions: [],
      emotionTriggers: {},
      timestamp: new Date().toISOString(),
    },
    {
      id: 'afternoon',
      timeOfDay: 'afternoon',
      moodScore: null,
      emotions: [],
      emotionTriggers: {},
      timestamp: new Date().toISOString(),
    },
    {
      id: 'evening',
      timeOfDay: 'evening',
      moodScore: null,
      emotions: [],
      emotionTriggers: {},
      timestamp: new Date().toISOString(),
    }
  ]);
  const [activeTimeOfDay, setActiveTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  // --- Handlers ---
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // New handlers for time-based moods
  const handleTimeBasedMoodChange = (timeOfDay: 'morning' | 'afternoon' | 'evening', moodScore: number) => {
    setTimeBasedMoods(prev => 
      prev.map(mood => 
        mood.timeOfDay === timeOfDay 
          ? { ...mood, moodScore } 
          : mood
      )
    );
  };

  const handleTimeBasedEmotionToggle = (timeOfDay: 'morning' | 'afternoon' | 'evening', emotion: Emotion) => {
    setTimeBasedMoods(prev => 
      prev.map(mood => {
        if (mood.timeOfDay === timeOfDay) {
          const isSelected = mood.emotions.some(e => e.id === emotion.id);
          const newEmotions = isSelected 
            ? mood.emotions.filter(e => e.id !== emotion.id)
            : [...mood.emotions, emotion];
          
          return { ...mood, emotions: newEmotions };
        }
        return mood;
      })
    );
  };

  const handleTimeBasedEmotionTriggerChange = (timeOfDay: 'morning' | 'afternoon' | 'evening', emotionId: string, trigger: string, triggerDetails?: string) => {
    setTimeBasedMoods(prev => 
      prev.map(mood => {
        if (mood.timeOfDay === timeOfDay) {
          const newTriggers = { ...mood.emotionTriggers };
          
          // Set the main trigger response
          newTriggers[emotionId] = trigger;
          
          // If we have details, store them separately
          if (triggerDetails !== undefined) {
            newTriggers[`${emotionId}_details`] = triggerDetails;
          } else if (trigger !== 'yes') {
            // If not 'yes', remove any existing details
            delete newTriggers[`${emotionId}_details`];
          }
          
          return { ...mood, emotionTriggers: newTriggers };
        }
        return mood;
      })
    );
  };

  // New handlers for emotions and triggers (for the current active time of day)
  const handleEmotionToggle = (emotion: Emotion) => {
    const currentTimeMood = timeBasedMoods.find(mood => mood.timeOfDay === activeTimeOfDay);
    if (currentTimeMood) {
      const isSelected = currentTimeMood.emotions.some(e => e.id === emotion.id);
      if (isSelected) {
        // Remove emotion and its triggers
        setTimeBasedMoods(prev => 
          prev.map(mood => {
            if (mood.timeOfDay === activeTimeOfDay) {
              const newEmotions = mood.emotions.filter(e => e.id !== emotion.id);
              const newTriggers = { ...mood.emotionTriggers };
              delete newTriggers[emotion.id];
              delete newTriggers[`${emotion.id}_details`];
              return { ...mood, emotions: newEmotions, emotionTriggers: newTriggers };
            }
            return mood;
          })
        );
      } else {
        // Add emotion
        setTimeBasedMoods(prev => 
          prev.map(mood => {
            if (mood.timeOfDay === activeTimeOfDay) {
              return { ...mood, emotions: [...mood.emotions, emotion] };
            }
            return mood;
          })
        );
      }
    }
  };

  const handleEmotionTriggerChange = (emotionId: string, trigger: string) => {
    setTimeBasedMoods(prev => 
      prev.map(mood => {
        if (mood.timeOfDay === activeTimeOfDay) {
          const newTriggers = { ...mood.emotionTriggers, [emotionId]: trigger };
          
          // If user selects "no" or "idk", clear the detailed trigger
          if (trigger === 'no' || trigger === 'idk') {
            delete newTriggers[`${emotionId}_details`];
          }
          
          return { ...mood, emotionTriggers: newTriggers };
        }
        return mood;
      })
    );
  };

  const handleAddCustomEmotion = () => {
    if (!customEmotion.trim()) return;

    const newEmotion: Emotion = {
      id: `custom-${Date.now()}`,
      name: customEmotion.trim(),
      emoji: '💭', // Default emoji for custom emotions
    };

    setTimeBasedMoods(prev => 
      prev.map(mood => {
        if (mood.timeOfDay === activeTimeOfDay) {
          return { ...mood, emotions: [...mood.emotions, newEmotion] };
        }
        return mood;
      })
    );
    
    setCustomEmotion('');
  };

  // New handlers for accordion activities
  const handleActivityToggle = (categoryId: string, activityId: string) => {
    setActivityTags(prev => {
      const isSelected = prev.some(tag => tag.id === activityId);
      if (isSelected) {
        // Remove activity
        return prev.filter(tag => tag.id !== activityId);
      } else {
        // Add activity
        const category = activityCategories.find(cat => cat.id === categoryId);
        const activity = category?.activities.find(act => act.id === activityId);
        if (activity && category) {
          return [...prev, { 
            id: activityId, 
            name: activity.name, 
            emoji: activity.emoji, 
            category: category.name, 
            selected: true 
          }];
        }
        return prev;
      }
    });
  };

  const handleActivityDetailChange = (activityId: string, type: ActivityDetail['type'], value: string | number) => {
    setActivityDetails(prev => ({
      ...prev,
      [activityId]: { id: activityId, type, value }
    }));
  };

  const handleCustomActivityChange = (categoryId: string, value: string) => {
    setCustomActivities(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const handleAddCustomActivity = (categoryId: string) => {
    const customActivityName = customActivities[categoryId];
    if (!customActivityName?.trim()) return;

    const newActivity: ActivityTag = {
      id: `${categoryId}-custom-${Date.now()}`,
      name: customActivityName.trim(),
      emoji: '⭐',
      category: categoryId,
      selected: true,
    };
    setActivityTags(prev => [...prev, newActivity]);
    
    // Clear the custom input for this category
    setCustomActivities(prev => ({
      ...prev,
      [categoryId]: ''
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  // Handler for productivity triggers
  const handleProductivityTriggerToggle = (triggerId: string) => {
    setProductivityData(prev => {
      const isSelected = prev.triggers.includes(triggerId);
      if (isSelected) {
        // Remove trigger
        return {
          ...prev,
          triggers: prev.triggers.filter(id => id !== triggerId)
        };
      } else {
        // Add trigger
        return {
          ...prev,
          triggers: [...prev.triggers, triggerId]
        };
      }
    });
  };

  // Handler for productivity score
  const handleProductivityScoreChange = (score: number) => {
    setProductivityData(prev => ({
      ...prev,
      score
    }));
  };

  // Handler for productivity hours
  const handleProductivityHoursChange = (text: string) => {
    const hours = text === '' ? null : parseFloat(text);
    setProductivityData(prev => ({
      ...prev,
      hours
    }));
  };

  // Handler for mental clarity test completion
  const handleMentalClarityTestComplete = (score: number) => {
    console.log('Mental clarity test completed with score:', score);
    setMentalClarityScore(score);
  };

  // Handler for mental clarity test button press
  const handleMentalClarityTestPress = () => {
    console.log('Mental clarity test button pressed');
    setShowMentalClarityTest(true);
  };

  const handleSaveEntry = () => {
    // Save all time-based mood entries
    timeBasedMoods.forEach(timeMood => {
      if (timeMood.moodScore !== null) {
        // Save mood entry for this time of day
        addMoodEntry(
          timeMood.moodScore,
          [], // activities for this specific time entry
          undefined, // note
          selectedDate,
          {
            quality: sleepData.quality,
            bedtime: sleepData.bedtime,
            wakeTime: sleepData.wakeTime
          }
        );
      }
    });

    // Save intimacy entry if enabled and data exists
    if (includeIntimacy && intimacyData) {
      addIntimacyEntry({
        date: selectedDate,
        type: intimacyData.type,
        orgasmed: intimacyData.orgasmed,
        place: intimacyData.place,
        toys: intimacyData.toys,
        timeToSleep: intimacyData.timeToSleep,
        moodBefore: intimacyData.moodBefore,
        moodAfter: intimacyData.moodAfter
      });
    }

    // Log productivity data if any productivity data was entered
    const hasProductivityData = productivityData.score !== null || 
                               productivityData.hours !== null || 
                               productivityData.triggers.length > 0;
    
    if (hasProductivityData) {
      console.log('Productivity data:', productivityData);
      // TODO: Save productivity data to store when the store is updated to support it
    }

    // Log intimacy tracker data if tracking is enabled
    if (intimacyTrackerData.trackIntimacy) {
      console.log('Intimacy tracker data:', intimacyTrackerData);
      // TODO: Save intimacy tracker data when the store is updated to support it
    }

    console.log('Saving entries:', {
      date: selectedDate,
      timeBasedMoods,
      sleep: sleepData,
      intimacy: includeIntimacy ? intimacyData : null,
      productivity: hasProductivityData ? productivityData : null,
      intimacyTracker: intimacyTrackerData.trackIntimacy ? intimacyTrackerData : null,
    });

    Alert.alert('Entries Saved!', 'Your daily entries have been stored.', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
    ]);
  };

  // --- Render ---
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom header with close button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            console.log('Close button pressed');
            router.replace('/(tabs)/home');
          }} 
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <X size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            // onPress={() => setShowDatePicker(true)} // TODO: Implement date picker
          >
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Time-based Mood and Emotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          
          {/* Time of Day Selector */}
          <View style={styles.timeOfDaySelector}>
            {(['morning', 'afternoon', 'evening'] as const).map((timeOfDay) => (
              <TouchableOpacity
                key={timeOfDay}
                style={[
                  styles.timeOfDayButton,
                  activeTimeOfDay === timeOfDay && styles.activeTimeOfDayButton,
                ]}
                onPress={() => setActiveTimeOfDay(timeOfDay)}
              >
                <Text style={[
                  styles.timeOfDayText,
                  activeTimeOfDay === timeOfDay && styles.activeTimeOfDayText,
                ]}>
                  {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Mood Selection for Active Time of Day */}
          <View style={styles.moodGrid}>
            {moodOptions.map(mood => {
              const currentTimeMood = timeBasedMoods.find(m => m.timeOfDay === activeTimeOfDay);
              const isSelected = currentTimeMood?.moodScore === mood.score;
              
              return (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodOption,
                    isSelected && styles.selectedMoodOption,
                  ]}
                  onPress={() => handleTimeBasedMoodChange(activeTimeOfDay, mood.score)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Emotions & Triggers for Active Time of Day */}
          {timeBasedMoods.find(m => m.timeOfDay === activeTimeOfDay)?.moodScore !== null && (
            <View style={styles.emotionsSection}>
              <Text style={styles.subSectionTitle}>How can you describe your emotions today?</Text>
              <View style={styles.emotionsGrid}>
                {emotionsLibrary.map(emotion => {
                  const currentTimeMood = timeBasedMoods.find(m => m.timeOfDay === activeTimeOfDay);
                  const isSelected = currentTimeMood?.emotions.some(e => e.id === emotion.id);
                  const triggerResponse = currentTimeMood?.emotionTriggers[emotion.id];
                  const triggerDetails = currentTimeMood?.emotionTriggers[`${emotion.id}_details`];
                  
                  return (
                    <View key={emotion.id} style={styles.emotionContainer}>
                      <TouchableOpacity
                        style={[
                          styles.emotionTag,
                          isSelected && styles.selectedEmotionTag,
                        ]}
                        onPress={() => handleTimeBasedEmotionToggle(activeTimeOfDay, emotion)}
                      >
                        <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                        <Text
                          style={[
                            styles.emotionName,
                            isSelected && styles.selectedEmotionName,
                          ]}
                        >
                          {emotion.name}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkIcon}>
                            <Check size={12} color={COLORS.surface} />
                          </View>
                        )}
                      </TouchableOpacity>

                      {/* Trigger Question - Only show when emotion is selected */}
                      {isSelected && (
                        <View style={styles.emotionTriggerContainer}>
                          <Text style={styles.detailLabel}>Do you think there is a trigger to this emotion?</Text>
                          <View style={styles.triggerOptionsContainer}>
                            {['yes', 'no', 'idk'].map((option) => (
                              <TouchableOpacity
                                key={option}
                                style={[
                                  styles.triggerOption,
                                  triggerResponse === option && styles.selectedTriggerOption,
                                ]}
                                onPress={() => handleTimeBasedEmotionTriggerChange(activeTimeOfDay, emotion.id, option)}
                              >
                                <Text style={[
                                  styles.triggerOptionText,
                                  triggerResponse === option && styles.selectedTriggerOptionText,
                                ]}>
                                  {option === 'yes' ? 'Yes' : option === 'no' ? 'No' : "I don't know"}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>

                          {/* Text input for trigger details - only show when "Yes" is selected */}
                          {triggerResponse === 'yes' && (
                            <View style={styles.triggerInputContainer}>
                              <Text style={styles.detailLabel}>What triggered this feeling?</Text>
                              <TextInput
                                style={styles.detailInput}
                                placeholder="e.g., Work deadline, Morning walk..."
                                value={triggerDetails || ''}
                                onChangeText={(value) => handleTimeBasedEmotionTriggerChange(activeTimeOfDay, emotion.id, 'yes', value)}
                              />
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Custom emotion input */}
              <View style={styles.customActivityContainer}>
                <TextInput
                  style={styles.customActivityInput}
                  placeholder="Add custom emotion..."
                  value={customEmotion}
                  onChangeText={setCustomEmotion}
                />
                <TouchableOpacity
                  style={styles.addCustomButton}
                  onPress={handleAddCustomEmotion}
                >
                  <Check size={16} color={COLORS.surface} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Activities - New Accordion Design */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities & Tags</Text>
          {activityCategories.map(category => (
            <View key={category.id} style={styles.accordionCategory}>
              <TouchableOpacity 
                style={styles.accordionHeader}
                onPress={() => toggleCategory(category.id)}
              >
                <View style={styles.accordionHeaderContent}>
                  <Text style={styles.accordionIcon}>{category.icon}</Text>
                  <Text style={styles.accordionTitle}>{category.name}</Text>
                </View>
                {expandedCategory === category.id ? (
                  <ChevronUp size={20} color={COLORS.textTertiary} />
                ) : (
                  <ChevronDown size={20} color={COLORS.textTertiary} />
                )}
              </TouchableOpacity>

              {expandedCategory === category.id && (
                <View style={styles.accordionContent}>
                  <View style={styles.activityGrid}>
                    {category.activities.map(activity => {
                      const isSelected = activityTags.some(tag => tag.id === activity.id);
                      return (
                        <View key={activity.id} style={styles.activityContainer}>
                          <TouchableOpacity
                            style={[
                              styles.activityTag,
                              isSelected && styles.selectedActivityTag,
                            ]}
                            onPress={() => handleActivityToggle(category.id, activity.id)}
                          >
                            <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                            <Text style={styles.activityName}>{activity.name}</Text>
                            {isSelected && (
                              <View style={styles.checkIcon}>
                                <Check size={12} color={COLORS.surface} />
                              </View>
                            )}
                          </TouchableOpacity>

                          {/* Activity Details - Inline and collapsible */}
                          {isSelected && activity.hasDetails && (
                            <View style={styles.activityDetailContainer}>
                              <Text style={styles.detailLabel}>{activity.detailLabel}</Text>
                              {activity.detailType === 'text' && (
                                <TextInput
                                  style={styles.detailInput}
                                  placeholder="Enter details..."
                                  value={activityDetails[activity.id]?.value?.toString() || ''}
                                  onChangeText={(value) => handleActivityDetailChange(activity.id, 'text', value)}
                                />
                              )}
                              
                              {activity.detailType === 'duration' && (
                                <TextInput
                                  style={styles.detailInput}
                                  placeholder="e.g., 30"
                                  value={activityDetails[activity.id]?.value?.toString() || ''}
                                  onChangeText={(value) => handleActivityDetailChange(activity.id, 'duration', value)}
                                  keyboardType="numeric"
                                />
                              )}
                              
                              {activity.detailType === 'multipleChoice' && activity.detailOptions && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionContainer}>
                                  {activity.detailOptions.map((option) => (
                                    <TouchableOpacity
                                      key={option}
                                      style={[
                                        styles.optionButton,
                                        activityDetails[activity.id]?.value === option && styles.selectedOptionButton
                                      ]}
                                      onPress={() => handleActivityDetailChange(activity.id, 'multipleChoice', option)}
                                    >
                                      <Text style={[
                                        styles.optionText,
                                        activityDetails[activity.id]?.value === option && styles.selectedOptionText
                                      ]}>
                                        {option}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                </ScrollView>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>

                  {/* Custom activity input for this category */}
                  <View style={styles.customActivityContainer}>
                    <TextInput
                      style={styles.customActivityInput}
                      placeholder={`Add custom ${category.name.toLowerCase()} activity...`}
                      value={customActivities[category.id] || ''}
                      onChangeText={(value) => handleCustomActivityChange(category.id, value)}
                    />
                    <TouchableOpacity
                      style={styles.addCustomButton}
                      onPress={() => handleAddCustomActivity(category.id)}
                    >
                      <Check size={16} color={COLORS.surface} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Productivity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productivity</Text>
          </View>
          
          <View style={styles.productivitySection}>
            {/* Productivity Score (1-5 stars) */}
            <Text style={styles.subSectionTitle}>How productive did you feel today?</Text>
            <View style={styles.starRatingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={[
                    styles.starButton,
                    productivityData.score === star && styles.selectedStarButton,
                  ]}
                  onPress={() => handleProductivityScoreChange(star)}
                >
                  <Text style={styles.starEmoji}>{'⭐'}</Text>
                  <Text style={styles.starLabel}>{star}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Focused Work Hours */}
            <Text style={[styles.subSectionTitle, { marginTop: SPACING.md }]}>Focused work hours (optional)</Text>
            <TextInput
              style={styles.productivityHoursInput}
              placeholder="e.g., 2.5"
              keyboardType="numeric"
              value={productivityData.hours !== null ? productivityData.hours.toString() : ''}
              onChangeText={handleProductivityHoursChange}
            />
            
            {/* Productivity Triggers */}
            <Text style={[styles.subSectionTitle, { marginTop: SPACING.md }]}>What affected your productivity?</Text>
            <View style={styles.productivityTriggersContainer}>
              {productivityTriggers.map((trigger) => (
                <TouchableOpacity
                  key={trigger.id}
                  style={[
                    styles.productivityTriggerButton,
                    productivityData.triggers.includes(trigger.id) && 
                      (trigger.type === 'positive' ? styles.selectedPositiveTrigger : styles.selectedNegativeTrigger),
                  ]}
                  onPress={() => handleProductivityTriggerToggle(trigger.id)}
                >
                  <Text style={[
                    styles.productivityTriggerText,
                    productivityData.triggers.includes(trigger.id) && styles.selectedProductivityTriggerText,
                  ]}>
                    {trigger.emoji} {trigger.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Save Productivity Button */}
            <TouchableOpacity
              style={[styles.toggleButton, { marginTop: SPACING.md, alignSelf: 'flex-start' }]}
              onPress={() => {
                // The data is already saved in state, this is just a visual confirmation
                console.log('Productivity data saved:', productivityData);
                Alert.alert('Productivity Saved', 'Your productivity data has been saved.');
              }}
            >
              <Text style={styles.toggleButtonText}>Save Productivity</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Intimacy Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Intimacy Tracker</Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIntimacyTrackerData(prev => ({
                ...prev,
                trackIntimacy: !prev.trackIntimacy
              }))}
            >
              <Text style={styles.toggleButtonText}>
                {intimacyTrackerData.trackIntimacy ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {intimacyTrackerData.trackIntimacy && (
            <View style={styles.intimacySection}>
              {/* Compact grid layout for all intimacy fields */}
              <View style={styles.compactIntimacyGrid}>
                {/* Did you have intimacy today? */}
                <View style={styles.intimacyField}>
                  <Text style={styles.subSectionTitle}>Did you have intimacy today?</Text>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        intimacyTrackerData.hadIntimacy && styles.selectedToggleButton,
                      ]}
                      onPress={() => setIntimacyTrackerData(prev => ({
                        ...prev,
                        hadIntimacy: true
                      }))}
                    >
                      <Text style={[
                        styles.toggleButtonText,
                        intimacyTrackerData.hadIntimacy && styles.selectedToggleButtonText,
                      ]}>
                        Yes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        !intimacyTrackerData.hadIntimacy && styles.selectedToggleButton,
                      ]}
                      onPress={() => setIntimacyTrackerData(prev => ({
                        ...prev,
                        hadIntimacy: false
                      }))}
                    >
                      <Text style={[
                        styles.toggleButtonText,
                        !intimacyTrackerData.hadIntimacy && styles.selectedToggleButtonText,
                      ]}>
                        No
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Type */}
                <View style={styles.intimacyField}>
                  <Text style={styles.subSectionTitle}>Type</Text>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        intimacyTrackerData.type === 'couple' && styles.selectedToggleButton,
                      ]}
                      onPress={() => setIntimacyTrackerData(prev => ({
                        ...prev,
                        type: 'couple'
                      }))}
                    >
                      <Text style={[
                        styles.toggleButtonText,
                        intimacyTrackerData.type === 'couple' && styles.selectedToggleButtonText,
                      ]}>
                        Couple
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        intimacyTrackerData.type === 'solo' && styles.selectedToggleButton,
                      ]}
                      onPress={() => setIntimacyTrackerData(prev => ({
                        ...prev,
                        type: 'solo'
                      }))}
                    >
                      <Text style={[
                        styles.toggleButtonText,
                        intimacyTrackerData.type === 'solo' && styles.selectedToggleButtonText,
                      ]}>
                        Solo
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Time of Day */}
                <View style={styles.intimacyField}>
                  <Text style={styles.subSectionTitle}>Time of Day</Text>
                  <View style={styles.toggleContainer}>
                    {(['morning', 'afternoon', 'evening'] as const).map((timeOfDay) => (
                      <TouchableOpacity
                        key={timeOfDay}
                        style={[
                          styles.toggleButton,
                          intimacyTrackerData.timeOfDay === timeOfDay && styles.selectedToggleButton,
                        ]}
                        onPress={() => setIntimacyTrackerData(prev => ({
                          ...prev,
                          timeOfDay
                        }))}
                      >
                        <Text style={[
                          styles.toggleButtonText,
                          intimacyTrackerData.timeOfDay === timeOfDay && styles.selectedToggleButtonText,
                        ]}>
                          {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Location */}
                <View style={styles.intimacyField}>
                  <Text style={styles.subSectionTitle}>Location</Text>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        intimacyTrackerData.location === 'home' && styles.selectedToggleButton,
                      ]}
                      onPress={() => setIntimacyTrackerData(prev => ({
                        ...prev,
                        location: 'home'
                      }))}
                    >
                      <Text style={[
                        styles.toggleButtonText,
                        intimacyTrackerData.location === 'home' && styles.selectedToggleButtonText,
                      ]}>
                        Home
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        intimacyTrackerData.location === 'away' && styles.selectedToggleButton,
                      ]}
                      onPress={() => setIntimacyTrackerData(prev => ({
                        ...prev,
                        location: 'away'
                      }))}
                    >
                      <Text style={[
                        styles.toggleButtonText,
                        intimacyTrackerData.location === 'away' && styles.selectedToggleButtonText,
                      ]}>
                        Away
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Toy Used */}
                <View style={styles.intimacyField}>
                  <Text style={styles.subSectionTitle}>Toy Used</Text>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        intimacyTrackerData.toyUsed && styles.selectedToggleButton,
                      ]}
                      onPress={() => setIntimacyTrackerData(prev => ({
                        ...prev,
                        toyUsed: true
                      }))}
                    >
                      <Text style={[
                        styles.toggleButtonText,
                        intimacyTrackerData.toyUsed && styles.selectedToggleButtonText,
                      ]}>
                        Yes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        !intimacyTrackerData.toyUsed && styles.selectedToggleButton,
                      ]}
                      onPress={() => setIntimacyTrackerData(prev => ({
                        ...prev,
                        toyUsed: false
                      }))}
                    >
                      <Text style={[
                        styles.toggleButtonText,
                        !intimacyTrackerData.toyUsed && styles.selectedToggleButtonText,
                      ]}>
                        No
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Orgasm */}
                <View style={styles.intimacyField}>
                  <Text style={styles.subSectionTitle}>Orgasm</Text>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        intimacyTrackerData.orgasm && styles.selectedToggleButton,
                      ]}
                      onPress={() => setIntimacyTrackerData(prev => ({
                        ...prev,
                        orgasm: true
                      }))}
                    >
                      <Text style={[
                        styles.toggleButtonText,
                        intimacyTrackerData.orgasm && styles.selectedToggleButtonText,
                      ]}>
                        Yes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        !intimacyTrackerData.orgasm && styles.selectedToggleButton,
                      ]}
                      onPress={() => setIntimacyTrackerData(prev => ({
                        ...prev,
                        orgasm: false
                      }))}
                    >
                      <Text style={[
                        styles.toggleButtonText,
                        !intimacyTrackerData.orgasm && styles.selectedToggleButtonText,
                      ]}>
                        No
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* Mood sections remain the same */}
              {intimacyTrackerData.hadIntimacy && (
                <>
                  {/* Mood Before */}
                  <Text style={styles.subSectionTitle}>Mood Before</Text>
                  <View style={styles.moodGrid}>
                    {moodOptions.map(mood => (
                      <TouchableOpacity
                        key={mood.id}
                        style={[
                          styles.moodOption,
                          intimacyTrackerData.moodBefore === mood.score && styles.selectedMoodOption,
                        ]}
                        onPress={() => setIntimacyTrackerData(prev => ({
                          ...prev,
                          moodBefore: mood.score
                        }))}
                      >
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                        <Text style={styles.moodLabel}>{mood.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {/* Mood After */}
                  <Text style={styles.subSectionTitle}>Mood After</Text>
                  <View style={styles.moodGrid}>
                    {moodOptions.map(mood => (
                      <TouchableOpacity
                        key={mood.id}
                        style={[
                          styles.moodOption,
                          intimacyTrackerData.moodAfter === mood.score && styles.selectedMoodOption,
                        ]}
                        onPress={() => setIntimacyTrackerData(prev => ({
                          ...prev,
                          moodAfter: mood.score
                        }))}
                      >
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                        <Text style={styles.moodLabel}>{mood.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {/* Time to Sleep (Conditional) */}
                  {intimacyTrackerData.timeOfDay === 'evening' && (
                    <>
                      <Text style={styles.subSectionTitle}>
                        How long did it take you to fall asleep after intimacy?
                      </Text>
                      <View style={styles.toggleContainer}>
                        <TouchableOpacity
                          style={[
                            styles.toggleButton,
                            intimacyTrackerData.timeToSleep === 30 && styles.selectedToggleButton,
                          ]}
                          onPress={() => setIntimacyTrackerData(prev => ({
                            ...prev,
                            timeToSleep: 30
                          }))}
                        >
                          <Text style={[
                            styles.toggleButtonText,
                            intimacyTrackerData.timeToSleep === 30 && styles.selectedToggleButtonText,
                          ]}>
                            30 min
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.toggleButton,
                            intimacyTrackerData.timeToSleep === 60 && styles.selectedToggleButton,
                          ]}
                          onPress={() => setIntimacyTrackerData(prev => ({
                            ...prev,
                            timeToSleep: 60
                          }))}
                        >
                          <Text style={[
                            styles.toggleButtonText,
                            intimacyTrackerData.timeToSleep === 60 && styles.selectedToggleButtonText,
                          ]}>
                            1 hr
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.toggleButton,
                            intimacyTrackerData.timeToSleep === 120 && styles.selectedToggleButton,
                          ]}
                          onPress={() => setIntimacyTrackerData(prev => ({
                            ...prev,
                            timeToSleep: 120
                          }))}
                        >
                          <Text style={[
                            styles.toggleButtonText,
                            intimacyTrackerData.timeToSleep === 120 && styles.selectedToggleButtonText,
                          ]}>
                            2 hrs
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}
              
              {/* Improve Intimacy Button */}
              <View style={{ marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => router.push('/intimacy/IntimacyWellnessHub')}
                >
                  <Text style={styles.toggleButtonText}>Improve My Intimacy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Mental Clarity Test */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowMentalClarityTest(true)}
          >
            <Text style={styles.toggleButtonText}>Take Mental Clarity Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <MentalClarityTestModal
        visible={showMentalClarityTest}
        onClose={() => setShowMentalClarityTest(false)}
        onTestComplete={handleMentalClarityTestComplete}
      />
    </View>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: { 
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40, // To balance the header layout
  },
  content: { 
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeOfDaySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  timeOfDayButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTimeOfDayButton: {
    backgroundColor: COLORS.primary,
  },
  timeOfDayText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  activeTimeOfDayText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: { 
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  subSectionTitle: { 
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dateSelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.sm,
  },
  dateText: { 
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },

  moodGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: SPACING.md,
  },
  moodOption: { 
    alignItems: 'center', 
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  selectedMoodOption: { 
    backgroundColor: COLORS.surfaceLight,
  },
  moodEmoji: { 
    fontSize: 28,
  },
  moodLabel: { 
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xs, 
    color: COLORS.textSecondary,
  },

  // Emotions styles
  emotionsSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emotionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: SPACING.sm,
  },
  emotionContainer: {
    width: '23%', // 4 emotions per row
  },
  emotionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  selectedEmotionTag: { 
    backgroundColor: COLORS.primary,
  },
  emotionEmoji: { 
    fontSize: 18, 
    marginRight: SPACING.xs,
  },
  emotionName: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  selectedEmotionName: { 
    color: COLORS.surface,
  },
  checkIcon: {
    position: 'absolute',
    right: 4,
    top: 4,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.sm,
    padding: 2,
  },
  emotionTriggerContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  triggerOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  triggerOption: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    minWidth: 70,
    alignItems: 'center',
  },
  selectedTriggerOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  triggerOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  selectedTriggerOptionText: {
    color: COLORS.surface,
  },
  triggerInputContainer: {
    marginTop: SPACING.sm,
  },

  // Accordion styles for activities
  accordionCategory: {
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  accordionTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  accordionContent: {
    paddingBottom: SPACING.md,
  },

  activityGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: SPACING.sm,
  },
  activityContainer: {
    width: '48%',
  },
  activityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  selectedActivityTag: { 
    backgroundColor: COLORS.primary,
  },
  activityEmoji: { 
    fontSize: 18, 
    marginRight: SPACING.xs,
  },
  activityName: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  selectedActivityName: { 
    color: COLORS.surface,
  },
  activityDetailContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  detailRow: {
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  detailInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    ...TYPOGRAPHY.caption,
  },
  optionContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.surface,
  },
  customActivityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  customActivityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    ...TYPOGRAPHY.caption,
  },
  addCustomButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intimacySection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  compactIntimacyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  intimacyField: {
    width: '48%', // Two columns layout
    marginBottom: SPACING.md,
  },
  intimacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  selectedIntimacyOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  intimacyLabelText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    margin: SPACING.xs,
  },
  selectedToggleButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectedToggleButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  toggleButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  selectedPositiveTrigger: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  selectedNegativeTrigger: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  // Productivity section styles
  productivitySection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.md,
  },
  starButton: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  selectedStarButton: {
    backgroundColor: COLORS.surfaceLight,
  },
  starEmoji: {
    fontSize: 24,
  },
  starLabel: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  productivityHoursInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.background,
  },
  productivityTriggersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  productivityTriggerButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    margin: SPACING.xs,
  },
  selectedProductivityTriggerButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  productivityTriggerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  selectedProductivityTriggerText: {
    color: COLORS.surface,
  },
});


