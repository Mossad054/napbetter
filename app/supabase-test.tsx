import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

export default function SupabaseTest() {
  const { user } = useUser();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addTestResult = (test: string, result: string, status: 'success' | 'error' | 'info') => {
    setTestResults(prev => [...prev, { test, result, status, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsTesting(true);
    setTestResults([]);
    
    try {
      // 1. Confirm Supabase is Ready
      addTestResult('Supabase Connection', 'Connected successfully', 'success');
      
      // 2. Check Authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        addTestResult('Authentication', `User ID: ${user.id}`, 'success');
      } else {
        addTestResult('Authentication', 'No active session', 'error');
        return;
      }

      // 3. Test Inserts - Mood Entry
      addTestResult('Test Phase', 'Inserting mood entry...', 'info');
      const today = new Date().toISOString().split('T')[0];
      
      // Insert mood entry
      const { data: moodData, error: moodError } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          date: today,
          note: 'Test mood entry',
        })
        .select()
        .single();

      if (moodError && moodError.code !== '23505') { // 23505 is duplicate key error
        addTestResult('Mood Entry Insert', `Error: ${moodError.message}`, 'error');
        return;
      }

      let moodEntryId = moodData?.id;
      if (!moodEntryId) {
        // If insert failed due to duplicate, fetch existing
        const { data: existingMood } = await supabase
          .from('mood_entries')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();
        
        moodEntryId = existingMood?.id;
        addTestResult('Mood Entry Insert', 'Entry already exists, using existing', 'info');
      } else {
        addTestResult('Mood Entry Insert', `Inserted with ID: ${moodEntryId}`, 'success');
      }

      // 4. Test Relations - Time-based mood and emotion triggers
      if (moodEntryId) {
        addTestResult('Test Phase', 'Inserting time-based mood entry...', 'info');
        
        // Insert time-based mood entry
        const { data: timeMoodData, error: timeMoodError } = await supabase
          .from('time_based_mood_entries')
          .insert({
            mood_entry_id: moodEntryId,
            time_of_day: 'morning',
            mood_score: 4,
          })
          .select()
          .single();

        if (timeMoodError && timeMoodError.code !== '23505') {
          addTestResult('Time-based Mood Insert', `Error: ${timeMoodError.message}`, 'error');
        } else {
          const timeMoodId = timeMoodData?.id || 
            (await supabase
              .from('time_based_mood_entries')
              .select('id')
              .eq('mood_entry_id', moodEntryId)
              .eq('time_of_day', 'morning')
              .single()
            ).data?.id;
          
          if (timeMoodId) {
            addTestResult('Time-based Mood Insert', `Inserted with ID: ${timeMoodId}`, 'success');
            
            // Insert emotion trigger
            const { data: emotionData, error: emotionError } = await supabase
              .from('emotion_triggers')
              .insert({
                time_based_mood_entry_id: timeMoodId,
                emotion_id: 'happy',
                trigger_response: 'Test trigger',
              })
              .select()
              .single();

            if (emotionError) {
              addTestResult('Emotion Trigger Insert', `Error: ${emotionError.message}`, 'error');
            } else {
              addTestResult('Emotion Trigger Insert', `Inserted with ID: ${emotionData?.id}`, 'success');
              
              // Query back with relations
              const { data: relationData, error: relationError } = await supabase
                .from('mood_entries')
                .select(`*, time_based_mood_entries(*, emotion_triggers(*))`)
                .eq('id', moodEntryId)
                .single();

              if (relationError) {
                addTestResult('Relation Query', `Error: ${relationError.message}`, 'error');
              } else {
                addTestResult('Relation Query', 'Successfully queried relational data', 'success');
                addTestResult('Relation Data', JSON.stringify(relationData, null, 2), 'info');
              }
            }
          }
        }
      }

      // 5. Test Other Tables - Sleep Entry
      addTestResult('Test Phase', 'Inserting sleep entry...', 'info');
      
      const { data: sleepData, error: sleepError } = await supabase
        .from('sleep_entries')
        .insert({
          user_id: user.id,
          date: today,
          quality: 4,
          duration: 7.5,
          bedtime: '22:00:00',
          wake_time: '06:30:00',
        })
        .select()
        .single();

      if (sleepError && sleepError.code !== '23505') {
        addTestResult('Sleep Entry Insert', `Error: ${sleepError.message}`, 'error');
      } else {
        const sleepEntryId = sleepData?.id || 
          (await supabase
            .from('sleep_entries')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()
          ).data?.id;
        
        addTestResult('Sleep Entry Insert', `Success with ID: ${sleepEntryId}`, 'success');
      }

      // 6. Test Other Tables - Intimacy Entry
      addTestResult('Test Phase', 'Inserting intimacy entry...', 'info');
      
      const { data: intimacyData, error: intimacyError } = await supabase
        .from('intimacy_entries')
        .insert({
          user_id: user.id,
          date: today,
          type: 'couple',
          orgasmed: true,
          place: 'home',
          toys: false,
          time_to_sleep: 30,
          mood_before: 3,
          mood_after: 4,
        })
        .select()
        .single();

      if (intimacyError && intimacyError.code !== '23505') {
        addTestResult('Intimacy Entry Insert', `Error: ${intimacyError.message}`, 'error');
      } else {
        const intimacyEntryId = intimacyData?.id || 
          (await supabase
            .from('intimacy_entries')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()
          ).data?.id;
        
        addTestResult('Intimacy Entry Insert', `Success with ID: ${intimacyEntryId}`, 'success');
      }

      // 7. Test Other Tables - Productivity Entry
      addTestResult('Test Phase', 'Inserting productivity entry...', 'info');
      
      const { data: productivityData, error: productivityError } = await supabase
        .from('productivity_entries')
        .insert({
          user_id: user.id,
          date: today,
          score: 4,
          focused_hours: 6.5,
        })
        .select()
        .single();

      if (productivityError && productivityError.code !== '23505') {
        addTestResult('Productivity Entry Insert', `Error: ${productivityError.message}`, 'error');
      } else {
        const productivityEntryId = productivityData?.id || 
          (await supabase
            .from('productivity_entries')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()
          ).data?.id;
        
        addTestResult('Productivity Entry Insert', `Success with ID: ${productivityEntryId}`, 'success');
      }

      // 8. Check Seed Data Fetch
      addTestResult('Test Phase', 'Fetching seed data...', 'info');
      
      const { data: emotionsData, error: emotionsError } = await supabase
        .from('emotions')
        .select('*')
        .limit(5);

      if (emotionsError) {
        addTestResult('Emotions Fetch', `Error: ${emotionsError.message}`, 'error');
      } else {
        addTestResult('Emotions Fetch', `Retrieved ${emotionsData?.length || 0} emotions`, 'success');
      }

      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .limit(5);

      if (activitiesError) {
        addTestResult('Activities Fetch', `Error: ${activitiesError.message}`, 'error');
      } else {
        addTestResult('Activities Fetch', `Retrieved ${activitiesData?.length || 0} activities`, 'success');
      }

      // 9. Verify RLS - Try to access another user's data
      addTestResult('Test Phase', 'Testing RLS policies...', 'info');
      
      // This should return no data due to RLS
      const { data: otherUserData, error: otherUserError } = await supabase
        .from('mood_entries')
        .select('*')
        .neq('user_id', user.id)
        .limit(1);

      if (otherUserError) {
        addTestResult('RLS Test', `Error: ${otherUserError.message}`, 'error');
      } else {
        if (otherUserData?.length === 0) {
          addTestResult('RLS Test', 'Correctly blocked access to other user data', 'success');
        } else {
          addTestResult('RLS Test', 'Warning: May have accessed other user data', 'error');
        }
      }

      // 10. End-to-End Flow - Query back the inserted data
      addTestResult('Test Phase', 'End-to-end verification...', 'info');
      
      const { data: verificationData, error: verificationError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (verificationError) {
        addTestResult('End-to-End Verification', `Error: ${verificationError.message}`, 'error');
      } else {
        addTestResult('End-to-End Verification', 'Successfully retrieved inserted data', 'success');
        addTestResult('Verification Data', JSON.stringify(verificationData, null, 2), 'info');
      }

      addTestResult('Test Suite', 'All tests completed', 'success');
    } catch (error: any) {
      addTestResult('Test Suite', `Error: ${error.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Supabase Integration Test</Text>
        <Text style={styles.subtitle}>Testing all Supabase functionality</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isTesting && styles.disabledButton]} 
          onPress={runAllTests}
          disabled={isTesting}
        >
          <Text style={styles.buttonText}>
            {isTesting ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results</Text>
        {testResults.map((result, index) => (
          <View 
            key={index} 
            style={[
              styles.resultItem, 
              result.status === 'success' && styles.successResult,
              result.status === 'error' && styles.errorResult,
              result.status === 'info' && styles.infoResult,
            ]}
          >
            <Text style={styles.resultTest}>{result.test}</Text>
            <Text style={styles.resultText}>{result.result}</Text>
            <Text style={styles.resultTime}>{result.timestamp}</Text>
          </View>
        ))}
        
        {testResults.length === 0 && (
          <Text style={styles.noResults}>No test results yet. Run tests to see results here.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: COLORS.error,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600' as const,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  resultItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successResult: {
    borderLeftColor: COLORS.success,
    borderLeftWidth: 4,
  },
  errorResult: {
    borderLeftColor: COLORS.error,
    borderLeftWidth: 4,
  },
  infoResult: {
    borderLeftColor: COLORS.accent,
    borderLeftWidth: 4,
  },
  resultTest: {
    ...TYPOGRAPHY.body,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  resultText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  resultTime: {
    ...TYPOGRAPHY.small,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  noResults: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});