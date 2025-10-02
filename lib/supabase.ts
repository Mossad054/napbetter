import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable Supabase auth since we're using Clerk
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Database Types (these will match your Supabase schema)
export interface SupabaseMoodEntry {
  id: number;
  user_id: string;
  mood_id: number;
  date: string;
  note?: string;
  created_at: string;
}

export interface SupabaseActivity {
  id: number;
  name: string;
  icon: string;
  category: string;
  is_good: boolean;
}

export interface SupabaseEntryActivity {
  id: number;
  entry_id: number;
  activity_id: number;
}

export interface SupabaseIntimacyEntry {
  id: number;
  user_id: string;
  date: string;
  type: 'solo' | 'couple';
  orgasmed: boolean;
  place: string;
  toys: boolean;
  time_to_sleep: number;
  mood_before: number;
  mood_after: number;
  created_at: string;
}

export interface SupabaseSleepEntry {
  id: number;
  user_id: string;
  date: string;
  quality: number;
  duration?: number;
  bedtime?: string;
  wake_time?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseJournalEntry {
  id: number;
  user_id: string;
  template_id: string;
  responses: string[];
  triggers: string[];
  created_at: string;
}
