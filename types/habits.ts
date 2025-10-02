import { Habit } from '@/constants/habits';

export interface UserHabit extends Habit {
  isCompletedToday: boolean;
  streak: number;
  lastCompleted?: string;
  feedback?: 'positive' | 'negative' | null;
  notes?: string;
  notificationsEnabled: boolean;
  createdAt: string;
  lastFeedbackAt?: string;
}