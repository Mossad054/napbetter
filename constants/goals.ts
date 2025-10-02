import { Goal } from '@/types/mood';

export const PRESET_GOALS: Omit<Goal, 'id' | 'currentStreak' | 'isActive' | 'createdAt' | 'completedDates'>[] = [
  {
    title: 'Get Fit',
    description: 'Exercise regularly to improve your physical health',
    type: 'preset',
    category: 'fitness',
    targetDays: 30,
  },
  {
    title: 'Build Habits',
    description: 'Establish positive daily routines',
    type: 'preset',
    category: 'habits',
    targetDays: 21,
  },
  {
    title: 'Live Healthier',
    description: 'Make healthier lifestyle choices',
    type: 'preset',
    category: 'health',
    targetDays: 30,
  },
  {
    title: 'Self Growth',
    description: 'Focus on personal development and learning',
    type: 'preset',
    category: 'growth',
    targetDays: 30,
  },
  {
    title: 'Reduce Anxiety',
    description: 'Practice mindfulness and stress management',
    type: 'preset',
    category: 'anxiety',
    targetDays: 21,
  },
  {
    title: 'Break Bad Habits',
    description: 'Eliminate negative behaviors from your life',
    type: 'preset',
    category: 'habits',
    targetDays: 30,
  },
  {
    title: 'Happy Love Life',
    description: 'Improve relationships and emotional connections',
    type: 'preset',
    category: 'relationships',
    targetDays: 30,
  },
];

export const CHALLENGE_GOALS: Omit<Goal, 'id' | 'currentStreak' | 'isActive' | 'createdAt' | 'completedDates'>[] = [
  {
    title: '7-Day Sleep Challenge',
    description: 'Sleep for 8 hours every night for a week',
    type: 'preset',
    category: 'health',
    targetDays: 7,
  },
  {
    title: '30-Day Mood Tracking',
    description: 'Track your mood every day for a month',
    type: 'preset',
    category: 'habits',
    targetDays: 30,
  },
  {
    title: '14-Day Exercise Streak',
    description: 'Exercise every day for two weeks',
    type: 'preset',
    category: 'fitness',
    targetDays: 14,
  },
  {
    title: '21-Day Meditation',
    description: 'Meditate daily for three weeks',
    type: 'preset',
    category: 'anxiety',
    targetDays: 21,
  },
];

export function generateGoalId(): string {
  return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createGoalFromPreset(preset: typeof PRESET_GOALS[0]): Goal {
  return {
    ...preset,
    id: generateGoalId(),
    currentStreak: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    completedDates: [],
  };
}