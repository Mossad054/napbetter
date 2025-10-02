export interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'sleep' | 'mood' | 'anxiety' | 'productivity' | 'mentalClarity' | 'intimacy' | 'health';
  frequency: 'daily' | 'weekly' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard';
  evidenceBased: boolean;
  createdAt: string;
}

export const HABIT_LIBRARY: Habit[] = [
  // Sleep habits
  {
    id: 'sleep_1',
    title: 'Go to bed at the same time every day',
    description: 'Maintain a consistent sleep schedule to regulate your circadian rhythm',
    category: 'sleep',
    frequency: 'daily',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'sleep_2',
    title: 'Create a bedtime routine',
    description: 'Wind down with calming activities 30 minutes before sleep',
    category: 'sleep',
    frequency: 'daily',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'sleep_3',
    title: 'Keep bedroom cool and dark',
    description: 'Maintain optimal sleep environment (65-68°F, blackout curtains)',
    category: 'sleep',
    frequency: 'daily',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'sleep_4',
    title: 'Screen-free hour before bed',
    description: 'Avoid blue light exposure to promote natural melatonin production',
    category: 'sleep',
    frequency: 'daily',
    difficulty: 'hard',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'sleep_5',
    title: 'Limit caffeine after 2 PM',
    description: 'Avoid caffeine at least 6 hours before bedtime',
    category: 'sleep',
    frequency: 'daily',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },

  // Mood habits
  {
    id: 'mood_1',
    title: 'Write down 3 good things about your day',
    description: 'Practice gratitude to boost positive emotions',
    category: 'mood',
    frequency: 'daily',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'mood_2',
    title: 'Spend time in nature',
    description: 'Get outside for at least 10 minutes daily',
    category: 'mood',
    frequency: 'daily',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'mood_3',
    title: 'Connect with a friend or loved one',
    description: 'Maintain social connections for emotional well-being',
    category: 'mood',
    frequency: 'daily',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'mood_4',
    title: 'Practice self-compassion',
    description: 'Speak to yourself kindly, especially during difficult times',
    category: 'mood',
    frequency: 'daily',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'mood_5',
    title: 'Engage in creative activity',
    description: 'Express yourself through art, music, writing, or other creative outlets',
    category: 'mood',
    frequency: 'weekly',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },

  // Anxiety habits
  {
    id: 'anxiety_1',
    title: 'Try box breathing before meetings',
    description: 'Inhale for 4, hold for 4, exhale for 4, hold for 4',
    category: 'anxiety',
    frequency: 'custom',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'anxiety_2',
    title: 'Take 10-min walk at 6pm',
    description: 'Physical activity helps reduce stress hormones',
    category: 'anxiety',
    frequency: 'daily',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'anxiety_3',
    title: 'Practice progressive muscle relaxation',
    description: 'Tense and release muscle groups to reduce physical tension',
    category: 'anxiety',
    frequency: 'weekly',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'anxiety_4',
    title: 'Limit news consumption',
    description: 'Set specific times for checking news to avoid information overload',
    category: 'anxiety',
    frequency: 'daily',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'anxiety_5',
    title: 'Write down worries',
    description: 'Externalize anxious thoughts to reduce mental burden',
    category: 'anxiety',
    frequency: 'custom',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },

  // Productivity habits
  {
    id: 'productivity_1',
    title: 'Plan your day the night before',
    description: 'Set 3 priorities for the next day',
    category: 'productivity',
    frequency: 'daily',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'productivity_2',
    title: 'Use time-blocking technique',
    description: 'Schedule specific time slots for different tasks',
    category: 'productivity',
    frequency: 'daily',
    difficulty: 'hard',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'productivity_3',
    title: 'Take 5-minute breaks every hour',
    description: 'Prevent mental fatigue with regular micro-breaks',
    category: 'productivity',
    frequency: 'daily',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },

  // Mental clarity habits
  {
    id: 'clarity_1',
    title: 'Do 2 mins of journaling in the morning',
    description: 'Clear your mind with a morning brain dump',
    category: 'mentalClarity',
    frequency: 'daily',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'clarity_2',
    title: '5-minute morning breathing exercise',
    description: 'Start your day with focused breathing to improve mental clarity',
    category: 'mentalClarity',
    frequency: 'daily',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'clarity_3',
    title: 'Single-task for 30 minutes',
    description: 'Focus on one task without multitasking',
    category: 'mentalClarity',
    frequency: 'daily',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },

  // Intimacy habits
  {
    id: 'intimacy_1',
    title: 'Schedule intimate time',
    description: 'Set aside dedicated time for connection with yourself or partner',
    category: 'intimacy',
    frequency: 'weekly',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'intimacy_2',
    title: 'Practice self-care rituals',
    description: 'Engage in activities that make you feel good about yourself',
    category: 'intimacy',
    frequency: 'daily',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },

  // Health habits
  {
    id: 'health_1',
    title: 'Drink water first thing in the morning',
    description: 'Rehydrate after sleep to kickstart metabolism',
    category: 'health',
    frequency: 'daily',
    difficulty: 'easy',
    evidenceBased: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'health_2',
    title: 'Eat a vegetable with every meal',
    description: 'Increase nutrient intake and fiber consumption',
    category: 'health',
    frequency: 'daily',
    difficulty: 'medium',
    evidenceBased: true,
    createdAt: '2025-01-01'
  }
];