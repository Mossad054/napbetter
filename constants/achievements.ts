import { Achievement } from '@/types/mood';

export const ACHIEVEMENTS: Achievement[] = [
  // Mood achievements
  {
    id: 'first_entry',
    title: 'First Steps',
    description: 'Log your first mood entry',
    icon: '🎯',
    isUnlocked: false,
    category: 'mood',
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Track your mood for 7 consecutive days',
    icon: '🔥',
    isUnlocked: false,
    category: 'streak',
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Track your mood for 30 consecutive days',
    icon: '👑',
    isUnlocked: false,
    category: 'streak',
  },
  {
    id: 'happy_week',
    title: 'Happy Week',
    description: 'Have 7 consecutive days of good or excellent mood',
    icon: '😊',
    isUnlocked: false,
    category: 'mood',
  },
  {
    id: 'activity_explorer',
    title: 'Activity Explorer',
    description: 'Try 10 different activities',
    icon: '🌟',
    isUnlocked: false,
    category: 'activities',
  },
  {
    id: 'sleep_champion',
    title: 'Sleep Champion',
    description: 'Maintain good sleep quality for 14 days',
    icon: '😴',
    isUnlocked: false,
    category: 'mood',
  },
  {
    id: 'clarity_master',
    title: 'Clarity Master',
    description: 'Complete 20 mental clarity tests',
    icon: '🧠',
    isUnlocked: false,
    category: 'mood',
  },
  {
    id: 'goal_achiever',
    title: 'Goal Achiever',
    description: 'Complete your first goal',
    icon: '🏆',
    isUnlocked: false,
    category: 'goals',
  },
  {
    id: 'habit_builder',
    title: 'Habit Builder',
    description: 'Complete 3 different goals',
    icon: '🔨',
    isUnlocked: false,
    category: 'goals',
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Track mood for 100 consecutive days',
    icon: '💎',
    isUnlocked: false,
    category: 'streak',
  },
];

export function checkAchievements(
  moodEntries: number,
  consecutiveDays: number,
  activitiesCount: number,
  goalsCompleted: number,
  clarityTests: number,
  goodSleepDays: number
): Achievement[] {
  const unlockedAchievements: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    let shouldUnlock = false;

    switch (achievement.id) {
      case 'first_entry':
        shouldUnlock = moodEntries >= 1;
        break;
      case 'week_streak':
        shouldUnlock = consecutiveDays >= 7;
        break;
      case 'month_streak':
        shouldUnlock = consecutiveDays >= 30;
        break;
      case 'activity_explorer':
        shouldUnlock = activitiesCount >= 10;
        break;
      case 'sleep_champion':
        shouldUnlock = goodSleepDays >= 14;
        break;
      case 'clarity_master':
        shouldUnlock = clarityTests >= 20;
        break;
      case 'goal_achiever':
        shouldUnlock = goalsCompleted >= 1;
        break;
      case 'habit_builder':
        shouldUnlock = goalsCompleted >= 3;
        break;
      case 'consistency_king':
        shouldUnlock = consecutiveDays >= 100;
        break;
    }

    if (shouldUnlock && !achievement.isUnlocked) {
      unlockedAchievements.push({
        ...achievement,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      });
    }
  });

  return unlockedAchievements;
}