import { Platform } from 'react-native';
import { Activity, MoodEntry } from '@/types/mood';
import { DEFAULT_ACTIVITIES } from '@/constants/activities';

// Web-compatible storage interface
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

// Initialize storage based on platform
let storage: Storage;
try {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    storage = {
      async getItem(key: string): Promise<string | null> {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      async setItem(key: string, value: string): Promise<void> {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Ignore storage errors
        }
      },
    };
  } else {
    // Use fallback storage for now (instead of AsyncStorage)
    storage = {
      async getItem(): Promise<string | null> { return null; },
      async setItem(): Promise<void> { },
    };
  }
} catch (error) {
  console.warn('Storage initialization failed, using fallback:', error);
  // Fallback storage
  storage = {
    async getItem(): Promise<string | null> { return null; },
    async setItem(): Promise<void> { },
  };
}

let db: any = null;

// Initialize database based on platform
// TEMPORARILY DISABLED SQLite for web compatibility
db = null;
/*
try {
  if (Platform.OS !== 'web') {
    // Use dynamic import to avoid issues on web
    import('expo-sqlite').then((SQLite) => {
      db = SQLite.openDatabaseSync('daylio.db');
    }).catch(error => {
      console.warn('SQLite initialization failed:', error);
      db = null;
    });
  }
} catch (error) {
  console.warn('SQLite initialization failed:', error);
  db = null;
}
*/

