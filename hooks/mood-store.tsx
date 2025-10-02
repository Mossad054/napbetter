import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { Activity, MoodEntry, DayEntry, Mood, SleepEntry, IntimacyEntry } from '@/types/mood';
import { MOODS, getMoodById } from '@/constants/moods';
import { supabaseService } from '@/database/supabase-service';

// Define sleep data that can be passed to addMoodEntry
interface SleepData {
  quality?: number;
  duration?: number;
  bedtime?: string;
  wakeTime?: string;
}

interface MoodContextType {
  entries: MoodEntry[];
  activities: Activity[];
  isLoading: boolean;
  addMoodEntry: (
    moodId: number, 
    activityIds: number[], 
    note?: string, 
    date?: string,
    sleepData?: SleepData
  ) => Promise<void>;
  addIntimacyEntry: (entry: Omit<IntimacyEntry, 'id' | 'createdAt'>) => Promise<void>;
  getEntryForDate: (date: string) => Promise<DayEntry | null>;
  getIntimacyEntryForDate: (date: string) => Promise<IntimacyEntry | null>;
  getIntimacyEntries: () => Promise<IntimacyEntry[]>;
  getSleepEntries: () => Promise<SleepEntry[]>;
  getMoodStats: () => {
    totalEntries: number;
    averageMood: number;
    moodCounts: Record<number, number>;
  };
  loadData: () => Promise<void>;
  user: any;
  isAuthenticated: boolean;
  exportAllUserData: () => Promise<any>;
  deleteAllUserData: () => Promise<void>;
}

const MoodContext = createContext<MoodContextType | null>(null);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();

  const loadData = useCallback(async () => {
    try {
      console.log('Loading mood data...');
      
      if (!user?.id) {
        console.log('No user found, skipping data load');
        setIsLoading(false);
        return;
      }

      await supabaseService.initDatabase(user.id);
      const moodEntries = await supabaseService.getMoodEntries();
      const activitiesData = await supabaseService.getActivities();
      
      setEntries(moodEntries);
      setActivities(activitiesData);
      console.log(`Loaded ${moodEntries.length} entries and ${activitiesData.length} activities`);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isLoaded) {
      loadData();
    }
  }, [loadData, isLoaded]);

  const addMoodEntry = useCallback(async (
    moodId: number, 
    activityIds: number[], 
    note?: string, 
    date?: string,
    sleepData?: SleepData
  ) => {
    try {
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      const entryDate = date || new Date().toISOString().split('T')[0];
      
      // Validate and sanitize note
      const sanitizedNote = note?.trim();
      if (sanitizedNote && sanitizedNote.length > 500) {
        console.warn('Note too long, truncating');
        return;
      }
      
      // Delete existing entry for this date if it exists
      const existingEntry = await supabaseService.getMoodEntryForDate(entryDate);
      if (existingEntry) {
        await supabaseService.deleteMoodEntry(existingEntry.id);
      }
      
      const entryId = await supabaseService.insertMoodEntry(moodId, entryDate, sanitizedNote);
      
      // Insert activities
      for (const activityId of activityIds) {
        await supabaseService.insertEntryActivity(entryId, activityId);
      }
      
      // Save sleep data if provided
      if (sleepData) {
        await supabaseService.saveSleepEntry({
          date: entryDate,
          quality: sleepData.quality || 0,
          duration: sleepData.duration,
          bedtime: sleepData.bedtime,
          wakeTime: sleepData.wakeTime
        });
      }
      
      // Reload data
      await loadData();
      console.log('Mood entry added successfully');
    } catch (error) {
      console.error('Error adding mood entry:', error);
    }
  }, [loadData, user?.id]);

  const addIntimacyEntry = useCallback(async (entry: Omit<IntimacyEntry, 'id' | 'createdAt'>) => {
    try {
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }

      // Check if an intimacy entry already exists for this date
      const existingEntry = await supabaseService.getIntimacyEntryForDate(entry.date);
      
      if (existingEntry && existingEntry.id) {
        // Update existing entry
        await supabaseService.updateIntimacyEntry(existingEntry.id, entry);
      } else {
        // Insert new entry
        await supabaseService.insertIntimacyEntry(entry);
      }
      
      console.log('Intimacy entry saved successfully');
    } catch (error) {
      console.error('Error saving intimacy entry:', error);
    }
  }, [user?.id]);

  const getEntryForDate = useCallback(async (date: string): Promise<DayEntry | null> => {
    const entry = entries.find(e => e.date === date);
    if (!entry) return null;

    const mood = getMoodById(entry.moodId);
    if (!mood) return null;

    const activityIds = await supabaseService.getEntryActivities(entry.id);
    const entryActivities = activities.filter(a => activityIds.includes(a.id));

    return {
      mood,
      activities: entryActivities,
      note: entry.note,
      date: entry.date,
    };
  }, [entries, activities]);

  const getIntimacyEntryForDate = useCallback(async (date: string): Promise<IntimacyEntry | null> => {
    if (!user?.id) return null;
    return await supabaseService.getIntimacyEntryForDate(date);
  }, [user?.id]);

  const getIntimacyEntries = useCallback(async (): Promise<IntimacyEntry[]> => {
    if (!user?.id) return [];
    return await supabaseService.getIntimacyEntries();
  }, [user?.id]);

  const getSleepEntries = useCallback(async (): Promise<SleepEntry[]> => {
    if (!user?.id) return [];
    return await supabaseService.getSleepEntries();
  }, [user?.id]);

  // New methods for data export and privacy
  const exportAllUserData = useCallback(async (): Promise<any> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    return await supabaseService.exportAllUserData();
  }, [user?.id]);

  const deleteAllUserData = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    return await supabaseService.deleteAllUserData();
  }, [user?.id]);

  // Add getMoodStats method
  const getMoodStats = useCallback(() => {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        moodCounts: {}
      };
    }

    const totalEntries = entries.length;
    const moodSum = entries.reduce((sum, entry) => sum + entry.moodId, 0);
    const averageMood = totalEntries > 0 ? moodSum / totalEntries : 0;
    
    const moodCounts: Record<number, number> = {};
    entries.forEach(entry => {
      moodCounts[entry.moodId] = (moodCounts[entry.moodId] || 0) + 1;
    });
    
    return {
      totalEntries,
      averageMood,
      moodCounts
    };
  }, [entries]);

  // Fix: Return JSX element with Provider, not just the context value
  return (
    <MoodContext.Provider
      value={{
        entries,
        activities,
        isLoading,
        addMoodEntry,
        addIntimacyEntry,
        getEntryForDate,
        getIntimacyEntryForDate,
        getIntimacyEntries,
        getSleepEntries,
        getMoodStats,
        loadData,
        user,
        isAuthenticated: !!user,
        exportAllUserData,
        deleteAllUserData
      }}
    >
      {children}
    </MoodContext.Provider>
  );
}

export function useMoodStore() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMoodStore must be used within a MoodProvider');
  }
  return context;
}