# Mental Clarity Test Integration

This document describes the integration of the gamified mental clarity test feature.

## Database Schema

Add this table to your Supabase database:

```sql
-- Create mental_clarity_tests table
CREATE TABLE mental_clarity_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  score INTEGER NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'focus',
  duration INTEGER NOT NULL, -- in seconds
  reaction_times INTEGER[] NOT NULL,
  average_reaction_time INTEGER NOT NULL, -- in milliseconds
  accuracy INTEGER NOT NULL, -- percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_mental_clarity_tests_user_date ON mental_clarity_tests(user_id, date);
CREATE INDEX idx_mental_clarity_tests_created_at ON mental_clarity_tests(created_at);

-- Add RLS (Row Level Security)
ALTER TABLE mental_clarity_tests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own tests
CREATE POLICY "Users can view their own mental clarity tests" ON mental_clarity_tests
  FOR SELECT USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own mental clarity tests" ON mental_clarity_tests
  FOR INSERT WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own mental clarity tests" ON mental_clarity_tests
  FOR UPDATE USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own mental clarity tests" ON mental_clarity_tests
  FOR DELETE USING (user_id = current_setting('app.user_id', true));
```

## Features Implemented

### 1. Gamified Reaction Time Test
- **Component**: `ReactionTest.tsx` 
- **Location**: `components/ReactionTest.tsx`
- **Features**:
  - 5 rounds of reaction time testing
  - Random delays (800-2500ms) before "Tap!" appears
  - Scoring system based on reaction time and accuracy
  - False start detection and penalty
  - Animated feedback and visual cues
  - Encouraging messages based on performance

### 2. Mental Clarity Test Modal
- **Component**: `MentalClarityTestModal.tsx`
- **Location**: `components/MentalClarityTestModal.tsx`
- **Features**:
  - Introduction screen with test explanation
  - Full-screen test experience
  - Results display with detailed metrics
  - Performance level badges (Elite, Strong, Good, Developing, Building)
  - Retry functionality
  - Integration with database storage

### 3. Database Integration
- **Service**: Updated `SupabaseService` class in `database/supabase-service.ts`
- **Methods Added**:
  - `insertMentalClarityTest()` - Save test results
  - `getMentalClarityTests()` - Fetch all user's tests
  - `getMentalClarityTestForDate()` - Get test for specific date

### 4. State Management
- **Store**: Updated `useMoodStore` hook in `hooks/mood-store.tsx`
- **Added**:
  - `mentalClarityTests` state
  - `addMentalClarityTest()` method
  - Automatic data loading and synchronization

### 5. Home Screen Integration
- **Location**: `app/(tabs)/home.tsx`
- **Integration**:
  - "Take Quick Test" button in Mental Clarity section
  - Modal integration with proper state management
  - Score display after test completion
  - Visual feedback and user experience

## Usage

1. **Taking a Test**:
   - Navigate to the home screen mood entry flow
   - Click "Take Quick Test" in the Mental Clarity section
   - Follow the on-screen instructions
   - Complete 5 rounds of reaction time testing
   - View results and performance level

2. **Test Results**:
   - **Clarity Score**: 1-10 scale based on overall performance
   - **Average Reaction Time**: Mean response time in milliseconds
   - **Accuracy**: Percentage of successful taps (no false starts)
   - **Total Score**: Cumulative score based on reaction times and bonuses

3. **Performance Levels**:
   - **Elite**: Score ≥800, Accuracy ≥90%, Avg Reaction <250ms
   - **Strong**: Score ≥600, Accuracy ≥80%, Avg Reaction <300ms
   - **Good**: Score ≥400, Accuracy ≥70%, Avg Reaction <400ms
   - **Developing**: Score ≥200
   - **Building**: Score <200

## Data Storage

Test results are automatically saved to the database with:
- User ID (from Clerk authentication)
- Test date
- Performance metrics (score, reaction times, accuracy)
- Test metadata (duration, test type)

## Future Enhancements

1. **Analytics Dashboard**: View test history and trends
2. **Additional Test Types**: Memory and processing speed tests
3. **Achievement System**: Unlock badges for consistent testing
4. **Social Features**: Compare scores with friends
5. **Adaptive Difficulty**: Adjust test parameters based on performance
6. **Detailed Insights**: Correlate mental clarity with mood and activities

## File Structure

```
components/
├── ReactionTest.tsx          # Core reaction time test component
├── MentalClarityTestModal.tsx # Modal wrapper with results
└── ...

database/
└── supabase-service.ts       # Database operations

hooks/
└── mood-store.tsx           # State management

app/(tabs)/
└── home.tsx                 # Integration point

lib/
└── supabase.ts              # Database types and config
```

The mental clarity test is now fully integrated and functional within the mood tracking app!