export const initDatabase = async () => {
  console.log('Initializing database...');
  
  try {
    if (Platform.OS === 'web') {
      // Web: Initialize storage with default activities if needed
      const activities = await storage.getItem('activities');
      if (!activities) {
        console.log('Inserting default activities for web...');
        await storage.setItem('activities', JSON.stringify(DEFAULT_ACTIVITIES.map((activity, index) => ({
          id: index + 1,
          name: activity.name,
          icon: activity.icon,
          category: activity.category,
          isGood: activity.isGood
        }))));
      }
      
      // Initialize empty entries if needed
      const entries = await storage.getItem('mood_entries');
      if (!entries) {
        await storage.setItem('mood_entries', JSON.stringify([]));
      }
      
      const entryActivities = await storage.getItem('entry_activities');
      if (!entryActivities) {
        await storage.setItem('entry_activities', JSON.stringify([]));
      }
    } else {
      // Native: Use SQLite with enhanced error handling
      if (!db) {
        console.warn('Database not initialized, skipping database operations');
        return;
      }
      
      try {
        db.execSync(`
          CREATE TABLE IF NOT EXISTS mood_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mood_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            note TEXT,
            created_at TEXT NOT NULL
          );
        `);

        db.execSync(`
          CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT NOT NULL,
            category TEXT NOT NULL,
            is_good INTEGER NOT NULL
          );
        `);

        db.execSync(`
          CREATE TABLE IF NOT EXISTS entry_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            activity_id INTEGER NOT NULL,
            FOREIGN KEY (entry_id) REFERENCES mood_entries (id),
            FOREIGN KEY (activity_id) REFERENCES activities (id)
          );
        `);

        // Insert default activities if table is empty
        const activityCount = db.getFirstSync('SELECT COUNT(*) as count FROM activities') as { count: number };
        if (activityCount.count === 0) {
          console.log('Inserting default activities...');
          const stmt = db.prepareSync('INSERT INTO activities (name, icon, category, is_good) VALUES (?, ?, ?, ?)');
          
          DEFAULT_ACTIVITIES.forEach(activity => {
            stmt.executeSync([activity.name, activity.icon, activity.category, activity.isGood ? 1 : 0]);
          });
          
          stmt.finalizeSync();
        }
      } catch (sqlError) {
        console.error('SQLite operations failed:', sqlError);
        // Don't throw here, let the app continue with limited functionality
      }
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Don't throw here, let the app continue with limited functionality
  }

  console.log('Database initialization completed');
};

export const insertMoodEntry = async (moodId: number, date: string, note?: string): Promise<number> => {
  try {
    if (Platform.OS === 'web') {
      const entries = JSON.parse(await storage.getItem('mood_entries') || '[]');
      const newId = entries.length > 0 ? Math.max(...entries.map((e: any) => e.id)) + 1 : 1;
      const newEntry = {
        id: newId,
        mood_id: moodId,
        date,
        note: note || null,
        created_at: new Date().toISOString()
      };
      entries.push(newEntry);
      await storage.setItem('mood_entries', JSON.stringify(entries));
      return newId;
    } else {
      if (!db) {
        console.warn('Database not available, returning mock ID');
        return Date.now(); // Return a mock ID
      }
      
      const stmt = db.prepareSync('INSERT INTO mood_entries (mood_id, date, note, created_at) VALUES (?, ?, ?, ?)');
      const result = stmt.executeSync([moodId, date, note || null, new Date().toISOString()]);
      stmt.finalizeSync();
      return result.lastInsertRowId;
    }
  } catch (error) {
    console.error('Error inserting mood entry:', error);
    return Date.now(); // Return a mock ID as fallback
  }
};

export const insertEntryActivity = async (entryId: number, activityId: number) => {
  if (Platform.OS === 'web') {
    const entryActivities = JSON.parse(await storage.getItem('entry_activities') || '[]');
    const newId = entryActivities.length > 0 ? Math.max(...entryActivities.map((e: any) => e.id)) + 1 : 1;
    entryActivities.push({ id: newId, entry_id: entryId, activity_id: activityId });
    await storage.setItem('entry_activities', JSON.stringify(entryActivities));
  } else {
    const stmt = db.prepareSync('INSERT INTO entry_activities (entry_id, activity_id) VALUES (?, ?)');
    stmt.executeSync([entryId, activityId]);
    stmt.finalizeSync();
  }
};

export const getMoodEntries = async (): Promise<MoodEntry[]> => {
  if (Platform.OS === 'web') {
    const entries = JSON.parse(await storage.getItem('mood_entries') || '[]');
    return entries
      .map((row: any) => ({
        id: row.id,
        moodId: row.mood_id,
        date: row.date,
        note: row.note,
        createdAt: row.created_at,
      }))
      .sort((a: MoodEntry, b: MoodEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else {
    const result = db.getAllSync('SELECT * FROM mood_entries ORDER BY date DESC') as any[];
    return result.map(row => ({
      id: row.id,
      moodId: row.mood_id,
      date: row.date,
      note: row.note,
      createdAt: row.created_at,
    }));
  }
};

export const getActivities = async (): Promise<Activity[]> => {
  if (Platform.OS === 'web') {
    const activities = JSON.parse(await storage.getItem('activities') || '[]');
    return activities
      .map((row: any) => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        category: row.category,
        isGood: row.isGood,
      }))
      .sort((a: Activity, b: Activity) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  } else {
    const result = db.getAllSync('SELECT * FROM activities ORDER BY category, name') as any[];
    return result.map(row => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      category: row.category,
      isGood: row.is_good === 1,
    }));
  }
};

export const getEntryActivities = async (entryId: number): Promise<number[]> => {
  if (Platform.OS === 'web') {
    const entryActivities = JSON.parse(await storage.getItem('entry_activities') || '[]');
    return entryActivities
      .filter((row: any) => row.entry_id === entryId)
      .map((row: any) => row.activity_id);
  } else {
    const result = db.getAllSync('SELECT activity_id FROM entry_activities WHERE entry_id = ?', [entryId]) as any[];
    return result.map(row => row.activity_id);
  }
};

export const getMoodEntryForDate = async (date: string): Promise<MoodEntry | null> => {
  if (Platform.OS === 'web') {
    const entries = JSON.parse(await storage.getItem('mood_entries') || '[]');
    const result = entries.find((entry: any) => entry.date === date);
    if (!result) return null;
    
    return {
      id: result.id,
      moodId: result.mood_id,
      date: result.date,
      note: result.note,
      createdAt: result.created_at,
    };
  } else {
    const result = db.getFirstSync('SELECT * FROM mood_entries WHERE date = ?', [date]) as any;
    if (!result) return null;
    
    return {
      id: result.id,
      moodId: result.mood_id,
      date: result.date,
      note: result.note,
      createdAt: result.created_at,
    };
  }
};

export const deleteMoodEntry = async (id: number) => {
  if (Platform.OS === 'web') {
    // Delete entry activities
    const entryActivities = JSON.parse(await storage.getItem('entry_activities') || '[]');
    const filteredEntryActivities = entryActivities.filter((ea: any) => ea.entry_id !== id);
    await storage.setItem('entry_activities', JSON.stringify(filteredEntryActivities));
    
    // Delete mood entry
    const entries = JSON.parse(await storage.getItem('mood_entries') || '[]');
    const filteredEntries = entries.filter((entry: any) => entry.id !== id);
    await storage.setItem('mood_entries', JSON.stringify(filteredEntries));
  } else {
    const stmt1 = db.prepareSync('DELETE FROM entry_activities WHERE entry_id = ?');
    stmt1.executeSync([id]);
    stmt1.finalizeSync();
    
    const stmt2 = db.prepareSync('DELETE FROM mood_entries WHERE id = ?');
    stmt2.executeSync([id]);
    stmt2.finalizeSync();
  }
};