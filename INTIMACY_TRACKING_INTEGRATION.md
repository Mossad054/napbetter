# Intimacy Tracking Integration

This document describes the integration of the intimacy tracking feature for the NapBetter app.

## Database Schema

Add this table to your Supabase database:

```sql
-- Create intimacy_entries table
CREATE TABLE intimacy_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('solo', 'couple')),
  orgasmed BOOLEAN NOT NULL DEFAULT false,
  place TEXT,
  toys BOOLEAN NOT NULL DEFAULT false,
  time_to_sleep INTEGER, -- in minutes
  mood_before INTEGER NOT NULL CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER NOT NULL CHECK (mood_after >= 1 AND mood_after <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_intimacy_entries_user_date ON intimacy_entries(user_id, date);
CREATE INDEX idx_intimacy_entries_created_at ON intimacy_entries(created_at);

-- Add RLS (Row Level Security)
ALTER TABLE intimacy_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own intimacy entries
CREATE POLICY "Users can view their own intimacy entries" ON intimacy_entries
  FOR SELECT USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own intimacy entries" ON intimacy_entries
  FOR INSERT WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own intimacy entries" ON intimacy_entries
  FOR UPDATE USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own intimacy entries" ON intimacy_entries
  FOR DELETE USING (user_id = current_setting('app.user_id', true));
```

## Features Implemented

### 1. Intimacy Tracker Component
- **Component**: `IntimacyTracker.tsx`
- **Location**: `components/IntimacyTracker.tsx`
- **Features**:
  - Minimal, frictionless UI with toggles and sliders
  - Solo or Couple toggle
  - Orgasmed or Not toggle
  - Place intimacy happened (text input)
  - Toys or No Toys toggle
  - Time taken to sleep after intimacy (slider)
  - Mood before intimacy (emoji picker)
  - Mood after intimacy (emoji picker)

### 2. Database Integration
- **Service**: Updated `SupabaseService` class in `database/supabase-service.ts`
- **Methods Added**:
  - `insertIntimacyEntry()` - Save intimacy entry
  - `getIntimacyEntries()` - Fetch all user's intimacy entries
  - `getIntimacyEntryForDate()` - Get intimacy entry for specific date
  - `updateIntimacyEntry()` - Update existing intimacy entry
  - `deleteIntimacyEntry()` - Delete intimacy entry

### 3. State Management
- **Store**: Updated `useMoodStore` hook in `hooks/mood-store.tsx`
- **Added**:
  - `addIntimacyEntry()` method
  - `getIntimacyEntryForDate()` method

### 4. Home Screen Integration
- **Location**: `app/(tabs)/home.tsx`
- **Integration**:
  - "Add Intimacy Details" toggle in mood entry flow
  - Intimacy tracker component integration
  - Automatic saving with mood entry

## Usage

1. **Logging Intimacy**:
   - Navigate to the home screen mood entry flow
   - Select your mood
   - Click "Add Intimacy Details" toggle
   - Fill in the intimacy details
   - Save your mood entry (intimacy data is saved automatically)

2. **Data Fields**:
   - **Type**: Solo or Couple activity
   - **Orgasmed**: Whether orgasm occurred
   - **Place**: Where intimacy happened (text field)
   - **Toys**: Whether toys were used
   - **Time to Sleep**: Minutes taken to fall asleep after intimacy
   - **Mood Before**: Mood rating before intimacy (1-5 scale)
   - **Mood After**: Mood rating after intimacy (1-5 scale)

## Data Storage

Intimacy data is automatically saved to the database with:
- User ID (from Clerk authentication)
- Date of entry
- All intimacy metrics
- Creation timestamp

## Future Enhancements

1. **Analytics Dashboard**: View intimacy history and trends
2. **Correlation Analysis**: Connect intimacy data with mood and sleep patterns
3. **Achievement System**: Unlock badges for consistent tracking
4. **Insights**: Personalized recommendations based on patterns
5. **Privacy Enhancements**: Additional privacy controls and data encryption

## File Structure

```
components/
├── IntimacyTracker.tsx       # Core intimacy tracking component
└── ...

database/
└── supabase-service.ts       # Database operations

hooks/
└── mood-store.tsx           # State management

app/(tabs)/
└── home.tsx                 # Integration point

lib/
└── supabase.ts              # Database types and config

INTIMACY_TRACKING_INTEGRATION.md  # This document
```

The intimacy tracking feature is now fully integrated and functional within the mood tracking app!