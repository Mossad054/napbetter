export interface Mood {
  id: number;
  name: string;
  color: string;
  value: number; // 1-5 scale
  emoji: string;
}

export interface Activity {
  id: number;
  name: string;
  icon: string;
  category: string;
  isGood: boolean;
}

export interface MoodEntry {
  id: number;
  moodId: number;
  date: string; // YYYY-MM-DD format
  note?: string;
  createdAt: string;
}

export interface EntryActivity {
  id: number;
  entryId: number;
  activityId: number;
}

export interface DayEntry {
  mood: Mood;
  activities: Activity[];
  note?: string;
  date: string;
  sleepQuality?: number; // 1-5 scale
  mentalClarity?: number; // 1-5 scale
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'preset' | 'custom';
  category: 'fitness' | 'habits' | 'health' | 'growth' | 'anxiety' | 'relationships' | 'custom';
  targetDays?: number;
  currentStreak: number;
  isActive: boolean;
  createdAt: string;
  completedDates: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  category: 'mood' | 'streak' | 'activities' | 'goals';
}

export interface MentalClarityTest {
  id: string;
  date: string;
  score: number; // 1-10 scale
  testType: 'focus' | 'memory' | 'processing';
  duration: number; // in seconds
}

export interface SleepEntry {
  id: string;
  date: string;
  quality: number; // 1-5 scale
  duration?: number; // in hours
  bedtime?: string;
  wakeTime?: string;
}

export interface ActivityCorrelation {
  activityId: number;
  activityName: string;
  moodImpact: number; // -2 to +2
  sleepImpact: number; // -2 to +2
  clarityImpact: number; // -2 to +2
  frequency: number;
}

export interface InsightData {
  statement: string;
  type: 'positive' | 'neutral' | 'negative';
  confidence: number; // 0-1
  category: 'mood' | 'sleep' | 'clarity' | 'activities';
}

// Updated IntimacyEntry to match the Supabase service
export interface IntimacyEntry {
  id?: number;
  date: string;
  type: 'solo' | 'couple';
  orgasmed: boolean;
  place: string;
  toys: boolean;
  timeToSleep: number;
  moodBefore: number;
  moodAfter: number;
  createdAt?: string;
}

export interface SleepTutorial {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'hygiene' | 'relaxation' | 'meditation';
  duration: number; // in minutes
  videoUrl?: string;
  audioUrl?: string;
  instructions: string[];
}

export interface TutorialCompletion {
  id: string;
  tutorialId: string;
  date: string;
  wasHelpful: boolean;
  rating: number; // 1-5 scale
  notes?: string;
}

export interface DailyRecommendation {
  id: string;
  date: string;
  type: 'activity' | 'intimacy' | 'sleep' | 'mood';
  suggestion: string;
  reason: string;
  wasFollowed?: boolean;
  effectiveness?: number; // 1-5 scale if followed
}

export interface MicroHabitRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'sleep' | 'mindfulness' | 'intimacy' | 'mood' | 'health';
  streak: number;
  lastCompleted?: string; // YYYY-MM-DD
  isCompletedToday: boolean;
  motivationNudge?: string;
}

export interface ExtendedHabit extends MicroHabitRecommendation {
  isActive: boolean;
  startDate?: string;
  duration?: number;
  reminderEnabled?: boolean;
  reminderTime?: string;
  totalCompleted?: number;
  lastFeedback?: 'good' | 'neutral' | 'bad';
  motivationQuote?: string;
  isPaused?: boolean;
}

export interface CalendarDayData {
  date: string;
  moods: {
    mood: Mood;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    timestamp: string;
  }[];
  sleepQuality?: number;
  mentalClarity?: number;
  intimacyActivities: IntimacyEntry[];
  activities: Activity[];
  note?: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  type: 'mood' | 'activity' | 'intimacy' | 'sleep' | 'clarity';
  data: any;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

export interface JournalEntry {
  id?: number;
  user_id?: string;
  template_id: string;
  responses: string[];
  triggers?: string[];
  created_at?: string;
}