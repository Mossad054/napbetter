import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserHabit } from '@/types/habits';

const HABITS_STORAGE_KEY = 'user_habits';
const HABIT_FEEDBACK_STORAGE_KEY = 'habit_feedback';

export class HabitService {
  // Save user habits to AsyncStorage
  static async saveUserHabits(habits: UserHabit[]): Promise<void> {
    try {
      const habitsJson = JSON.stringify(habits);
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, habitsJson);
    } catch (error) {
      console.error('Error saving habits to storage:', error);
      throw error;
    }
  }

  // Load user habits from AsyncStorage
  static async loadUserHabits(): Promise<UserHabit[]> {
    try {
      const habitsJson = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      if (habitsJson) {
        return JSON.parse(habitsJson);
      }
      return [];
    } catch (error) {
      console.error('Error loading habits from storage:', error);
      return [];
    }
  }

  // Save habit feedback to AsyncStorage
  static async saveHabitFeedback(habitId: string, feedback: 'positive' | 'negative', notes?: string): Promise<void> {
    try {
      const feedbackData = {
        habitId,
        feedback,
        notes,
        timestamp: new Date().toISOString()
      };
      
      // Get existing feedback
      const existingFeedbackJson = await AsyncStorage.getItem(HABIT_FEEDBACK_STORAGE_KEY);
      let feedbackArray = existingFeedbackJson ? JSON.parse(existingFeedbackJson) : [];
      
      // Add new feedback
      feedbackArray.push(feedbackData);
      
      // Save updated feedback
      await AsyncStorage.setItem(HABIT_FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackArray));
    } catch (error) {
      console.error('Error saving habit feedback:', error);
      throw error;
    }
  }

  // Load habit feedback from AsyncStorage
  static async loadHabitFeedback(): Promise<any[]> {
    try {
      const feedbackJson = await AsyncStorage.getItem(HABIT_FEEDBACK_STORAGE_KEY);
      if (feedbackJson) {
        return JSON.parse(feedbackJson);
      }
      return [];
    } catch (error) {
      console.error('Error loading habit feedback:', error);
      return [];
    }
  }

  // Get feedback for a specific habit
  static async getHabitFeedback(habitId: string): Promise<any[]> {
    try {
      const allFeedback = await this.loadHabitFeedback();
      return allFeedback.filter(feedback => feedback.habitId === habitId);
    } catch (error) {
      console.error('Error getting habit feedback:', error);
      return [];
    }
  }

  // Calculate habit effectiveness based on feedback
  static async calculateHabitEffectiveness(habitId: string): Promise<{ 
    effectiveness: number; 
    totalFeedback: number; 
    positiveFeedback: number; 
    negativeFeedback: number 
  }> {
    try {
      const feedback = await this.getHabitFeedback(habitId);
      
      if (feedback.length === 0) {
        return {
          effectiveness: 0,
          totalFeedback: 0,
          positiveFeedback: 0,
          negativeFeedback: 0
        };
      }
      
      const positiveFeedback = feedback.filter(f => f.feedback === 'positive').length;
      const negativeFeedback = feedback.filter(f => f.feedback === 'negative').length;
      
      const effectiveness = (positiveFeedback / feedback.length) * 100;
      
      return {
        effectiveness,
        totalFeedback: feedback.length,
        positiveFeedback,
        negativeFeedback
      };
    } catch (error) {
      console.error('Error calculating habit effectiveness:', error);
      return {
        effectiveness: 0,
        totalFeedback: 0,
        positiveFeedback: 0,
        negativeFeedback: 0
      };
    }
  }
}