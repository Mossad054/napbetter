import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserHabit } from '@/types/habits';

interface UseHabitsReturn {
  habits: UserHabit[];
  addHabit: (habit: Omit<UserHabit, 'id' | 'streak' | 'isCompletedToday' | 'lastCompleted'>) => Promise<void>;
  completeHabit: (habitId: string, feedback?: 'good' | 'neutral' | 'bad') => Promise<void>;
  undoHabitCompletion: (habitId: string) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<UserHabit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  isHabitCompletedToday: (habitId: string) => boolean;
}

const HABITS_STORAGE_KEY = 'user_habits';

export const useHabits = (): UseHabitsReturn => {
  const [habits, setHabits] = useState<UserHabit[]>([]);

  // Load habits from storage on mount
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const habitsJson = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      if (habitsJson) {
        const parsedHabits = JSON.parse(habitsJson);
        setHabits(parsedHabits);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const saveHabits = async (habitsToSave: UserHabit[]) => {
    try {
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habitsToSave));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  const addHabit = async (habit: Omit<UserHabit, 'id' | 'streak' | 'isCompletedToday' | 'lastCompleted'>) => {
    try {
      const newHabit: UserHabit = {
        ...habit,
        id: Date.now().toString(),
        streak: 0,
        isCompletedToday: false,
        createdAt: new Date().toISOString().split('T')[0],
      };

      const updatedHabits = [...habits, newHabit];
      setHabits(updatedHabits);
      await saveHabits(updatedHabits);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const completeHabit = async (habitId: string, feedback?: 'good' | 'neutral' | 'bad') => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const updatedHabits = habits.map(habit => {
        if (habit.id === habitId) {
          const wasCompletedToday = habit.isCompletedToday;
          const isNewDay = habit.lastCompleted !== today;
          
          // Update streak logic
          let newStreak = habit.streak;
          if (!wasCompletedToday && isNewDay) {
            newStreak = habit.streak + 1;
          }
          
          return {
            ...habit,
            isCompletedToday: true,
            lastCompleted: today,
            streak: newStreak,
            lastFeedback: feedback,
            lastFeedbackAt: feedback ? new Date().toISOString() : habit.lastFeedbackAt,
          };
        }
        return habit;
      });

      setHabits(updatedHabits);
      await saveHabits(updatedHabits);
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const undoHabitCompletion = async (habitId: string) => {
    try {
      const updatedHabits = habits.map(habit => {
        if (habit.id === habitId) {
          return {
            ...habit,
            isCompletedToday: false,
            streak: Math.max(0, habit.streak - 1), // Decrease streak when undoing
          };
        }
        return habit;
      });

      setHabits(updatedHabits);
      await saveHabits(updatedHabits);
    } catch (error) {
      console.error('Error undoing habit completion:', error);
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<UserHabit>) => {
    try {
      const updatedHabits = habits.map(habit => 
        habit.id === habitId ? { ...habit, ...updates } : habit
      );

      setHabits(updatedHabits);
      await saveHabits(updatedHabits);
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const updatedHabits = habits.filter(habit => habit.id !== habitId);
      setHabits(updatedHabits);
      await saveHabits(updatedHabits);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const isHabitCompletedToday = (habitId: string): boolean => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return habit.isCompletedToday && habit.lastCompleted === today;
  };

  return {
    habits,
    addHabit,
    completeHabit,
    undoHabitCompletion,
    updateHabit,
    deleteHabit,
    isHabitCompletedToday,
  };
};