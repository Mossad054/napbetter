import { supabase, SupabaseMoodEntry, SupabaseActivity, SupabaseEntryActivity, SupabaseIntimacyEntry, SupabaseSleepEntry, SupabaseJournalEntry } from '@/lib/supabase';
import { MoodEntry, Activity, MentalClarityTest, SleepEntry, JournalEntry } from '@/types/mood';
import { DEFAULT_ACTIVITIES } from '@/constants/activities';

// Define the intimacy entry type
interface IntimacyEntry {
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

export class SupabaseService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  async initDatabase(userId: string): Promise<void> {
    try {
      this.setUserId(userId);
      console.log('Initializing Supabase database for user:', userId);

      // Check if default activities exist for this user
      const { data: existingActivities, error } = await supabase
        .from('activities')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Error checking activities:', error);
        return;
      }

      // Insert default activities if none exist
      if (!existingActivities || existingActivities.length === 0) {
        console.log('Inserting default activities...');
        const activitiesData = DEFAULT_ACTIVITIES.map(activity => ({
          name: activity.name,
          icon: activity.icon,
          category: activity.category,
          is_good: activity.isGood,
        }));

        const { error: insertError } = await supabase
          .from('activities')
          .insert(activitiesData);

        if (insertError) {
          console.error('Error inserting default activities:', insertError);
        } else {
          console.log('Default activities inserted successfully');
        }
      }

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async insertMoodEntry(moodId: number, date: string, note?: string): Promise<number> {
    try {
      if (!this.userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: this.userId,
          mood_id: moodId,
          date,
          note: note || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting mood entry:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error inserting mood entry:', error);
      throw error;
    }
  }

  async insertEntryActivity(entryId: number, activityId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('entry_activities')
        .insert({
          entry_id: entryId,
          activity_id: activityId,
        });

      if (error) {
        console.error('Error inserting entry activity:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error inserting entry activity:', error);
      throw error;
    }
  }

  async getMoodEntries(): Promise<MoodEntry[]> {
    try {
      if (!this.userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching mood entries:', error);
        return [];
      }

      return data.map((entry: SupabaseMoodEntry) => ({
        id: entry.id,
        moodId: entry.mood_id,
        date: entry.date,
        note: entry.note,
        createdAt: entry.created_at,
      }));
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      return [];
    }
  }

  async getActivities(): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      return data.map((activity: SupabaseActivity) => ({
        id: activity.id,
        name: activity.name,
        icon: activity.icon,
        category: activity.category,
        isGood: activity.is_good,
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  async getEntryActivities(entryId: number): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('entry_activities')
        .select('activity_id')
        .eq('entry_id', entryId);

      if (error) {
        console.error('Error fetching entry activities:', error);
        return [];
      }

      return data.map((item: { activity_id: number }) => item.activity_id);
    } catch (error) {
      console.error('Error fetching entry activities:', error);
      return [];
    }
  }

  async getMoodEntryForDate(date: string): Promise<MoodEntry | null> {
    try {
      if (!this.userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', this.userId)
        .eq('date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching mood entry for date:', error);
        return null;
      }

      return {
        id: data.id,
        moodId: data.mood_id,
        date: data.date,
        note: data.note,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error fetching mood entry for date:', error);
      return null;
    }
  }

  async deleteMoodEntry(id: number): Promise<void> {
    try {
      // Delete entry activities first
      const { error: entryActivitiesError } = await supabase
        .from('entry_activities')
        .delete()
        .eq('entry_id', id);

      if (entryActivitiesError) {
        console.error('Error deleting entry activities:', entryActivitiesError);
      }

      // Delete mood entry
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting mood entry:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      throw error;
    }
  }

  // Mental Clarity Test methods
  async insertMentalClarityTest(
    score: number,
    reactionTimes: number[],
    accuracy: number,
    testDuration: number
  ): Promise<string> {
    try {
      if (!this.userId) {
        throw new Error('User not authenticated');
      }

      const testDate = new Date().toISOString().split('T')[0];
      const avgReactionTime = reactionTimes.length > 0 
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
        : 0;

      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .insert({
          user_id: this.userId,
          date: testDate,
          score,
          test_type: 'focus',
          duration: testDuration,
          reaction_times: reactionTimes,
          average_reaction_time: avgReactionTime,
          accuracy,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting mental clarity test:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error inserting mental clarity test:', error);
      throw error;
    }
  }

  async getMentalClarityTests(): Promise<MentalClarityTest[]> {
    try {
      if (!this.userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mental clarity tests:', error);
        return [];
      }

      return data.map((test: any) => ({
        id: test.id,
        date: test.date,
        score: test.score,
        testType: test.test_type,
        duration: test.duration,
      }));
    } catch (error) {
      console.error('Error fetching mental clarity tests:', error);
      return [];
    }
  }

  async getMentalClarityTestForDate(date: string): Promise<MentalClarityTest | null> {
    try {
      if (!this.userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .select('*')
        .eq('user_id', this.userId)
        .eq('date', date)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching mental clarity test for date:', error);
        return null;
      }

      return {
        id: data.id,
        date: data.date,
        score: data.score,
        testType: data.test_type,
        duration: data.duration,
      };
    } catch (error) {
      console.error('Error fetching mental clarity test for date:', error);
      return null;
    }
  }

  // Intimacy tracking methods
  async insertIntimacyEntry(entry: Omit<IntimacyEntry, 'id' | 'createdAt'>): Promise<number> {
    try {
      if (!this.userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('intimacy_entries')
        .insert({
          user_id: this.userId,
          date: entry.date,
          type: entry.type,
          orgasmed: entry.orgasmed,
          place: entry.place,
          toys: entry.toys,
          time_to_sleep: entry.timeToSleep,
          mood_before: entry.moodBefore,
          mood_after: entry.moodAfter,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting intimacy entry:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error inserting intimacy entry:', error);
      throw error;
    }
  }

  async getIntimacyEntries(): Promise<IntimacyEntry[]> {
    try {
      if (!this.userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('intimacy_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching intimacy entries:', error);
        return [];
      }

      return data.map((entry: SupabaseIntimacyEntry) => ({
        id: entry.id,
        date: entry.date,
        type: entry.type,
        orgasmed: entry.orgasmed,
        place: entry.place,
        toys: entry.toys,
        timeToSleep: entry.time_to_sleep,
        moodBefore: entry.mood_before,
        moodAfter: entry.mood_after,
        createdAt: entry.created_at,
      }));
    } catch (error) {
      console.error('Error fetching intimacy entries:', error);
      return [];
    }
  }

  async getIntimacyEntryForDate(date: string): Promise<IntimacyEntry | null> {
    try {
      if (!this.userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('intimacy_entries')
        .select('*')
        .eq('user_id', this.userId)
        .eq('date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching intimacy entry for date:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        date: data.date,
        type: data.type,
        orgasmed: data.orgasmed,
        place: data.place,
        toys: data.toys,
        timeToSleep: data.time_to_sleep,
        moodBefore: data.mood_before,
        moodAfter: data.mood_after,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error fetching intimacy entry for date:', error);
      return null;
    }
  }

  async updateIntimacyEntry(id: number, entry: Partial<IntimacyEntry>): Promise<void> {
    try {
      const { error } = await supabase
        .from('intimacy_entries')
        .update({
          type: entry.type,
          orgasmed: entry.orgasmed,
          place: entry.place,
          toys: entry.toys,
          time_to_sleep: entry.timeToSleep,
          mood_before: entry.moodBefore,
          mood_after: entry.moodAfter,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating intimacy entry:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating intimacy entry:', error);
      throw error;
    }
  }

  async deleteIntimacyEntry(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('intimacy_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting intimacy entry:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting intimacy entry:', error);
      throw error;
    }
  }

  // Sleep tracking methods
  async saveSleepEntry(sleepEntry: Omit<SleepEntry, 'id'>): Promise<void> {
    try {
      if (!this.userId) {
        throw new Error('User not authenticated');
      }

      // Check if a sleep entry already exists for this date
      const existingEntry = await this.getSleepEntryForDate(sleepEntry.date);
      
      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('sleep_entries')
          .update({
            quality: sleepEntry.quality,
            duration: sleepEntry.duration,
            bedtime: sleepEntry.bedtime,
            wake_time: sleepEntry.wakeTime,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingEntry.id)
          .eq('user_id', this.userId);

        if (error) {
          console.error('Error updating sleep entry:', error);
          throw error;
        }
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('sleep_entries')
          .insert({
            user_id: this.userId,
            date: sleepEntry.date,
            quality: sleepEntry.quality,
            duration: sleepEntry.duration,
            bedtime: sleepEntry.bedtime,
            wake_time: sleepEntry.wakeTime,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error inserting sleep entry:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error saving sleep entry:', error);
      throw error;
    }
  }

  async getSleepEntryForDate(date: string): Promise<SleepEntry | null> {
    try {
      if (!this.userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', this.userId)
        .eq('date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching sleep entry for date:', error);
        return null;
      }

      return {
        id: data.id,
        date: data.date,
        quality: data.quality,
        duration: data.duration,
        bedtime: data.bedtime,
        wakeTime: data.wake_time,
      };
    } catch (error) {
      console.error('Error fetching sleep entry for date:', error);
      return null;
    }
  }

  async getSleepEntries(): Promise<SleepEntry[]> {
    try {
      if (!this.userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching sleep entries:', error);
        return [];
      }

      return data.map((entry: any) => ({
        id: entry.id,
        date: entry.date,
        quality: entry.quality,
        duration: entry.duration,
        bedtime: entry.bedtime,
        wakeTime: entry.wake_time,
      }));
    } catch (error) {
      console.error('Error fetching sleep entries:', error);
      return [];
    }
  }

  // Journal entry methods
  async insertJournalEntry(entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>): Promise<number> {
    try {
      if (!this.userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: this.userId,
          template_id: entry.template_id,
          responses: entry.responses,
          triggers: entry.triggers || [],
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting journal entry:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error inserting journal entry:', error);
      throw error;
    }
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      if (!this.userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching journal entries:', error);
        return [];
      }

      return data.map((entry: any) => ({
        id: entry.id,
        user_id: entry.user_id,
        template_id: entry.template_id,
        responses: entry.responses,
        triggers: entry.triggers,
        created_at: entry.created_at,
      }));
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }
  }

  async getJournalEntryById(id: number): Promise<JournalEntry | null> {
    try {
      if (!this.userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', this.userId)
        .single();

      if (error) {
        console.error('Error fetching journal entry:', error);
        return null;
      }

      return {
        id: data.id,
        user_id: data.user_id,
        template_id: data.template_id,
        responses: data.responses,
        triggers: data.triggers,
        created_at: data.created_at,
      };
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      return null;
    }
  }

  // New method to insert AI analysis results
  async insertAIAnalysis(analysis: any): Promise<number> {
    try {
      if (!this.userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('ai_analysis')
        .insert({
          user_id: this.userId,
          journal_entry_id: analysis.journal_entry_id,
          sentiment: analysis.sentiment,
          patterns: analysis.patterns,
          intensity: analysis.intensity,
          suggestions: analysis.suggestions,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting AI analysis:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error inserting AI analysis:', error);
      throw error;
    }
  }

  // New method to get AI analysis for a journal entry
  async getAIAnalysisForEntry(journalEntryId: number): Promise<any | null> {
    try {
      if (!this.userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('journal_entry_id', journalEntryId)
        .eq('user_id', this.userId)
        .single();

      if (error) {
        console.error('Error fetching AI analysis:', error);
        return null;
      }

      return {
        id: data.id,
        user_id: data.user_id,
        journal_entry_id: data.journal_entry_id,
        sentiment: data.sentiment,
        patterns: data.patterns,
        intensity: data.intensity,
        suggestions: data.suggestions,
        created_at: data.created_at,
      };
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      return null;
    }
  }

  // New method to export all user data
  async exportAllUserData(): Promise<any> {
    try {
      if (!this.userId) {
        throw new Error('User not authenticated');
      }

      // Fetch all user data in parallel
      const [
        moodEntries,
        activities,
        intimacyEntries,
        sleepEntries,
        mentalClarityTests,
        journalEntries,
        aiAnalysis
      ] = await Promise.all([
        this.getMoodEntries(),
        this.getActivities(),
        this.getIntimacyEntries(),
        this.getSleepEntries(),
        this.getMentalClarityTests(),
        this.getJournalEntries(),
        this.getAllAIAnalysis()
      ]);

      return {
        exportedAt: new Date().toISOString(),
        userId: this.userId,
        moodEntries,
        activities,
        intimacyEntries,
        sleepEntries,
        mentalClarityTests,
        journalEntries,
        aiAnalysis
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Helper method to get all AI analysis
  private async getAllAIAnalysis(): Promise<any[]> {
    try {
      if (!this.userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('user_id', this.userId);

      if (error) {
        console.error('Error fetching AI analysis:', error);
        return [];
      }

      return data.map((analysis: any) => ({
        id: analysis.id,
        user_id: analysis.user_id,
        journal_entry_id: analysis.journal_entry_id,
        sentiment: analysis.sentiment,
        patterns: analysis.patterns,
        intensity: analysis.intensity,
        suggestions: analysis.suggestions,
        created_at: analysis.created_at,
      }));
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      return [];
    }
  }

  // New method to delete all user data (with confirmation)
  async deleteAllUserData(): Promise<void> {
    try {
      if (!this.userId) {
        throw new Error('User not authenticated');
      }

      // Delete data from all tables in the correct order (due to foreign key constraints)
      const tables = [
        'entry_activities',
        'mood_entries',
        'intimacy_entries',
        'sleep_entries',
        'mental_clarity_tests',
        'ai_analysis',
        'journal_entries'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', this.userId);

        if (error) {
          console.error(`Error deleting data from ${table}:`, error);
          throw error;
        }
      }

      console.log('All user data deleted successfully');
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();